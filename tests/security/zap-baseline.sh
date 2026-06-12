#!/usr/bin/env bash
set -euo pipefail

TARGET="${TARGET:-http://host.docker.internal:8180}"
REPORT_DIR="$(dirname "$0")/reports"
mkdir -p "$REPORT_DIR"

docker run --rm \
  -v "$REPORT_DIR:/zap/wrk:rw" \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
  -t "$TARGET" \
  -r zap-report.html \
  -I || true

echo "Reporte en $REPORT_DIR/zap-report.html"
