<?php
/*
 * AI Sutra website: enquiry settings.
 * Edit this file on GitHub (public/api/config.php) and commit: the site redeploys automatically.
 * Passwords and API keys never go here. Add them as GitHub secrets (SMTP_PASSWORD, ERPNEXT_API_KEY,
 * ERPNEXT_API_SECRET); the deploy writes them to api/config.local.php on the server, which overrides this file.
 */
$config = [

    // Where website enquiries are sent. Add more addresses separated by commas.
    'to_email' => 'prashant.c.kumar@gmail.com',

    // Subject line prefix for enquiry emails.
    'subject_prefix' => 'AI Sutra website enquiry',

    // How email is sent:
    //   'mail' = Hostinger's built-in PHP mail (works straight away; may land in spam at first).
    //   'smtp' = send through a mailbox on your domain (recommended once you create one in hPanel > Emails).
    'mode' => 'mail',

    // Sender for 'mail' mode. Use an address on your own domain, e.g. no-reply@yourdomain.com.
    'from_email' => 'no-reply@yourdomain.com',
    'from_name'  => 'AI Sutra Website',

    // Only used when 'mode' => 'smtp'. Hostinger mailbox settings: host smtp.hostinger.com, port 465, SSL.
    'smtp' => [
        'host'     => 'smtp.hostinger.com',
        'port'     => 465,
        'secure'   => 'ssl',            // 'ssl' for port 465, 'tls' for port 587
        'username' => 'no-reply@yourdomain.com',
        'password' => '',               // set as the GitHub secret SMTP_PASSWORD
    ],

    // Optional: also create a Lead in ERPNext for every enquiry.
    'erpnext' => [
        'enabled'     => false,
        'url'         => 'https://your-erpnext-site.com',   // no trailing slash
        'api_key'     => '',            // set as the GitHub secret ERPNEXT_API_KEY
        'api_secret'  => '',            // set as the GitHub secret ERPNEXT_API_SECRET
        'lead_source' => '',            // e.g. 'Website' if that Lead Source exists in ERPNext; leave empty to skip
    ],

    // Spam protection: maximum enquiries per visitor (IP address) per hour.
    'max_per_hour' => 5,

    // Keep a copy of every enquiry in api/data/enquiries.csv (not publicly accessible).
    'keep_copy' => true,
];

// Server-only overrides (secrets), written by the deploy workflow or created by hand in File Manager.
if (is_file(__DIR__ . '/config.local.php')) {
    $config = array_replace_recursive($config, require __DIR__ . '/config.local.php');
}
return $config;
