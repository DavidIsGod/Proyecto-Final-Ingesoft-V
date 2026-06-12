# Evidencia de validación — CircleGuard

Comandos reproducibles y resultados obtenidos en entorno local (2026-06-12).

## Prerrequisitos

- Docker Desktop en ejecución
- JDK 21 (Gradle descarga toolchain si hace falta)
- `kubectl` (opcional, para validar manifiestos)

---

## 1. Pruebas unitarias y cobertura

```bash
./gradlew test jacocoTestReport --no-daemon
```

**Resultado:** `BUILD SUCCESSFUL` (ejecutado 2026-06-12).

| Métrica | Valor |
|---------|-------|
| Tests JUnit (backend) | 57 (@Test en código; BUILD SUCCESSFUL) |
| Tests Jest (mobile) | 6 |
| Fallos | 0 |

**Reportes JaCoCo por servicio (HTML):**

```
services/circleguard-auth-service/build/reports/jacoco/test/html/index.html
services/circleguard-identity-service/build/reports/jacoco/test/html/index.html
services/circleguard-promotion-service/build/reports/jacoco/test/html/index.html
services/circleguard-notification-service/build/reports/jacoco/test/html/index.html
services/circleguard-form-service/build/reports/jacoco/test/html/index.html
services/circleguard-file-service/build/reports/jacoco/test/html/index.html
services/circleguard-gateway-service/build/reports/jacoco/test/html/index.html
services/circleguard-dashboard-service/build/reports/jacoco/test/html/index.html
```

Abrir cualquiera en el navegador. En CI el artefacto `jacoco-report` se sube desde `.github/workflows/ci.yml`.

**Mobile:**

```bash
cd mobile && npm ci && npm test -- --ci
```

---

## 2. Infraestructura local (Docker)

```bash
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml ps
```

**Resultado (2026-06-12):** 6/6 servicios `Up`.

| Servicio | Puerto | Estado |
|----------|--------|--------|
| postgres | 5432 | Up |
| neo4j | 7474, 7687 | Up |
| zookeeper | 2181 (interno) | Up |
| kafka | 9092 | Up |
| redis | 6379 | Up |
| openldap | 389, 636 | Up |

---

## 3. Observabilidad local

```bash
docker compose -f docker-compose.observability.yml up -d
docker compose -f docker-compose.observability.yml ps
```

**Resultado (2026-06-12):** 6/6 servicios `Up`.

| Componente | URL local |
|------------|-----------|
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 (admin/admin) |
| Jaeger | http://localhost:16686 |
| Elasticsearch | http://localhost:9200 |
| Kibana | http://localhost:5601 |

Con microservicios en el host, verificar targets en Prometheus → Status → Targets.

---

## 4. Microservicios y health

**Arranque:**

```bash
docker compose -f docker-compose.dev.yml up -d
./gradlew bootRun --parallel
```

**Nota:** Si los puertos ya están ocupados, `bootRun --parallel` falla con `Port XXXX was already in use`. Liberar puertos o detener procesos previos antes de reintentar.

**Health endpoints (`curl`):**

```bash
for port in 8180 8082 8083 8084 8085 8086 8087 8088; do
  echo -n ":$port "
  curl -s http://localhost:$port/actuator/health
  echo
done
```

**Resultado (2026-06-12, con servicios ya en ejecución):**

| Servicio | Puerto | `/actuator/health` |
|----------|--------|-------------------|
| auth | 8180 | UP |
| notification | 8082 | DOWN (dependencia no lista) |
| identity | 8083 | UP |
| dashboard | 8084 | UP |
| file | 8085 | UP |
| form | 8086 | UP |
| gateway | 8087 | UP |
| promotion | 8088 | UP |

Rutas adicionales: `/actuator/health/liveness`, `/actuator/health/readiness`, `/actuator/prometheus`.

---

## 5. Pruebas de carga (Locust)

```bash
pip install locust
locust -f tests/locust/locustfile.py --host http://localhost:8180
```

UI en http://localhost:8089. Requiere auth-service (8180) y promotion-service (8088) levantados.

---

## 6. Seguridad (OWASP ZAP baseline)

```bash
./tests/security/zap-baseline.sh
```

Target por defecto: `http://host.docker.internal:8180`. Reporte en `tests/security/reports/zap-report.html`.

El script termina con `|| true`; no falla el pipeline por hallazgos. Trivy en imágenes Docker corre en `.github/workflows/security.yml`.

---

## 7. Kubernetes

**Validación de manifiestos (sin cluster):**

```bash
kubectl apply -k k8s/ --dry-run=client
```

**Resultado (2026-06-12):** exit code 0. Recursos validados: namespace, RBAC, configmaps, secrets ejemplo, infra, 8 deployments, observabilidad, ingress.

**Con cluster local (minikube/kind):**

```bash
kubectl apply -k k8s/
kubectl get all -n circleguard
kubectl get pods -n circleguard
```

**Limitaciones documentadas:**

- `secrets.example.yaml` se aplica como ejemplo (valores dev); en producción usar `secrets.yaml` fuera del repo o Sealed Secrets.
- OpenLDAP y Elasticsearch no están en el bundle K8s; fluent-bit en cluster apunta a ES inexistente (solo aplica en stack local con compose).
- Imágenes `circleguard/*:1.0.0` requieren build local previo.
- Ingress TLS (`circleguard-tls-secret`) requiere cert-manager; ver `k8s/config/tls-ingress.example.yaml`.

**Deploy CI:** workflows `deploy-dev.yml`, `deploy-stage.yml`, `deploy-prod.yml` ejecutan `kubectl apply --dry-run=client`. Deploy real pendiente de configurar `KUBE_CONFIG` en GitHub Environments.

---

## 8. Terraform

```bash
for env in dev stage prod; do
  cd terraform/environments/$env
  terraform init -backend=false
  terraform validate
  cd -
done
```

**Resultado (2026-06-12):**

| Ambiente | validate |
|----------|----------|
| dev | Success |
| stage | Success |
| prod | Success |

`terraform plan` / `apply` requieren credenciales AWS y `terraform.tfvars` (no commitear). Backend remoto: ver `terraform/backend.tf.example`. Subnets privadas sin NAT: limitación conocida para salida a Internet de nodos EKS.

---

## 9. CI/CD (GitHub Actions)

Workflows en `.github/workflows/`:

| Archivo | Función |
|---------|---------|
| ci.yml | test, jacoco, terraform validate, mobile test |
| security.yml | Trivy por microservicio |
| sonar.yml | SonarCloud opcional |
| release.yml | release notes en tag v*.*.* |
| deploy-dev/stage/prod.yml | dry-run K8s por ambiente |

No se usa Jenkins.

---

## 10. Sealed Secrets

Configuración base documentada en `docs/security.md`. No hay manifiesto Sealed Secrets en el repo; alternativa actual: `kubectl create secret` o External Secrets Operator en producción.
