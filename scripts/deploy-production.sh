#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

if [[ "${EUID}" -eq 0 ]]; then
  echo "Run this command as the application deployment user, not root." >&2
  echo "The script will use sudo only for the Nginx transaction." >&2
  exit 1
fi

command -v sudo >/dev/null 2>&1 || {
  echo "sudo is required to install and reload Nginx." >&2
  exit 1
}

command -v git >/dev/null 2>&1 || {
  echo "git is required." >&2
  exit 1
}

CURRENT_BRANCH="$(git branch --show-current)"
if [[ "${CURRENT_BRANCH}" != "main" && "${ALLOW_NON_MAIN_DEPLOY:-false}" != "true" ]]; then
  echo "Refusing production deployment from branch '${CURRENT_BRANCH}'." >&2
  echo "Merge to main first or set ALLOW_NON_MAIN_DEPLOY=true for an intentional emergency release." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Refusing production deployment with uncommitted changes." >&2
  git status --short >&2
  exit 1
fi

LOCAL_SHA="$(git rev-parse HEAD)"
REMOTE_SHA="$(git ls-remote origin refs/heads/main | awk '{print $1}')"
if [[ "${CURRENT_BRANCH}" == "main" && "${LOCAL_SHA}" != "${REMOTE_SHA}" ]]; then
  echo "Local main does not match origin/main." >&2
  echo "Local:  ${LOCAL_SHA}" >&2
  echo "Remote: ${REMOTE_SHA}" >&2
  exit 1
fi

echo "Deploying Luxury Finishing commit ${LOCAL_SHA}..."

bash "${ROOT_DIR}/scripts/deploy-pm2.sh"
sudo --preserve-env=DOMAIN,APP_PORT,APP_HEALTH_URL \
  bash "${ROOT_DIR}/scripts/install-nginx-production.sh"

PRODUCTION_URL="${PRODUCTION_URL:-https://luxury-finishing.alazab.com}" \
  node "${ROOT_DIR}/scripts/verify-live-production.mjs"

printf '%s\n' "${LOCAL_SHA}" > "${ROOT_DIR}/.last-production-release"
echo "Production release completed and verified: ${LOCAL_SHA}"
