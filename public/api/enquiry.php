<?php
/*
 * AI Sutra website: receives the contact form, emails it, and optionally creates an ERPNext Lead.
 * Settings live in config.php beside this file.
 */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(int $code, array $body): void { http_response_code($code); echo json_encode($body); exit; }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond(405, ['ok' => false, 'error' => 'method']);

$config = require __DIR__ . '/config.php';
// Enquiry backups: outside the web folder when the server provides one (e.g. /var/www/aisutra/data on the VPS).
$dataDir = $config['data_dir'] ?? (is_dir(dirname(__DIR__, 2) . '/data') ? dirname(__DIR__, 2) . '/data' : __DIR__ . '/data');

// ---- Read and validate input ----
$raw = file_get_contents('php://input', false, null, 0, 20000);
$in = json_decode($raw ?: '', true);
if (!is_array($in)) $in = $_POST;

$clean = function ($v, int $max): string {
    $v = is_string($v) ? $v : '';
    $v = str_replace(["\r", "\0"], '', $v);
    return mb_substr(trim($v), 0, $max);
};
$f = [
    'name'     => $clean($in['name'] ?? '', 120),
    'company'  => $clean($in['company'] ?? '', 160),
    'email'    => $clean($in['email'] ?? '', 160),
    'phone'    => $clean($in['phone'] ?? '', 40),
    'interest' => $clean($in['interest'] ?? '', 160),
    'message'  => $clean($in['message'] ?? '', 4000),
    'page'     => $clean($in['page'] ?? '', 120),
];
$honeypot = $clean($in['website'] ?? '', 200);
$consent = !empty($in['consent']);

// Bots fill the hidden field: pretend success, send nothing.
if ($honeypot !== '') respond(200, ['ok' => true]);

foreach (['name', 'company', 'email'] as $k) {
    if ($f[$k] === '') respond(422, ['ok' => false, 'error' => 'missing', 'field' => $k]);
}
if (!filter_var($f['email'], FILTER_VALIDATE_EMAIL)) respond(422, ['ok' => false, 'error' => 'email']);
if (!$consent) respond(422, ['ok' => false, 'error' => 'consent']);
foreach (['name', 'company', 'email', 'phone', 'interest'] as $k) $f[$k] = str_replace("\n", ' ', $f[$k]);

// ---- Simple rate limit per IP ----
if (!is_dir($dataDir)) @mkdir($dataDir, 0750, true);
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = $dataDir . '/rate.json';
$now = time();
$rates = is_file($rateFile) ? (json_decode((string)@file_get_contents($rateFile), true) ?: []) : [];
foreach ($rates as $k => $times) { $rates[$k] = array_values(array_filter((array)$times, fn($t) => $t > $now - 3600)); if (!$rates[$k]) unset($rates[$k]); }
$key = hash('sha256', $ip);
if (count($rates[$key] ?? []) >= (int)($config['max_per_hour'] ?? 5)) respond(429, ['ok' => false, 'error' => 'rate']);
$rates[$key][] = $now;
@file_put_contents($rateFile, json_encode($rates), LOCK_EX);

$when = date('Y-m-d H:i:s');

// ---- Keep a copy ----
if (!empty($config['keep_copy'])) {
    $csv = $dataDir . '/enquiries.csv';
    $new = !is_file($csv);
    if ($h = @fopen($csv, 'a')) {
        if ($new) fputcsv($h, ['received', 'name', 'company', 'email', 'phone', 'interest', 'message', 'page']);
        fputcsv($h, [$when, $f['name'], $f['company'], $f['email'], $f['phone'], $f['interest'], $f['message'], $f['page']]);
        fclose($h);
    }
}

// ---- Email ----
$subject = ($config['subject_prefix'] ?? 'Website enquiry') . ': ' . $f['company'] . ' (' . $f['name'] . ')';
$body = "New enquiry from the AI Sutra website\n\n"
      . "Name:       {$f['name']}\n"
      . "Company:    {$f['company']}\n"
      . "Email:      {$f['email']}\n"
      . "Phone:      {$f['phone']}\n"
      . "Interested: {$f['interest']}\n"
      . "Page:       {$f['page']}\n"
      . "Received:   {$when}\n\n"
      . "Message:\n{$f['message']}\n";

$recipients = array_filter(array_map('trim', explode(',', (string)($config['to_email'] ?? ''))));
$sent = false;
$mode = $config['mode'] ?? 'mail';

if ($mode === 'smtp') {
    require_once __DIR__ . '/lib/PHPMailer/Exception.php';
    require_once __DIR__ . '/lib/PHPMailer/PHPMailer.php';
    require_once __DIR__ . '/lib/PHPMailer/SMTP.php';
    try {
        $m = new PHPMailer\PHPMailer\PHPMailer(true);
        $s = $config['smtp'];
        $m->isSMTP();
        $m->Host = $s['host']; $m->Port = (int)$s['port']; $m->SMTPAuth = true;
        $m->Username = $s['username']; $m->Password = $s['password'];
        $m->SMTPSecure = ($s['secure'] ?? 'ssl') === 'tls' ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
        $m->CharSet = 'UTF-8';
        $m->setFrom($s['username'], $config['from_name'] ?? 'Website');
        foreach ($recipients as $r) $m->addAddress($r);
        $m->addReplyTo($f['email'], $f['name']);
        $m->Subject = $subject;
        $m->Body = $body;
        $sent = $m->send();
    } catch (Throwable $e) {
        error_log('AI Sutra enquiry SMTP error: ' . $e->getMessage());
    }
} else {
    $from = $config['from_email'] ?? 'no-reply@localhost';
    $headers = [
        'From: ' . mb_encode_mimeheader($config['from_name'] ?? 'Website') . " <{$from}>",
        'Reply-To: ' . $f['email'],
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
    ];
    $sent = $recipients ? @mail(implode(',', $recipients), mb_encode_mimeheader($subject), $body, implode("\r\n", $headers), '-f' . $from) : false;
}

// ---- Optional: ERPNext Lead ----
$erp = $config['erpnext'] ?? [];
$leadCreated = false;
if (!empty($erp['enabled']) && !empty($erp['url']) && function_exists('curl_init')) {
    $call = function (string $path, array $payload) use ($erp) {
        $ch = curl_init(rtrim($erp['url'], '/') . $path);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 12,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Accept: application/json', 'Authorization: token ' . $erp['api_key'] . ':' . $erp['api_secret']],
            CURLOPT_POSTFIELDS => json_encode($payload),
        ]);
        $res = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
        return [$code, json_decode((string)$res, true)];
    };
    $lead = ['lead_name' => $f['name'], 'company_name' => $f['company'], 'email_id' => $f['email']];
    if ($f['phone'] !== '') $lead['mobile_no'] = $f['phone'];
    if (!empty($erp['lead_source'])) $lead['source'] = $erp['lead_source'];
    [$code, $res] = $call('/api/resource/Lead', $lead);
    if ($code >= 200 && $code < 300 && !empty($res['data']['name'])) {
        $leadCreated = true;
        $note = "Website enquiry ({$when})\nInterested in: {$f['interest']}\n\n{$f['message']}";
        $call('/api/resource/Comment', ['comment_type' => 'Comment', 'reference_doctype' => 'Lead', 'reference_name' => $res['data']['name'], 'content' => nl2br(htmlspecialchars($note))]);
    } else {
        error_log('AI Sutra enquiry ERPNext error: HTTP ' . $code);
    }
}

if ($sent || $leadCreated) respond(200, ['ok' => true]);
respond(502, ['ok' => false, 'error' => 'delivery']);
