#!/usr/bin/env bash
set -Eeuo pipefail

umask 077

APP_ROOT="${APP_ROOT:-/var/www/cinta-dhuafa-web/current}"
SHARED_ROOT="${SHARED_ROOT:-/var/www/cinta-dhuafa-web/shared}"
UPLOADS_DIR="${UPLOADS_DIR:-${SHARED_ROOT}/uploads}"
ENV_FILE="${ENV_FILE:-${APP_ROOT}/.env}"
NGINX_FILE="${NGINX_FILE:-/etc/nginx/sites-available/cinta-dhuafa-web}"
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/cinta-dhuafa-web}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
DOMAIN="${DOMAIN:-cintadhuafa.or.id}"

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DAILY_DIR="${BACKUP_ROOT}/daily"
STAGING_DIR="$(mktemp -d)"
ARCHIVE_PATH="${DAILY_DIR}/${DOMAIN}-${TIMESTAMP}.tar.gz"
CHECKSUM_PATH="${ARCHIVE_PATH}.sha256"

cleanup() {
  rm -rf "${STAGING_DIR}"
}
trap cleanup EXIT

require_path() {
  local path="$1"
  local label="$2"

  if [ ! -e "${path}" ]; then
    echo "Missing ${label}: ${path}" >&2
    exit 1
  fi
}

require_path "${UPLOADS_DIR}" "uploads directory"
require_path "${ENV_FILE}" "env file"
require_path "${NGINX_FILE}" "nginx config"

mkdir -p "${DAILY_DIR}"
mkdir -p "${STAGING_DIR}/app" "${STAGING_DIR}/config"

cp -a "${UPLOADS_DIR}" "${STAGING_DIR}/app/uploads"
install -m 600 "${ENV_FILE}" "${STAGING_DIR}/config/.env"
install -m 644 "${NGINX_FILE}" "${STAGING_DIR}/config/nginx-cinta-dhuafa-web.conf"

cat > "${STAGING_DIR}/manifest.txt" <<EOF
backup_time_utc=${TIMESTAMP}
domain=${DOMAIN}
hostname=$(hostname)
app_root=${APP_ROOT}
shared_root=${SHARED_ROOT}
uploads_dir=${UPLOADS_DIR}
env_file=${ENV_FILE}
nginx_file=${NGINX_FILE}
EOF

tar -C "${STAGING_DIR}" -czf "${ARCHIVE_PATH}" .
sha256sum "${ARCHIVE_PATH}" > "${CHECKSUM_PATH}"
ln -sfn "${ARCHIVE_PATH}" "${DAILY_DIR}/latest.tar.gz"
ln -sfn "${CHECKSUM_PATH}" "${DAILY_DIR}/latest.tar.gz.sha256"

find "${DAILY_DIR}" -type f -name '*.tar.gz' -mtime +"${RETENTION_DAYS}" -delete
find "${DAILY_DIR}" -type f -name '*.sha256' -mtime +"${RETENTION_DAYS}" -delete

echo "Backup created: ${ARCHIVE_PATH}"
echo "Checksum file: ${CHECKSUM_PATH}"
