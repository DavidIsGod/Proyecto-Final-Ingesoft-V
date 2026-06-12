# Operación básica — CircleGuard

## Levantar entorno completo

```bash
docker-compose -f docker-compose.dev.yml up -d
./gradlew bootRun --parallel
docker-compose -f docker-compose.observability.yml up -d
```

## Verificar salud

```bash
curl http://localhost:8180/actuator/health
curl http://localhost:8088/actuator/health
```

## Escalar en Kubernetes

```bash
kubectl scale deployment circleguard-promotion-service -n circleguard --replicas=3
```

## Rollback

```bash
kubectl rollout undo deployment/circleguard-promotion-service -n circleguard
kubectl rollout status deployment/circleguard-promotion-service -n circleguard
```

## Logs

```bash
kubectl logs -f deployment/circleguard-auth-service -n circleguard
```

Kibana local: http://localhost:5601

## Incidentes comunes

| Síntoma | Acción |
|---------|--------|
| Auth no conecta a LDAP | Verificar pod openldap o desactivar LDAP en dev |
| Promotion lento | Revisar Neo4j y Redis |
| Dashboard sin datos | Verificar circuit breaker hacia promotion-service |
