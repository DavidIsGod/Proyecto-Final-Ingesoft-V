# CircleGuard — Proyecto Final IngeSoft V

Sistema de trazabilidad de contactos y contención sanitaria en campus universitario. Arquitectura de microservicios Spring Boot con app móvil Expo.

## Requisitos

- Java 21, Docker, Node.js 18+
- Gradle (wrapper incluido)

## Levantar localmente

```bash
# Infraestructura (PostgreSQL, Neo4j, Kafka, Redis, LDAP)
docker-compose -f docker-compose.dev.yml up -d

# Microservicios
./gradlew bootRun --parallel

# App móvil
cd mobile && npm install && npm run start
```

Puertos: auth `8180`, notification `8082`, identity `8083`, dashboard `8084`, file `8085`, form `8086`, gateway `8087`, promotion `8088`.

Observabilidad local (opcional):

```bash
docker-compose -f docker-compose.observability.yml up -d
```

## Pruebas

```bash
./gradlew test jacocoTestReport
cd mobile && npm test
./tests/e2e/smoke.sh
```

Ver [docs/testing.md](docs/testing.md) para Locust, ZAP y más.

## Kubernetes y Terraform

```bash
# Build imagen (ejemplo auth)
docker build -t circleguard/auth-service:1.0.0 -f services/circleguard-auth-service/Dockerfile .

kubectl apply -f k8s/namespace.yaml
kubectl apply -k k8s/

cd terraform/environments/dev && terraform init && terraform plan
```

## Documentación

| Tema | Archivo |
|------|---------|
| Arquitectura | [docs/architecture.md](docs/architecture.md) |
| Infraestructura | [docs/infrastructure.md](docs/infrastructure.md) |
| Metodología ágil | [docs/agile.md](docs/agile.md) |
| Patrones de diseño | [docs/design-patterns.md](docs/design-patterns.md) |
| Pruebas | [docs/testing.md](docs/testing.md) |
| Observabilidad | [docs/observability.md](docs/observability.md) |
| Seguridad | [docs/security.md](docs/security.md) |
| Operación | [docs/operations.md](docs/operations.md) |
| Costos | [docs/costs.md](docs/costs.md) |
| Change management | [docs/change-management.md](docs/change-management.md) |
