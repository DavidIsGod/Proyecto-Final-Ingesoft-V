# Guion de sustentación — CircleGuard (IngeSoft V)

20 diapositivas. Tiempo sugerido: 25–30 minutos + demo + preguntas.

---

## Diapositiva 1 — Portada

- **Título:** CircleGuard — Monitoreo de salud en campus universitario
- **Curso:** Ingeniería de Software V
- **Equipo:** [nombres]
- **Fecha:** junio 2026

---

## Diapositiva 2 — Contexto

- Universidades con miles de estudiantes en espacios compartidos
- Necesidad de detectar brotes sin exponer identidad personal
- CircleGuard: encuestas de síntomas, estados de salud agregados, acceso controlado por QR

---

## Diapositiva 3 — Objetivo del proyecto

- Arquitectura de microservicios desplegable en local, K8s y AWS
- Pipeline CI/CD con pruebas, seguridad y releases versionados
- Observabilidad y trazabilidad para operación en producción

---

## Diapositiva 4 — Arquitectura

Diagrama de 8 microservicios:

| Servicio | Puerto | Rol |
|----------|--------|-----|
| auth | 8180 | Login LDAP/JWT |
| identity | 8083 | Vault de identidad anónima |
| promotion | 8088 | Estados de salud, Neo4j |
| notification | 8082 | Alertas, Kafka |
| form | 8086 | Encuestas |
| file | 8085 | Adjuntos |
| gateway | 8087 | Validación QR en accesos |
| dashboard | 8084 | Analytics |

API Gateway lógico vía ingress K8s (`/auth`, `/gateway`, `/dashboard`).

Referencia: `docs/architecture.md`

---

## Diapositiva 5 — Stack tecnológico

- **Backend:** Java 21, Spring Boot 3.2, Gradle multi-proyecto
- **Datos:** PostgreSQL, Neo4j, Redis, Kafka
- **Auth:** LDAP (dev), JWT
- **Mobile:** React Native / Expo (`mobile/`)
- **Infra:** Docker Compose, Kubernetes, Terraform (AWS EKS + RDS)
- **Observabilidad:** Prometheus, Grafana, Jaeger, ELK

---

## Diapositiva 6 — Metodología ágil

- Scrum, sprints de 2 semanas
- GitHub Flow: `feature/*` → `develop` → `main` → tag `vX.Y.Z`
- Historias de usuario por sprint en `docs/agile.md`
- Tablero: GitHub Projects

---

## Diapositiva 7 — Terraform (IaC)

- Módulos: `network`, `database`, `kubernetes`
- Ambientes: `terraform/environments/dev|stage|prod`
- Diferencias por ambiente: tamaño RDS, nodos EKS, multi-AZ en prod
- Validación: `terraform init -backend=false && terraform validate`
- Backend remoto S3 documentado en `terraform/backend.tf.example`

---

## Diapositiva 8 — Patrones de diseño

- API Gateway / BFF (dashboard, gateway)
- Circuit Breaker (dashboard → promotion, Resilience4j)
- Event-driven con Kafka (encuestas → promotion, alertas)
- Repository, DTO, Strategy en formularios dinámicos

Referencia: `docs/design-patterns.md`

---

## Diapositiva 9 — CI/CD (GitHub Actions)

| Workflow | Qué hace |
|----------|----------|
| ci.yml | Tests, JaCoCo, Terraform validate, mobile |
| security.yml | Trivy en 8 imágenes |
| sonar.yml | SonarCloud (opcional) |
| release.yml | Release notes automáticas |
| deploy-*.yml | Dry-run K8s por ambiente |

No Jenkins. Deploy real requiere `KUBE_CONFIG` en GitHub Environments.

---

## Diapositiva 10 — Pruebas unitarias e integración

- 57 tests JUnit en 8 servicios + 6 Jest mobile (0 fallos en última ejecución)
- JaCoCo por servicio (`build/reports/jacoco/test/html/`)
- Testcontainers en promotion-service (Postgres, Kafka)
- WireMock para integración auth↔identity, dashboard↔promotion

```bash
./gradlew test jacocoTestReport
```

---

## Diapositiva 11 — Locust y OWASP ZAP

**Carga (Locust):** `tests/locust/locustfile.py` — login y stats de salud

**Seguridad (ZAP):** `tests/security/zap-baseline.sh` — baseline contra auth-service

**Contenedor (Trivy):** escaneo semanal y en push, workflow `security.yml`

---

## Diapositiva 12 — Change management

- Versionado semántico, tags `v*.*.*`
- `CHANGELOG.md`, `RELEASE_NOTES.md`
- Release automático con notas en GitHub
- Rollback documentado en `deploy-prod.yml`

Referencia: `docs/change-management.md`

---

## Diapositiva 13 — Observabilidad

- Actuator: health, prometheus, info en los 8 servicios
- Stack local: `docker-compose.observability.yml`
- Alertas Prometheus: servicio caído, error rate > 5%
- Dashboard Grafana: `observability/grafana/dashboards/circleguard-overview.json`

URLs: ver `docs/observability.md` y `docs/evidence.md`

---

## Diapositiva 14 — Logging y tracing

- Fluent Bit → Elasticsearch → Kibana (local)
- Jaeger UI en puerto 16686
- Instrumentación de trazas en código: configuración base (Jaeger desplegado, OTel pendiente de cablear en servicios)

---

## Diapositiva 15 — Seguridad

- JWT con secretos en K8s Secret (`secrets.example.yaml`)
- RBAC: ServiceAccount por microservicio, Role `circleguard-config-reader`
- TLS en ingress (`k8s/ingress.yaml`, ejemplo cert-manager en `tls-ingress.example.yaml`)
- Trivy en CI; ZAP manual
- Sealed Secrets: documentado, no implementado en repo

Referencia: `docs/security.md`

---

## Diapositiva 16 — Documentación y costos

- Índice en `README.md` → `docs/` (arquitectura, infra, testing, operaciones, costos)
- Estimación AWS por ambiente en `docs/costs.md`
- Evidencia reproducible: `docs/evidence.md`

---

## Diapositiva 17 — Demo en vivo

Secuencia sugerida (5–7 min):

1. `docker compose -f docker-compose.dev.yml ps` — infra Up
2. `curl http://localhost:8180/actuator/health` — UP
3. Login de prueba o smoke: `tests/e2e/smoke.sh`
4. Grafana http://localhost:3000 — dashboard CircleGuard
5. Prometheus http://localhost:9090 — targets

---

## Diapositiva 18 — Métricas de calidad

- Tests: 57 JUnit + 6 Jest, 0 fallos (`./gradlew test`, 2026-06-12)
- Cobertura JaCoCo por servicio (abrir HTML del servicio con más lógica: promotion)
- SonarCloud opcional si `SONAR_TOKEN` configurado

---

## Diapositiva 19 — Lecciones aprendidas

- Coordinar puertos y dependencias antes de `bootRun --parallel`
- K8s local requiere alinear init-db Postgres con compose
- Separar secretos de ejemplo vs producción desde el inicio
- Testcontainers acelera confianza en flujos Kafka/DB sin cluster completo

---

## Diapositiva 20 — Cierre

- CircleGuard: 8 microservicios, CI/CD, observabilidad y IaC listos para demo
- Repositorio reproducible con `docs/evidence.md`
- Trabajo futuro: deploy real a EKS, Sealed Secrets, instrumentación OpenTelemetry

**Preguntas**
