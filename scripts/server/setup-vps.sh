#!/usr/bin/env bash
# One-time setup of a Hostinger VPS (Ubuntu/Debian) to serve the AI Sutra website.
#
# Usage, as root on the VPS:
#   bash setup-vps.sh <domain-or-VPS-IP> "<deploy public key>" [email-for-ssl]
# Examples:
#   bash setup-vps.sh 203.0.113.10:3010 "ssh-ed25519 AAAA... github-deploy"     # no domain yet: own port, beside other sites
#   bash setup-vps.sh 203.0.113.10 "ssh-ed25519 AAAA... github-deploy"          # no domain yet: the IP on port 80
#   bash setup-vps.sh aisutra.in "ssh-ed25519 AAAA... github-deploy" prashant.c.kumar@gmail.com
# Run it again with the domain later; the site switches over and SSL is added.
#
# What it does (safe to run again):
#   - installs nginx, PHP-FPM (for the enquiry form), rsync and certbot
#   - creates a 'deploy' user that GitHub Actions logs in as, with only your deploy key
#   - creates /var/www/aisutra/public (website) and /var/www/aisutra/data (enquiry backups)
#   - adds an nginx site for <domain> and www.<domain> (or for the bare IP), without touching other sites
#   - gets a free Let's Encrypt SSL certificate if the domain already points to this server
set -euo pipefail

DOMAIN="${1:-}"; PUBKEY="${2:-}"; EMAIL="${3:-}"
ROOT_DIR=/var/www/aisutra
SITE=aisutra
DEPLOY_USER=deploy

say(){ printf '\n\033[1;35m==>\033[0m %s\n' "$*"; }
die(){ printf '\n\033[1;31mStopped:\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || die "run this as root (ssh root@YOUR_VPS_IP)."
[ -n "$DOMAIN" ] && [ -n "$PUBKEY" ] || die "usage: bash setup-vps.sh <domain-or-VPS-IP> \"<deploy public key>\" [email]"
DOMAIN="${DOMAIN#http://}"; DOMAIN="${DOMAIN#https://}"; DOMAIN="${DOMAIN%%/*}"; DOMAIN="${DOMAIN#www.}"
PORT=80; if [[ "$DOMAIN" == *:* ]]; then PORT="${DOMAIN##*:}"; DOMAIN="${DOMAIN%:*}"; fi
[[ "$PORT" =~ ^[0-9]+$ ]] && [ "$PORT" -ge 1 ] && [ "$PORT" -le 65535 ] || die "the port after ':' must be a number, e.g. 203.0.113.10:3010"
IP_MODE=0; [[ "$DOMAIN" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]] && IP_MODE=1
case "$PUBKEY" in ssh-ed25519\ *|ssh-rsa\ *|ecdsa-sha2-*) ;; *) die "the second argument must be the PUBLIC key (starts with ssh-ed25519)." ;; esac
command -v apt-get >/dev/null || die "this script supports Ubuntu/Debian VPS images only."

# ---- Check nothing else owns the port(s) we need ----
port_owners(){ ss -ltnpH "( sport = :$1 )" 2>/dev/null | grep -o 'users:(("[^"]*"' | sed 's/users:(("//; s/"$//' | sort -u || true; }
if [ "$PORT" = 80 ]; then
  say "Checking what is already running on ports 80/443"
  if command -v ss >/dev/null; then
    OWNERS=$( { port_owners 80; port_owners 443; } | sort -u)
    OTHERS=$(printf '%s\n' "$OWNERS" | grep -vx nginx | grep -v '^$' || true)
    [ -z "$OTHERS" ] || die "ports 80/443 are already used by: $(echo $OTHERS). Run the script with a separate port instead, e.g. ${DOMAIN}:3010"
    [ -n "$OWNERS" ] && echo "nginx is already running; the AI Sutra site will be added alongside existing sites." || echo "Ports are free."
  fi
else
  say "Checking port $PORT is free"
  if command -v ss >/dev/null; then
    OWNERS=$(port_owners "$PORT" | grep -v '^$' || true)
    if [ -n "$OWNERS" ]; then
      if [ "$OWNERS" = nginx ] && grep -qs "listen $PORT;" "/etc/nginx/sites-available/$SITE"; then
        echo "Port $PORT is already the AI Sutra site; updating it."
      else
        die "port $PORT is already used by: $(echo $OWNERS). Choose another port, e.g. ${DOMAIN}:3011"
      fi
    else
      echo "Port $PORT is free."
    fi
  fi
fi

# ---- Packages ----
say "Installing nginx, PHP-FPM, rsync and certbot"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx php-fpm php-curl php-mbstring rsync certbot python3-certbot-nginx >/dev/null
PHP_SOCK=$(ls /run/php/php*-fpm.sock 2>/dev/null | sort -V | tail -1 || true)
if [ -z "$PHP_SOCK" ]; then
  PHPV=$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;')
  systemctl enable --now "php${PHPV}-fpm" >/dev/null 2>&1 || service "php${PHPV}-fpm" start || true
  PHP_SOCK="/run/php/php${PHPV}-fpm.sock"
fi
echo "PHP-FPM socket: $PHP_SOCK"

