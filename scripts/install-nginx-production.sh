#!/usr/bin/env bash
set -Eeuo pipefail

DOMAIN="${DOMAIN:-luxury-finishing.alazab.com}"
APP_PORT="${APP_PORT:-3007}"
APP_HEALTH_URL="${APP_HEALTH_URL:-http://127.0.0.1:${APP_PORT}/healthz}"
ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_CONFIG="${SOURCE_CONFIG:-${ROOT_DIR}/deploy/nginx/luxury-finishing.conf}"
TARGET_CONFIG="${TARGET_CONFIG:-/etc/nginx/sites-available/luxury-finishing.conf}"
ENABLED_CONFIG="${ENABLED_CONFIG:-/etc/nginx/sites-enabled/luxury-finishing.conf}"
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/luxury-finishing-nginx}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_DIR="${BACKUP_ROOT}/${TIMESTAMP}"
TRANSACTION_ACTIVE=false

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script as root or through sudo." >&2
  exit 1
fi

for command_name in nginx systemctl curl node install readlink grep find; do
  command -v "${command_name}" >/dev/null 2>&1 || {
    echo "Required command is missing: ${command_name}" >&2
    exit 1
  }
done

[[ -f "${SOURCE_CONFIG}" ]] || {
  echo "Nginx source config not found: ${SOURCE_CONFIG}" >&2
  exit 1
}

CERT_DIR="/etc/letsencrypt/live/${DOMAIN}"
[[ -s "${CERT_DIR}/fullchain.pem" && -s "${CERT_DIR}/privkey.pem" ]] || {
  echo "TLS certificate files are missing under ${CERT_DIR}." >&2
  exit 1
}

APP_HEALTH_BODY="$(curl --fail --silent --show-error --max-time 5 "${APP_HEALTH_URL}")" || {
  echo "PM2 application is not healthy at ${APP_HEALTH_URL}." >&2
  exit 1
}

if [[ "${APP_HEALTH_BODY}" != *'"service":"luxury-finishing"'* && "${APP_HEALTH_BODY}" != *'"service": "luxury-finishing"'* ]]; then
  echo "Unexpected application health response: ${APP_HEALTH_BODY}" >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"
MOVED_PATHS=()
MOVED_BACKUPS=()
TARGET_EXISTED=false
ENABLED_EXISTED=false

rollback() {
  local exit_code=$?
  if [[ "${TRANSACTION_ACTIVE}" != "true" ]]; then
    exit "${exit_code}"
  fi

  echo "Rolling back Nginx configuration..." >&2

  rm -f "${ENABLED_CONFIG}"
  if [[ "${ENABLED_EXISTED}" == "true" ]]; then
    cp -a "${BACKUP_DIR}/enabled.previous" "${ENABLED_CONFIG}"
  fi

  if [[ "${TARGET_EXISTED}" == "true" ]]; then
    cp -a "${BACKUP_DIR}/site.previous" "${TARGET_CONFIG}"
  else
    rm -f "${TARGET_CONFIG}"
  fi

  for index in "${!MOVED_PATHS[@]}"; do
    mkdir -p "$(dirname -- "${MOVED_PATHS[$index]}")"
    mv "${MOVED_BACKUPS[$index]}" "${MOVED_PATHS[$index]}"
  done

  nginx -t >/dev/null 2>&1 && systemctl reload nginx || true
  echo "Rollback completed. Backup retained at ${BACKUP_DIR}." >&2
  exit "${exit_code}"
}
trap rollback ERR

if [[ -e "${TARGET_CONFIG}" || -L "${TARGET_CONFIG}" ]]; then
  TARGET_EXISTED=true
  cp -a "${TARGET_CONFIG}" "${BACKUP_DIR}/site.previous"
fi

if [[ -e "${ENABLED_CONFIG}" || -L "${ENABLED_CONFIG}" ]]; then
  ENABLED_EXISTED=true
  cp -a "${ENABLED_CONFIG}" "${BACKUP_DIR}/enabled.previous"
fi

TRANSACTION_ACTIVE=true
install -m 0644 "${SOURCE_CONFIG}" "${TARGET_CONFIG}"

# Disable every legacy enabled site that claims the same server_name.
while IFS= read -r -d '' candidate; do
  [[ "${candidate}" == "${ENABLED_CONFIG}" ]] && continue
  resolved="$(readlink -f "${candidate}" 2>/dev/null || printf '%s' "${candidate}")"
  [[ -f "${resolved}" ]] || continue

  if grep -Eq "server_name[[:space:]]+([^;]*[[:space:]])?${DOMAIN//./\.}([[:space:];])" "${resolved}"; then
    backup_path="${BACKUP_DIR}/conflict-$(basename -- "${candidate}")"
    mv "${candidate}" "${backup_path}"
    MOVED_PATHS+=("${candidate}")
    MOVED_BACKUPS+=("${backup_path}")
    echo "Temporarily disabled conflicting site: ${candidate}"
  fi
done < <(find /etc/nginx/sites-enabled -mindepth 1 -maxdepth 1 -print0)

ln -sfn "${TARGET_CONFIG}" "${ENABLED_CONFIG}"
nginx -t
systemctl reload nginx

# Validate both the local upstream and the externally routed production domain.
curl --fail --silent --show-error --max-time 5 "${APP_HEALTH_URL}" >/dev/null
PRODUCTION_URL="https://${DOMAIN}" node "${ROOT_DIR}/scripts/verify-live-production.mjs"

TRANSACTION_ACTIVE=false
trap - ERR

echo "Nginx production configuration installed and externally verified."
echo "Backup: ${BACKUP_DIR}"
