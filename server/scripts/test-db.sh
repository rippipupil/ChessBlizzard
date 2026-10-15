#!/usr/bin/env bash
# PostgreSQL desechable para los tests del servidor.
#
#   bash server/scripts/test-db.sh start    crea el clúster (initdb) en un directorio temporal,
#                                           lo arranca en el puerto 5433 y crea la base de datos
#   bash server/scripts/test-db.sh stop     lo para y borra el directorio
#   bash server/scripts/test-db.sh status   sale con 0 si está arrancado
#   bash server/scripts/test-db.sh url      imprime la URL de conexión
#
# `start` imprime en la salida estándar una línea `export TEST_DATABASE_URL=...`, así que
# se puede usar como:  eval "$(bash server/scripts/test-db.sh start)"
# El resto de mensajes van a la salida de error.
#
# Variables opcionales: PG_BIN (binarios de PostgreSQL), TEST_DB_PORT, TEST_DB_DIR.
set -euo pipefail

PG_BIN="${PG_BIN:-/usr/lib/postgresql/16/bin}"
PORT="${TEST_DB_PORT:-5433}"
BASE_DIR="${TEST_DB_DIR:-${TMPDIR:-/tmp}/chessblizzard-test-db-${PORT}}"
DATA_DIR="${BASE_DIR}/data"
LOG_FILE="${BASE_DIR}/postgres.log"
DB_USER="chessblizzard"
DB_NAME="chessblizzard_test"
URL="postgres://${DB_USER}@127.0.0.1:${PORT}/${DB_NAME}"

log() { echo "[test-db] $*" >&2; }

if [[ ! -x "${PG_BIN}/initdb" ]]; then
  log "No encuentro los binarios de PostgreSQL en ${PG_BIN} (usa PG_BIN=/ruta/bin)."
  exit 1
fi

# PostgreSQL se niega a ejecutarse como root: en ese caso usamos el usuario "postgres"
# (o "nobody" si no existe) para initdb y pg_ctl.
RUN_AS=""
if [[ "$(id -u)" -eq 0 ]]; then
  if id postgres >/dev/null 2>&1; then RUN_AS="postgres"; else RUN_AS="nobody"; fi
fi

as_pg() {
  if [[ -z "${RUN_AS}" ]]; then
    "$@"
  elif command -v runuser >/dev/null 2>&1; then
    runuser -u "${RUN_AS}" -- "$@"
  else
    su -s /bin/sh "${RUN_AS}" -c "$(printf '%q ' "$@")"
  fi
}

is_running() {
  [[ -f "${DATA_DIR}/PG_VERSION" ]] && as_pg "${PG_BIN}/pg_ctl" -D "${DATA_DIR}" status >/dev/null 2>&1
}

psql_admin() {
  "${PG_BIN}/psql" -X -q -h 127.0.0.1 -p "${PORT}" -U "${DB_USER}" -d postgres -v ON_ERROR_STOP=1 "$@"
}

start() {
  if ! is_running; then
    if [[ ! -f "${DATA_DIR}/PG_VERSION" ]]; then
      log "Creando el clúster en ${DATA_DIR}"
      rm -rf "${BASE_DIR}"
      mkdir -p "${BASE_DIR}"
      if [[ -n "${RUN_AS}" ]]; then chown "${RUN_AS}" "${BASE_DIR}"; fi
      # Solo escucha en 127.0.0.1 y es desechable, así que basta con autenticación "trust".
      as_pg "${PG_BIN}/initdb" -D "${DATA_DIR}" -U "${DB_USER}" --auth=trust \
        --encoding=UTF8 --no-locale --no-sync >/dev/null
    fi
    log "Arrancando PostgreSQL en el puerto ${PORT}"
    # Sin fsync ni escrituras síncronas: más rápido, y los datos de los tests no importan.
    as_pg "${PG_BIN}/pg_ctl" -D "${DATA_DIR}" -l "${LOG_FILE}" -w -t 30 \
      -o "-p ${PORT} -k ${BASE_DIR} -c listen_addresses=127.0.0.1 -c fsync=off -c synchronous_commit=off -c full_page_writes=off" \
      start >/dev/null || { log "No arrancó. Registro en ${LOG_FILE}:"; tail -n 20 "${LOG_FILE}" >&2 || true; exit 1; }
  else
    log "PostgreSQL ya estaba arrancado en el puerto ${PORT}"
  fi

  if [[ "$(psql_admin -tAc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'")" != "1" ]]; then
    psql_admin -c "CREATE DATABASE ${DB_NAME}"
  fi
  echo "export TEST_DATABASE_URL=${URL}"
}

stop() {
  if is_running; then
    log "Parando PostgreSQL"
    as_pg "${PG_BIN}/pg_ctl" -D "${DATA_DIR}" -m fast -w stop >/dev/null
  fi
  rm -rf "${BASE_DIR}"
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  status) is_running ;;
  url) echo "${URL}" ;;
  *)
    echo "Uso: $0 start|stop|status|url" >&2
    exit 2
    ;;
esac
