# AI Sutra website

The AI Sutra website (AI Sutra™: The Neural Fabric for Industrial Excellence), built with React, Vite and Tailwind. Every push to `main` builds the site and deploys it to Hostinger automatically through GitHub Actions.

## How it works

```
Edit on GitHub ──► commit to main ──► GitHub Actions builds the site ──► uploads to Hostinger public_html over FTPS
```

A deploy takes about 2 to 3 minutes. Progress shows in the **Actions** tab, and a red cross there means the live site was not changed.

## One-time setup

### 1. Hostinger FTP details
In **hPanel → Files → FTP Accounts**, note the **FTP hostname** (e.g. `ftp.yourdomain.com` or an IP address) and the **username**, and set or reset the **password**. Also note the **directory** shown for the account. You need it in step 3.

### 2. GitHub secrets
In this repository, go to **Settings → Secrets and variables → Actions → Secrets → New repository secret**, and add:

| Secret | Value |
|---|---|
| `FTP_SERVER` | FTP hostname from hPanel |
| `FTP_USERNAME` | FTP username |
| `FTP_PASSWORD` | FTP password |
| `SMTP_PASSWORD` | *(optional)* password of the mailbox used to send enquiry emails, if `mode` is `smtp` |
| `ERPNEXT_API_KEY`, `ERPNEXT_API_SECRET` | *(optional)* to create ERPNext Leads from enquiries |

### 3. GitHub variables
On the **Variables** tab of the same page, add:

| Variable | Value |
|---|---|
| `SITE_URL` | Your live address, e.g. `https://www.aisutra.in` (no trailing slash). Used for search engines and link previews. |
| `FTP_SERVER_DIR` | *(only if needed)* Where the site goes on the server. Default `./public_html/`. If the FTP account's directory in hPanel already ends in `public_html`, set this to `./`. |
| `FTP_PROTOCOL` | *(only if needed)* Default `ftps`. Change to `ftp` only if the upload step cannot connect. |

### 4. First deploy
Go to **Actions → Deploy to Hostinger → Run workflow**. When it turns green, open your domain. Delete Hostinger's placeholder `default.php` from `public_html` if it is still there. Turn on the free SSL certificate under **hPanel → Security → SSL**.

## Everyday changes (all from the GitHub website, no tools needed)

Open the file on GitHub, click the pencil icon, edit, then **Commit changes**. The site updates a few minutes later.

| What | File |
|---|---|
| Where enquiries are emailed (`to_email`), email sending mode, ERPNext on/off | `public/api/config.php` |
| Contact details shown on the site (email, phone, WhatsApp, office) | `public/content/site.json` |
| Product catalogue | `public/content/products.json` |
| Page text and design | `src/app.js` (Claude can make these changes for you) |

The deploy checks that the JSON files are valid before publishing, so a missing comma stops the deploy instead of breaking the live catalogue.

## Enquiries

The contact form posts to `api/enquiry.php` on Hostinger. That script emails the enquiry, optionally creates an ERPNext Lead, and keeps a backup copy in `api/data/enquiries.csv`. The file is blocked from public access, and deploys never touch it. It also has a spam trap and a limit of 5 enquiries per visitor per hour.

**Email sending:** `'mode' => 'mail'` uses Hostinger's built-in PHP mail; the first emails may go to Gmail spam. For reliable delivery, create a mailbox such as `no-reply@yourdomain.com` in **hPanel → Emails**. Then set `'mode' => 'smtp'` and the mailbox address in `config.php`, and add its password as the `SMTP_PASSWORD` secret.

## Working locally (developers)

```bash
npm install
npx playwright install chromium   # used to pre-render each page for search engines
npm run dev                        # local preview at http://localhost:5173
npm run build                      # production build in dist/
```

## Before launch

- Privacy policy (`/privacy/`): fill in the company legal name, grievance email and date, and have it reviewed.
- Placeholders still on the site: founder surname, the two client credentials, the Proman result figures, and "[Company legal name]" in the footer.
