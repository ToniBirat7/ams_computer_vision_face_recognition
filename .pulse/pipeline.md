# BCU AMS — Working Pipeline

> Outside the markers below is human-owned. The pulse skill only rewrites content
> between the sentinels, leaving your notes intact.

## Dev / build / deploy flow

_How you run, build, test, and ship this project._

<!-- pulse:auto:start -->
- **Backend dev:** `cd backend && source ../.venv/bin/activate && python manage.py runserver` (launches Daphne ASGI on port 8000 via custom management command)
- **Frontend dev:** `cd frontend && npm install && npm run dev` (Next.js on port 3000, proxies `/api/django/*` to Django)
- **Frontend lint:** `cd frontend && npm run lint` (ESLint with next/eslint-config)
- **Frontend build:** `cd frontend && npm run build` (output: standalone Next.js bundle)
- **Django deploy check:** `python manage.py check --deploy` (security audit)
- **DB migration:** `python manage.py migrate`
- **Docker dev build:** `docker compose -f docker-compose.yml build`
- **Docker prod build+up:** `docker compose -f docker-compose.yml -f docker-compose.prod.yml build && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
- **CI/CD:** Push to `master` → GitHub Actions `deploy.yml` → connects via Tailscale VPN → SSH into Azure VM at `/srv/bcu` → `git pull` → `docker compose build` → `docker compose up -d` → `docker image prune`
- **Face recognition training (offline):** `python services/face_recognition/dataset_maker.py` then `python services/face_recognition/model_train.py` to regenerate `embeddings.pkl`
<!-- pulse:auto:end -->
