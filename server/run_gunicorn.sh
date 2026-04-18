#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -x "$SCRIPT_DIR/newenv/bin/gunicorn" ]; then
  GUNICORN_BIN="$SCRIPT_DIR/newenv/bin/gunicorn"
elif [ -x "$SCRIPT_DIR/venv/bin/gunicorn" ]; then
  GUNICORN_BIN="$SCRIPT_DIR/venv/bin/gunicorn"
elif [ -f "$HOME/miniforge3/etc/profile.d/conda.sh" ]; then
  . "$HOME/miniforge3/etc/profile.d/conda.sh"
elif [ -f "$HOME/miniconda3/etc/profile.d/conda.sh" ]; then
  . "$HOME/miniconda3/etc/profile.d/conda.sh"
else
  echo "No supported Python runtime found for gunicorn" >&2
  exit 1
fi

if [ -z "${GUNICORN_BIN:-}" ]; then
  conda activate wellnessmonitor
  GUNICORN_BIN="$(command -v gunicorn)"
fi

if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  . "$SCRIPT_DIR/.env"
  set +a
fi

mkdir -p "$SCRIPT_DIR/logs"
export PATH="$SCRIPT_DIR/bin:$PATH"

exec "$GUNICORN_BIN" \
  --name wellnessmonitor_backend \
  --bind 127.0.0.1:5000 \
  --workers 1 \
  --timeout 1200 \
  --access-logfile "$SCRIPT_DIR/logs/gunicorn-access.log" \
  --error-logfile "$SCRIPT_DIR/logs/gunicorn-error.log" \
  app:app
