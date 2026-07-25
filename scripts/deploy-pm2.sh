#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="${APP_NAME:-luxury-finishing}"
PORT="${PORT:-3007}"
HOST="${HOST:-127.0.0.1}"
SKIP_INSTALL="${SKIP_INSTALL:-false}"
SKIP_AUDIT="${SKIP_AUDIT:-false}"

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

on_error() {
  local exit_code=$?
  echo "Deployment failed at line ${BASH_LINENO[0]} with exit code ${exit_code}." >&2
  exit "$exit_code"
}
trap on_error ERR

command -v node >/dev/null 2>&1 || { echo "Node.js is not installed." >&2; exit 1; }
command -v corepack >/dev/null 2>&1 || { echo "Corepack is not installed." >&2; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo "PM2 is not installed." >&2; exit 1; }

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$NODE_MAJOR" != "22" ]]; then
  echo "Node.js 22 is required; current version is $(node --version)." >&2
  exit 1
fi

corepack enable
corepack prepare pnpm@11.13.1 --activate

if [[ "$SKIP_INSTALL" != "true" ]]; then
  pnpm install --frozen-lockfile
fi

pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm verify:production

if [[ "$SKIP_AUDIT" != "true" ]]; then
  pnpm audit --prod --audit-level high
fi

export APP_NAME PORT HOST NODE_ENV=production
pm2 startOrReload ecosystem.config.cjs --only "$APP_NAME" --update-env
pm2 save

HEALTH_URL="http://127.0.0.1:${PORT}/healthz"
for attempt in {1..30}; do
  if curl --fail --silent --show-error --max-time 3 "$HEALTH_URL" >/dev/null; then
    echo "Deployment verified successfully: ${HEALTH_URL}"
    pm2 status "$APP_NAME"
    exit 0
  fi
  sleep 1
done

echo "PM2 process started, but health verification failed: ${HEALTH_URL}" >&2
pm2 logs "$APP_NAME" --lines 100 --nostream || true
exit 1
