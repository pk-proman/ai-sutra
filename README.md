# AI Sutra website

The AI Sutra website (AI Sutra™: The Neural Fabric for Industrial Excellence), built with React, Vite and Tailwind. Every push to `main` builds the site and deploys it to the Hostinger VPS automatically through GitHub Actions.

```
Edit on GitHub ──► commit to main ──► GitHub Actions builds the site ──► copies it to the VPS over SSH (rsync)
```

A deploy takes about 2 to 3 minutes. Progress shows in the **Actions** tab, and a red cross there means the live site was not changed.

On the VPS, nginx serves the site from `/var/www/aisutra/public`. PHP-FPM runs only the enquiry form (`/api/enquiry.php`). Enquiry backups are kept outside the web folder in `/var/www/aisutra/data/enquiries.csv`.

## One-time setup (about 15 minutes, all in the terminal)

Replace `VPS_IP`, `yourdomain.com` and `OWNER/REPO` below with your values.

### 1. Find the VPS address
In hPanel, open **VPS → Overview** and note the **IP address** and the **root** SSH login. If you use Hostinger's command-line tool (`brew install hostinger/tap/hostinger`), you can list your VPS with `hostinger vps --help`.

### 2. Create a deploy key on your computer
This key is used only by GitHub to upload the website. Your own root login is not shared.
```bash
ssh-keygen -t ed25519 -f ~/.ssh/aisutra_deploy -N "" -C "aisutra-github-deploy"
```

### 3. Prepare the VPS
Copy the setup script to the VPS and run it as root:
```bash
scp scripts/server/setup-vps.sh root@VPS_IP:/root/
ssh root@VPS_IP "bash /root/setup-vps.sh yourdomain.com '$(cat ~/.ssh/aisutra_deploy.pub)' prashant.c.kumar@gmail.com"
```
The script:
- installs nginx and PHP;
- creates a `deploy` user that only your deploy key can log in to;
- adds the site for `yourdomain.com` and `www.yourdomain.com` without touching other sites on the server;
- gets a free SSL certificate if the domain already points to the VPS.

It stops without changing anything if another web server or panel (Apache, Docker, CloudPanel, Coolify) already owns ports 80/443.

**No domain yet?** Pass the VPS IP with a port instead of the domain, and leave out the email. The site is then served at `http://VPS_IP:3010`, separate from anything else nginx already serves on the VPS:
```bash
ssh root@VPS_IP "bash /root/setup-vps.sh VPS_IP:3010 '$(cat ~/.ssh/aisutra_deploy.pub)'"
```
If the page doesn't open, allow TCP port 3010 in **hPanel → VPS → Security → Firewall** (if a firewall is enabled there). Set `SITE_URL` to `http://VPS_IP:3010` in step 6. When the domain is bought, do step 4, run the script again with the domain and your email (this adds SSL on the standard ports), and change `SITE_URL` to `https://yourdomain.com`. Until then the site runs without HTTPS, so treat it as a preview rather than the public launch.

### 4. Point the domain to the VPS
In your domain's DNS, set an **A record** for `@` and for `www` to `VPS_IP`. If the domain is with Hostinger, this is under **hPanel → Domains → DNS**. After the DNS change takes effect (minutes to a few hours), get the SSL certificate:
```bash
ssh root@VPS_IP "certbot --nginx -d yourdomain.com -d www.yourdomain.com --agree-tos -m prashant.c.kumar@gmail.com --redirect"
```

### 5. Gmail app password for enquiry emails
A VPS has no mail server, so the site sends enquiry emails through Gmail:
1. Turn on 2-Step Verification for prashant.c.kumar@gmail.com.
2. Create an **App password** at https://myaccount.google.com/apppasswords. It is a 16-character code.

### 6. Store the secrets in GitHub
With the GitHub CLI (`gh auth login` first):
```bash
REPO=OWNER/REPO
gh secret set SSH_HOST        --repo $REPO --body "VPS_IP"
gh secret set SSH_USER        --repo $REPO --body "deploy"
gh secret set SSH_PRIVATE_KEY --repo $REPO < ~/.ssh/aisutra_deploy
gh secret set SSH_KNOWN_HOSTS --repo $REPO --body "$(ssh-keyscan -H VPS_IP 2>/dev/null)"
gh secret set SMTP_PASSWORD   --repo $REPO          # paste the Gmail app password when prompted
gh variable set SITE_URL      --repo $REPO --body "https://yourdomain.com"
# only if SSH on the VPS is not on port 22:
# gh variable set SSH_PORT    --repo $REPO --body "2222"
```
You can also add these on GitHub under **Settings → Secrets and variables → Actions**.

### 7. First deploy
```bash
gh workflow run "Deploy to Hostinger VPS" --repo $REPO
gh run watch --repo $REPO
```
Then open https://yourdomain.com and send a test enquiry.

## Everyday changes (from the GitHub website, no tools needed)

Open the file on GitHub, click the pencil icon, edit, then **Commit changes**. The site updates a few minutes later.

| What | File |
|---|---|
| Where enquiries are emailed (`to_email`), sending account, ERPNext on/off | `public/api/config.php` |
| Contact details shown on the site (email, phone, WhatsApp, office) | `public/content/site.json` |
| Product catalogue | `public/content/products.json` |
| Page text and design | `src/app.js` (Claude can make these changes for you) |

The deploy checks that the JSON files are valid before publishing, so a missing comma stops the deploy instead of breaking the live catalogue.

**Optional, ERPNext:** set `'enabled' => true` under `erpnext` in `config.php`, then add the GitHub secrets `ERPNEXT_API_KEY` and `ERPNEXT_API_SECRET`. These come from an ERPNext user allowed to create Leads (**User → API Access → Generate Keys**).

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
