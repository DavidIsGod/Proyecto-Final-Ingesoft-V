# Pruebas — CircleGuard

## Unitarias (backend)

```bash
./gradlew test
./gradlew :services:circleguard-promotion-service:test
```

Cobertura JaCoCo:

```bash
./gradlew test jacocoTestReport
open services/circleguard-auth-service/build/reports/jacoco/test/html/index.html
```

## Unitarias (mobile)

```bash
cd mobile && npm test
```

## Integración

- Testcontainers en promotion-service (Neo4j + PostgreSQL)
- `IdentityClientIntegrationTest` — auth → identity con WireMock
- `PromotionClientCircuitBreakerTest` — dashboard → promotion con WireMock

```bash
./gradlew :services:circleguard-auth-service:test --tests '*Integration*'
./gradlew :services:circleguard-dashboard-service:test --tests '*CircuitBreaker*'
```

Stack mínimo para integración manual:

```bash
docker-compose -f tests/integration/docker-compose.test.yml up -d
```

## E2E

```bash
docker-compose -f docker-compose.dev.yml up -d
./gradlew bootRun --parallel   # en otra terminal
./tests/e2e/smoke.sh
```

## Carga (Locust)

```bash
pip install locust
locust -f tests/locust/locustfile.py --host http://localhost:8180
```

## Seguridad (OWASP ZAP)

```bash
./tests/security/zap-baseline.sh
```

## CI

Las pruebas se ejecutan en `.github/workflows/ci.yml` en cada push a `main` y `develop`.
