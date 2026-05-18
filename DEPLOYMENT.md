# Deployment Guide — Azure VM

This guide walks through deploying BCU AMS on an **Azure Ubuntu VM** with:
- **nginx** as reverse proxy (handles HTTPS and static files)
- **Daphne** as the ASGI server (Django + WebSocket)
- **PM2** to manage the Next.js process
- **PostgreSQL** as the production database
- **Redis** for WebSocket channel layer (multi-process safe)

---

## 1. Provision the Azure VM

1. In the Azure Portal, create a new **Virtual Machine**:
   - Image: **Ubuntu 24.04 LTS**
   - Size: `Standard_B2s` (2 vCPUs, 4 GB RAM) or larger if using face recognition
   - Authentication: **SSH public key** (recommended)
   - Inbound ports: **SSH (22)**, **HTTP (80)**, **HTTPS (443)**

2. Note the **Public IP address** of the VM.

3. (Optional but recommended) Associate a DNS name:
   - In the VM's Networking blade → DNS name label → set e.g. `bcuams`
   - Your domain becomes `bcuams.<region>.cloudapp.azure.com`

---

## 2. Connect to the VM

```bash
ssh -i ~/.ssh/your_key.pem azureuser@<your-vm-ip>
```

---

## 3. Install System Dependencies

```bash
sudo apt update && sudo apt upgrade -y

# Python, pip, venv
sudo apt install -y python3.12 python3.12-venv python3-pip

# Node.js 20 (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# nginx
sudo apt install -y nginx

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# PM2 (Node.js process manager)
sudo npm install -g pm2

# OpenCV system dependencies (for face recognition)
sudo apt install -y libgl1-mesa-glx libglib2.0-0

# (Optional) Git
sudo apt install -y git
```

---

## 4. Clone the Repository

```bash
cd /opt
sudo git clone https://github.com/ToniBirat7/BCU_AMS_CV_Project.git bcuams
sudo chown -R azureuser:azureuser /opt/bcuams
cd /opt/bcuams
```

---

## 5. Configure PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE bcuams;
CREATE USER bcuams_user WITH PASSWORD 'choose_a_strong_password';
ALTER ROLE bcuams_user SET client_encoding TO 'utf8';
ALTER ROLE bcuams_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE bcuams_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE bcuams TO bcuams_user;
\q
```

---

## 6. Configure the Backend

```bash
cd /opt/bcuams/backend

# Create virtual environment
python3.12 -m venv /opt/bcuams/.venv
source /opt/bcuams/.venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Also install psycopg2 for PostgreSQL
pip install psycopg2-binary
```

Create the `.env` file:

```bash
cp .env.example .env
nano .env
```

Fill in:

```env
# Generate with: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
SECRET_KEY=your-generated-secret-key

DEBUG=False
ALLOWED_HOSTS=<your-vm-ip>,bcuams.<region>.cloudapp.azure.com,yourdomain.com

# Update with your actual domain/IP
FRONTEND_URLS=https://yourdomain.com,https://bcuams.<region>.cloudapp.azure.com

# PostgreSQL
DB_ENGINE=django.db.backends.postgresql
DB_NAME=bcuams
DB_USER=bcuams_user
DB_PASSWORD=choose_a_strong_password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379
```

Run database setup:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --no-input
```

---

## 7. Configure the Frontend

```bash
cd /opt/bcuams/frontend

npm install

cp .env.local.example .env.local
nano .env.local
```

Fill in:

```env
# The public URL of your Django backend (accessible from user's browser)
NEXT_PUBLIC_DJANGO_URL=https://yourdomain.com
NEXT_PUBLIC_WS_URL=wss://yourdomain.com

# The internal URL (used by Next.js server-side, same machine = localhost)
DJANGO_INTERNAL_URL=http://127.0.0.1:8000
```

Build Next.js:

```bash
npm run build
```

---

## 8. Create Systemd Service for Daphne

```bash
sudo nano /etc/systemd/system/bcuams-django.service
```

```ini
[Unit]
Description=BCU AMS Django (Daphne ASGI)
After=network.target postgresql.service redis.service

[Service]
User=azureuser
Group=azureuser
WorkingDirectory=/opt/bcuams/backend
Environment="PATH=/opt/bcuams/.venv/bin"
EnvironmentFile=/opt/bcuams/backend/.env
ExecStart=/opt/bcuams/.venv/bin/daphne \
    -b 127.0.0.1 \
    -p 8000 \
    config.asgi:application
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable bcuams-django
sudo systemctl start bcuams-django
sudo systemctl status bcuams-django
```

---

## 9. Start the Next.js Frontend with PM2

