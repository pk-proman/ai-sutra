<?php
/*
 * AI Sutra website: enquiry settings.
 * Edit this file on GitHub (public/api/config.php) and commit: the site redeploys automatically.
 * On the server it lives at /var/www/aisutra/public/api/config.php.
 * Passwords and API keys never go here. Add them as GitHub secrets (SMTP_PASSWORD, ERPNEXT_API_KEY,
 * ERPNEXT_API_SECRET); the deploy writes them to api/config.local.php on the server, which overrides this file.
 */
$config = [

    // Where website enquiries are sent. Add more addresses separated by commas.
    'to_email' => 'prashant.c.kumar@gmail.com',

    // Subject line prefix for enquiry emails.
    'subject_prefix' => 'AI Sutra website enquiry',

    // How email is sent. On a VPS there is no built-in mail server, so use 'smtp'.
    //   'smtp' = send through an email account (default: Gmail with an app password).
    //   'mail' = the server's own PHP mail(); only works if the VPS has a mail server set up.
    'mode' => 'smtp',

    'from_name' => 'AI Sutra Website',
    'from_email' => 'no-reply@yourdomain.com',   // only used in 'mail' mode

    // SMTP account that sends the enquiry emails.
    // Gmail: turn on 2-Step Verification, create an App Password at https://myaccount.google.com/apppasswords,
    // and save it as the GitHub secret SMTP_PASSWORD. Never put the password in this file.
    'smtp' => [
        'host'     => 'smtp.gmail.com',
        'port'     => 587,
        'secure'   => 'tls',            // 'tls' for port 587, 'ssl' for port 465
        'username' => 'prashant.c.kumar@gmail.com',
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

// Server-only overrides (secrets), written by the deploy workflow from GitHub secrets.
if (is_file(__DIR__ . '/config.local.php')) {
    $config = array_replace_recursive($config, require __DIR__ . '/config.local.php');
}
return $config;
