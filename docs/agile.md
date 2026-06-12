# Metodología ágil — CircleGuard

## Enfoque

Scrum con sprints de 2 semanas. Tablero en GitHub Projects (columnas: Backlog, En progreso, Review, Done).

## Estrategia de ramas (GitHub Flow)

| Rama | Uso |
|------|-----|
| `main` | Estable, despliegue a stage |
| `develop` | Integración, despliegue a dev |
| `feature/*` | Historias de usuario |
| `fix/*` | Correcciones |

Flujo: `feature/X` → PR → `develop` → PR → `main` → tag `vX.Y.Z` → producción.

## Sprint 1 — Infraestructura y CI (semanas 1-2)

### HU-1: Manifiestos Kubernetes
**Como** operador **quiero** desplegar microservicios en K8s **para** orquestar el sistema.

Criterios de aceptación:
- [ ] Namespace, deployments y services para los 8 microservicios
- [ ] Liveness y readiness probes funcionando
- [ ] ConfigMaps y secrets de ejemplo

### HU-2: Terraform multi-ambiente
**Como** DevOps **quiero** IaC modular **para** reproducir infra en dev/stage/prod.

Criterios de aceptación:
- [ ] Módulos network, database, kubernetes
- [ ] Tres ambientes con tfvars de ejemplo
- [ ] Backend remoto documentado

### HU-3: Pipeline CI
**Como** desarrollador **quiero** CI automático **para** detectar fallos al integrar.

Criterios de aceptación:
- [ ] Build y tests en cada PR
- [ ] Escaneo Trivy en imágenes
- [ ] Artefacto de cobertura JaCoCo

## Sprint 2 — Observabilidad, pruebas y releases (semanas 3-4)

### HU-4: Stack de monitoreo
**Como** operador **quiero** métricas y logs centralizados **para** detectar incidentes.

Criterios de aceptación:
- [ ] Prometheus scrape de servicios
- [ ] Dashboard Grafana base
- [ ] Alertas de servicio caído

### HU-5: Pruebas E2E y carga
**Como** QA **quiero** pruebas automatizadas **para** validar flujos críticos.

Criterios de aceptación:
- [ ] Script smoke E2E (login + health)
- [ ] Locust configurado
- [ ] ZAP baseline documentado

### HU-6: Proceso de release
**Como** equipo **quiero** releases versionados **para** desplegar con trazabilidad.

Criterios de aceptación:
- [ ] CHANGELOG mantenido
- [ ] Workflow de release en tag
- [ ] Aprobación manual para producción