```bash
cd /opt/bcuams/frontend

pm2 start npm --name "bcuams-frontend" -- start
pm2 save
pm2 startup   # Follow the printed command to register PM2 on boot
```

Verify:

```bash
pm2 status
pm2 logs bcuams-frontend
```

---

## 10. Configure nginx

```bash
sudo nano /etc/nginx/sites-available/bcuams
```

```nginx
server {
    listen 80;
    server_name yourdomain.com bcuams.<region>.cloudapp.azure.com <your-vm-ip>;

    # Redirect HTTP → HTTPS (uncomment after setting up SSL)
    # return 301 https://$host$request_uri;

    # Static files served directly by nginx
    location /static/ {
        alias /opt/bcuams/backend/staticfiles/;
    }

    location /media/ {
        alias /opt/bcuams/backend/media/;
    }

    # Django API (HTTP)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django WebSocket
    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }

    # Next.js frontend (all other routes)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/bcuams /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Your app should now be accessible at `http://<your-vm-ip>`.

---

## 11. Set Up HTTPS with Let's Encrypt (Recommended)

You need a domain name pointing to your VM's IP for this step.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Certbot will:
1. Verify domain ownership
2. Issue a certificate
3. Automatically update the nginx config with HTTPS

After HTTPS is set up, uncomment the redirect line in your nginx config and update `.env.local`:

```env
NEXT_PUBLIC_DJANGO_URL=https://yourdomain.com
NEXT_PUBLIC_WS_URL=wss://yourdomain.com
```

Rebuild the frontend:

```bash
cd /opt/bcuams/frontend && npm run build
pm2 restart bcuams-frontend
```

---

## 12. Set Up a Webcam (Face Recognition)

The face recognition system requires a **physical webcam attached to the VM**.

> **Azure VMs do not have USB ports** — face recognition via webcam is only possible on a physical machine or an on-premises server, not on a standard Azure VM.

**Alternatives:**
- Deploy on a local Linux server (e.g., a mini PC in the classroom) and expose it via a reverse tunnel (e.g., `ngrok`, Cloudflare Tunnel, or Azure Arc).
- Skip face recognition and use manual attendance only (everything else works on Azure).

If you have a physical server with a webcam, follow all steps above on that machine instead of an Azure VM.

---

## 13. Verify the Deployment

```bash
# Check all services
sudo systemctl status bcuams-django
sudo systemctl status nginx
sudo systemctl status redis-server
sudo systemctl status postgresql
pm2 status

# View Django logs
sudo journalctl -u bcuams-django -f

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View Next.js logs
pm2 logs bcuams-frontend
```

Test the API directly:

```bash
curl http://127.0.0.1:8000/api/whoami/
# Should return: {"error": "Authentication required"}  (401, not a 500)
```

---

## 14. Maintenance

### Update the application

```bash
cd /opt/bcuams
git pull origin master

# Backend
source .venv/bin/activate
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --no-input
sudo systemctl restart bcuams-django

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart bcuams-frontend
```

### Backup the database

```bash
sudo -u postgres pg_dump bcuams > /home/azureuser/bcuams_backup_$(date +%Y%m%d).sql
```

### Rotate the secret key

If you need to rotate `SECRET_KEY`, all active sessions will be invalidated:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# Update SECRET_KEY in /opt/bcuams/backend/.env
sudo systemctl restart bcuams-django
```

---

## Architecture Summary (Production)

```
Internet
    │ HTTPS 443
    ▼
nginx (reverse proxy + SSL termination)
    ├── /static/  → /opt/bcuams/backend/staticfiles/   (direct file serve)
    ├── /media/   → /opt/bcuams/backend/media/          (direct file serve)
    ├── /api/*    → http://127.0.0.1:8000               (Daphne)
    ├── /ws/*     → http://127.0.0.1:8000               (Daphne WebSocket)
    └── /*        → http://127.0.0.1:3000               (Next.js via PM2)

Daphne (port 8000)
    └── Django 5 → PostgreSQL + Redis

PM2 (port 3000)
    └── Next.js 15
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `502 Bad Gateway` | Django or Next.js is not running — check `pm2 status` and `systemctl status bcuams-django` |
| `WebSocket connection failed` | nginx `/ws/` block missing `Upgrade` headers — check nginx config |
| `CSRF verification failed` | `FRONTEND_URLS` in `.env` does not include the exact origin the browser uses |
| `staticfiles not found` | Run `python manage.py collectstatic --no-input` |
| `face recognition crash` | Camera not attached or `cv2.VideoCapture(0)` fails — normal on Azure VM |
| `Redis connection error` | `sudo systemctl start redis-server` — check `REDIS_URL` in `.env` |
