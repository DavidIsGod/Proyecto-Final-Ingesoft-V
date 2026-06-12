# Changelog

## [1.0.0] - 2026-06-12

### Added
- Manifiestos Kubernetes con RBAC, probes y ConfigMaps
- Terraform modular (dev, stage, prod)
- Pipelines CI/CD con Trivy, Sonar opcional y deploy por ambiente
- Actuator y métricas Prometheus en todos los microservicios
- Circuit Breaker (Resilience4j) en dashboard-service
- External Configuration y Feature Toggles
- Stack observabilidad local (Prometheus, Grafana, Jaeger, ELK)
- Pruebas E2E, Locust y OWASP ZAP baseline
- Documentación completa en `docs/`

### Changed
- README simplificado en español
- IdentityClient y PromotionClient usan configuración externa
