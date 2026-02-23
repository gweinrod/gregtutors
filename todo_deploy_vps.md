# Deploy Greg Tutors to IONOS VPS

This app is a **Next.js 15** site with **Supabase** (auth + DB), **Resend** (email), and **reCAPTCHA v3**. The build uses `output: 'standalone'`, so you deploy a single Node server (no separate static export). Below: the plan, then concrete steps for **you** (on the VPS / DNS / Supabase) and for **the repo** (scripts/config to add).

---

## Plan (high level)

1. **VPS** – IONOS VPS (Linux, e.g. Ubuntu 22.04) with Node.js 18+, Nginx (reverse proxy), and PM2 (process manager).
2. **Domain** – Point your domain (e.g. `gregtutors.com`) A/AAAA to the VPS IP.
3. **SSL** – Use Let’s Encrypt (Certbot) so the site is served over HTTPS.
4. **App on VPS** – Clone repo → install deps → `next build` → run `node .next/standalone/server.js` (or the start script) with PM2, port 4200 (or 3000).
5. **Nginx** – Proxy `https://yourdomain.com` → `http://127.0.0.1:4200`.
6. **Env** – All production env vars (Supabase, Resend, reCAPTCHA, OAuth, etc.) set on the server (e.g. `.env.production` or PM2 ecosystem env).
7. **OAuth / Supabase** – Add production site URL and domain to Supabase redirect URLs and to Google OAuth authorized origins.

No database runs on the VPS; Supabase stays in the cloud. Email (Resend) and reCAPTCHA are already external services.

---

## Steps YOU need to take

### 1. IONOS VPS and SSH

- [ ] Create an IONOS VPS (e.g. Ubuntu 22.04 LTS), note the **public IP**.
- [ ] Add your SSH key in the IONOS panel (or use password auth initially).
- [ ] SSH in: `ssh root@YOUR_VPS_IP` (or your user if you created one).

### 2. Domain DNS

- [ ] In IONOS (or your DNS provider), add an **A record**: host `@` (or `www` if you prefer) → VPS public IP.
- [ ] Optional: add **AAAA** if you have IPv6. Wait for DNS to propagate (up to 24–48 hours, often minutes).

### 3. Server setup (run on the VPS)

- [ ] Update system:  
  `sudo apt update && sudo apt upgrade -y`
- [ ] Install Node.js 20 (LTS):  
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
  node -v   # should be v20.x
  ```
- [ ] Install Nginx and Certbot:  
  `sudo apt install -y nginx certbot python3-certbot-nginx`
- [ ] Install PM2 globally:  
  `sudo npm install -g pm2`

### 4. Deploy the app on the VPS

- [ ] Clone the repo (or upload files). Example with git:  
  ```bash
  cd /var/www  # or e.g. /opt
  sudo mkdir -p gregtutors && sudo chown $USER:$USER gregtutors
  git clone https://github.com/YOUR_USER/gregtutors.git gregtutors
  cd gregtutors
  ```
- [ ] Create production env file (do **not** commit this):  
  ```bash
  cp .env.example .env.production
  nano .env.production   # or vim
  ```
- [ ] Set **all** required variables in `.env.production` (see “Env vars to set” below). Important:
  - `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` (your real domain, no trailing slash).
  - Supabase URL/keys, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_NOTIFY_EMAIL`, Resend, reCAPTCHA, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, etc.
- [ ] Install dependencies and build:  
  ```bash
  npm ci
  npm run build
  ```
- [ ] Start with PM2 (from repo root; Next.js will load `.env.production` when `NODE_ENV=production`):  
  ```bash
  pm2 start ecosystem.config.cjs
  pm2 save
  pm2 startup   # enable PM2 on boot (run the command it prints)
  ```

### 5. Nginx and SSL

- [ ] Create Nginx site config (replace `yourdomain.com` and adjust path if different):  
  ```bash
  sudo nano /etc/nginx/sites-available/gregtutors
  ```
  Paste (then fix domain and path):

  ```nginx
  server {
      listen 80;
      server_name yourdomain.com www.yourdomain.com;
      location / {
          proxy_pass http://127.0.0.1:4200;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
          proxy_cache_bypass $http_upgrade;
      }
  }
  ```

