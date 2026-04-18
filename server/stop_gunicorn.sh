#!/bin/bash
set -euo pipefail

pkill -f "gunicorn.*wellnessmonitor_backend" || true
