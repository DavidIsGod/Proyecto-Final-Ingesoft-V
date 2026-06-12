# Seguridad — CircleGuard

## Secretos

- Desarrollo: valores de ejemplo en `docker-compose.dev.yml` y `application.yml`
- Kubernetes: `k8s/config/secrets.example.yaml` → copiar a `secrets.yaml` (gitignored)
- Producción: usar Sealed Secrets, External Secrets Operator o vault del cloud provider

No commitear contraseñas reales ni `terraform.tfvars` con credenciales.

## RBAC Kubernetes

- ServiceAccount dedicado por microservicio
- Role `circleguard-config-reader`: solo get/list/watch en ConfigMaps y Secrets del namespace
- Sin permisos cluster-admin para workloads

Archivos: `k8s/rbac/`

## TLS

- Ingress con TLS en `k8s/ingress.yaml`
- Certificado de ejemplo con cert-manager en `k8s/config/tls-ingress.example.yaml`
- En producción: Let's Encrypt o certificados del load balancer

## Escaneo de vulnerabilidades

- **Trivy**: `.github/workflows/security.yml` en cada build de imagen
- **OWASP ZAP**: `tests/security/zap-baseline.sh` para pruebas locales
- Severidad CRITICAL bloquea el pipeline

## Aplicación

- JWT para APIs autenticadas
- Dual-chain auth (LDAP + local)
- K-anonimidad en dashboard
- Identidades anonimizadas en identity-service