- [ ] Enable site and reload Nginx:  
  ```bash
  sudo ln -s /etc/nginx/sites-available/gregtutors /etc/nginx/sites-enabled/
  sudo nginx -t && sudo systemctl reload nginx
  ```
- [ ] Get SSL certificate:  
  `sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com`  
  (Use HTTPS only when Certbot offers it.)

### 6. Supabase and Google OAuth

- [ ] **Supabase** → Project → Auth → URL Configuration:
  - Add `https://yourdomain.com` and `https://www.yourdomain.com` to **Site URL** and **Redirect URLs**.
- [ ] **Google Cloud Console** → APIs & Services → Credentials → your OAuth 2.0 Client:
  - **Authorized JavaScript origins**: add `https://yourdomain.com` and `https://www.yourdomain.com`.
  - **Authorized redirect URIs**: add Supabase callback URL (e.g. `https://YOUR_PROJECT.supabase.co/auth/v1/callback`; Supabase shows it in Auth → Providers → Google).

### 7. Firewall (recommended)

- [ ] Allow SSH, HTTP, HTTPS; block everything else:  
  ```bash
  sudo ufw allow 22
  sudo ufw allow 80
  sudo ufw allow 443
  sudo ufw enable
  sudo ufw status
  ```

### 8. Verify and maintain

- [ ] Open `https://yourdomain.com` and test: login (Google), schedule, contact form, classes.
- [ ] Set a reminder to renew SSL (Certbot usually adds a cron job; confirm with `sudo systemctl status certbot.timer` or `crontab -l`).

---

## Env vars to set on the VPS (`.env.production`)

Use the same names as `.env.example` / `.env.local`. At minimum:

| Variable | Purpose |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` (production URL) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | For admin list-users / add-client / backfill (optional but recommended) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `ADMIN_NOTIFY_EMAIL` | Admin email (schedule admin, notifications) |
| `RESEND_API_KEY` | Resend API key (contact form / notify) |
| `NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY` | reCAPTCHA v3 site key |
| `RECAPTCHA_V3_SECRET_KEY` | reCAPTCHA v3 secret (server-side) |

Plus any `NEXT_PUBLIC_*` or other vars you use in production (site title, calendar URL, etc.). Do **not** commit `.env.production`; keep it only on the server.

---

## Steps the REPO / I have taken (code and config)

- [x] **PM2 ecosystem file**  
  Added `ecosystem.config.cjs`. On the server you run `pm2 start ecosystem.config.cjs`. It starts Next.js with `next start -p 4200` and `NODE_ENV=production` (Next.js then loads `.env.production` automatically).

- [x] **Start script**  
  `npm run start` already runs `next start -p 4200`. With `output: 'standalone'` in `next.config.js`, the build is optimized for production; `next start` serves it. Nginx should proxy to port **4200**.

- [x] **Deploy checklist**  
  This file is the checklist: build (`npm run build`), env (`.env.production`), start (`pm2 start ecosystem.config.cjs`), Nginx → port 4200.

---

## Quick reference after setup

| Task | Command |
|------|--------|
| Build | `npm ci && npm run build` |
| Start app | `pm2 start ecosystem.config.cjs` |
| Logs | `pm2 logs gregtutors` |
| Restart | `pm2 restart gregtutors` |
| Reload after git pull | `git pull && npm ci && npm run build && pm2 restart gregtutors` |

---

## Summary

- **You:** VPS + DNS + server packages (Node, Nginx, PM2, Certbot), clone repo, create `.env.production`, build, PM2 start, Nginx config, Certbot SSL, Supabase/Google URLs, firewall.
- **Repo/I:** Optional PM2 ecosystem file, confirm standalone build/start, document deploy steps and env in this file or `DEPLOY.md`.

Once both sides are done, the site will be served over HTTPS on your domain with Supabase, Resend, and reCAPTCHA working in production.
