#!/usr/bin/env bash
# Manual deploy on the home-server Docker stack. No CI/CD - run this by hand
# over SSH on the host itself after a git push:
#   bash scripts/deploy-home-vm.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "-- Pull latest --"
git stash push --include-untracked -m "pre-deploy-$(date +%s)" || true
git fetch origin
git pull --ff-only origin master

echo "-- Build + restart --"
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo "-- Prune dangling images --"
docker image prune -f

echo "-- Health check --"
# Django runs migrate + seed + collectstatic on boot before Daphne starts
# listening, so give it more headroom than a plain Next.js/Node container.
sleep 8
PORT="8080"
if [ -f .env ]; then
  ENV_PORT="$(grep -E '^HOST_HTTP_PORT=' .env | cut -d= -f2)"
  [ -n "$ENV_PORT" ] && PORT="$ENV_PORT"
fi
curl -sf "http://127.0.0.1:${PORT}/" >/dev/null \
  && echo "OK: site responding on :${PORT}" \
  || echo "WARN: local health check failed - check: docker compose -f docker-compose.yml -f docker-compose.prod.yml logs"

echo "Deployed at $(date)"
