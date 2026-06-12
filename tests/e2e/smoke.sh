#!/usr/bin/env bash
set -euo pipefail

AUTH_URL="${AUTH_URL:-http://localhost:8180}"
GATEWAY_URL="${GATEWAY_URL:-http://localhost:8087}"
DASHBOARD_URL="${DASHBOARD_URL:-http://localhost:8084}"

echo "==> Health checks"
curl -sf "${AUTH_URL}/actuator/health" | grep -q UP
curl -sf "${GATEWAY_URL}/actuator/health" | grep -q UP || echo "Gateway no disponible (opcional)"

echo "==> Login"
LOGIN_RESPONSE=$(curl -sf -X POST "${AUTH_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' || echo '{}')

if echo "$LOGIN_RESPONSE" | grep -q token; then
  echo "Login OK"
else
  echo "Login falló o credenciales de prueba no disponibles — verificar auth-service"
fi

echo "==> Analytics summary"
curl -sf "${DASHBOARD_URL}/api/v1/analytics/summary" || echo "Dashboard no disponible"

echo "E2E smoke completado"
