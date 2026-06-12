# Observabilidad — CircleGuard

## Stack local

```bash
docker-compose -f docker-compose.observability.yml up -d
```

| Componente | URL | Uso |
|------------|-----|-----|
| Prometheus | http://localhost:9090 | Métricas técnicas |
| Grafana | http://localhost:3000 | Dashboards (admin/admin) |
| Jaeger | http://localhost:16686 | Tracing distribuido |
| Kibana | http://localhost:5601 | Logs centralizados |
| Elasticsearch | http://localhost:9200 | Almacén de logs |

## Métricas

Cada microservicio expone `/actuator/prometheus`. Métrica de negocio: `circleguard_promotions_total` en promotion-service.

Config Prometheus: `observability/prometheus/prometheus.yml`

Alertas: `observability/prometheus/alerts.yml` (servicio caído, error rate > 5%)

## Health probes (Kubernetes)

- Liveness: `/actuator/health/liveness`
- Readiness: `/actuator/health/readiness`

Definidos en manifiestos `k8s/services/*.yaml`.

## Logs

Fluent Bit envía logs a Elasticsearch. En producción usar agente de nodo o sidecar equivalente.

## Kubernetes

Manifiestos en `k8s/observability/` para Prometheus, Grafana y Jaeger dentro del namespace `circleguard`.