# ---- Deploy user (GitHub Actions logs in as this user) ----
say "Setting up the '$DEPLOY_USER' user for automatic deploys"
id "$DEPLOY_USER" >/dev/null 2>&1 || useradd -m -s /bin/bash "$DEPLOY_USER"
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
AUTH="/home/$DEPLOY_USER/.ssh/authorized_keys"
touch "$AUTH"; grep -qxF "$PUBKEY" "$AUTH" || echo "$PUBKEY" >> "$AUTH"
chown "$DEPLOY_USER:$DEPLOY_USER" "$AUTH"; chmod 600 "$AUTH"

# ---- Folders ----
say "Creating $ROOT_DIR"
install -d -m 755 "$ROOT_DIR"
install -d -m 755 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "$ROOT_DIR/public"
install -d -m 750 -o www-data -g www-data "$ROOT_DIR/data"
if [ ! -f "$ROOT_DIR/public/index.html" ]; then
  echo '<!doctype html><meta charset="utf-8"><title>AI Sutra</title><p style="font-family:sans-serif">AI Sutra: website deploying soon.</p>' > "$ROOT_DIR/public/index.html"
  chown "$DEPLOY_USER:$DEPLOY_USER" "$ROOT_DIR/public/index.html"
fi

# ---- nginx site ----
if [ "$PORT" != 80 ]; then SERVER_NAMES="_"; elif [ "$IP_MODE" = 1 ]; then SERVER_NAMES="$DOMAIN"; else SERVER_NAMES="$DOMAIN www.$DOMAIN"; fi
if [ "$PORT" = 80 ]; then SITE_ADDR="http://$DOMAIN"; else SITE_ADDR="http://$DOMAIN:$PORT"; fi
say "Writing the nginx site ($SITE_ADDR)"
cat > "/etc/nginx/sites-available/$SITE" <<NGINX
# AI Sutra website (managed by scripts/server/setup-vps.sh)
server {
    listen $PORT;
    listen [::]:$PORT;
    server_name $SERVER_NAMES;
    root $ROOT_DIR/public;
    index index.html;
    charset utf-8;
    client_max_body_size 1m;

    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml text/plain;

    # Pages are folders with an index.html: /solutions -> /solutions/
    location / {
        try_files \$uri \$uri/ =404;
    }
    error_page 404 /404.html;

    # The only server-side script: the enquiry form
    location = /api/enquiry.php {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:$PHP_SOCK;
    }
    # Everything else under /api (settings, mail library) is private
    location ^~ /api/ { return 404; }

    # Hidden files (.htaccess etc.)
    location ~ /\. { return 404; }

    # Fingerprinted assets can be cached for a year
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable" always;
        add_header X-Content-Type-Options "nosniff" always;
    }
    location ~* \.(html|json)$ {
        add_header Cache-Control "no-cache" always;
        add_header X-Content-Type-Options "nosniff" always;
    }
}
NGINX
ln -sf "/etc/nginx/sites-available/$SITE" "/etc/nginx/sites-enabled/$SITE"
nginx -t
systemctl reload nginx 2>/dev/null || service nginx reload || service nginx start

# ---- Firewall ----
if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
  say "Opening the website port in the firewall"
  if [ "$PORT" = 80 ]; then ufw allow 'Nginx Full' >/dev/null; else ufw allow "$PORT/tcp" >/dev/null; fi
fi

# ---- SSL ----
SERVER_IP=$(curl -fsS4 https://ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
DNS_IP=""; [ "$IP_MODE" = 1 ] || DNS_IP=$(getent ahostsv4 "$DOMAIN" 2>/dev/null | awk 'NR==1{print $1}' || true)
[ "$IP_MODE" = 1 ] && SERVER_IP="$DOMAIN"
say "SSL certificate"
if [ "$IP_MODE" = 1 ] || [ "$PORT" != 80 ]; then
  echo "Skipped: SSL certificates need a domain name on the standard port. The site is served at $SITE_ADDR for now."
  echo "When the domain is ready, point its A records to $SERVER_IP and run this script again with the domain."
elif [ -n "$EMAIL" ] && [ -n "$DNS_IP" ] && [ "$DNS_IP" = "$SERVER_IP" ]; then
  WWW=(); [ "$(getent ahostsv4 "www.$DOMAIN" | awk 'NR==1{print $1}')" = "$SERVER_IP" ] && WWW=(-d "www.$DOMAIN")
  certbot --nginx -d "$DOMAIN" "${WWW[@]}" --non-interactive --agree-tos -m "$EMAIL" --redirect
else
  echo "Skipped: $DOMAIN points to '${DNS_IP:-nothing}', this server is $SERVER_IP (or no email given)."
  echo "Once the domain's A record points to $SERVER_IP, run:"
  echo "  certbot --nginx -d $DOMAIN -d www.$DOMAIN --agree-tos -m you@example.com --redirect"
fi

say "Done"
cat <<DONE
Website        : $SITE_ADDR
Website folder : $ROOT_DIR/public   (GitHub Actions deploys here)
Enquiry backups: $ROOT_DIR/data/enquiries.csv
Deploy login   : $DEPLOY_USER@$SERVER_IP (same SSH port you used to log in as root)

Add these to the GitHub repository (Settings > Secrets and variables > Actions):
  secret SSH_HOST         = $SERVER_IP
  secret SSH_USER         = $DEPLOY_USER
  secret SSH_PRIVATE_KEY  = the PRIVATE half of the deploy key
  variable SITE_URL       = $( [ "$IP_MODE" = 1 ] || [ "$PORT" != 80 ] && echo "$SITE_ADDR" || echo "https://$DOMAIN" )
  variable SSH_PORT       = only if SSH is not on port 22
DONE
