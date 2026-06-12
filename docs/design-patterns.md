# Patrones de diseño — CircleGuard

## Patrones existentes en la arquitectura

| Patrón | Ubicación | Propósito |
|--------|-----------|-----------|
| Event-driven | Kafka entre form, promotion, notification | Desacoplar propagación de estado y notificaciones |
| Repository | JPA/Neo4j repositories | Abstraer persistencia |
| Strategy | `EmailService`, `SmsService`, `PushService` | Canales de notificación intercambiables |
| K-Anonymity | `KAnonymityFilter` en dashboard | Privacidad en analytics |
| Dual-chain auth | `DualChainAuthenticationProvider` | LDAP universidad + usuarios locales |
| Retry | `@Retryable` en notification-service | Reintentos en envío multicanal |

## Patrones implementados (proyecto final)

### Circuit Breaker (resiliencia)

`PromotionClient` en dashboard-service usa Resilience4j. Si promotion-service falla repetidamente, el circuito se abre y devuelve respuesta degradada sin bloquear el dashboard.

Config: `resilience4j.circuitbreaker.instances.promotionClient` en `application.yml`.

### External Configuration

`CircleGuardProperties` (`@ConfigurationProperties`) en auth y dashboard lee URLs y flags desde `application.yml`, variables de entorno o ConfigMaps de Kubernetes (`application-k8s.yml`).

Beneficio: cambiar endpoints por ambiente sin recompilar.

### Feature Toggle

- `circleguard.features.analytics-enabled` en dashboard desactiva endpoints de analytics.
- `unconfirmedFencingEnabled` en promotion (`AdminController`) controla cercado sin confirmación de laboratorio.

Beneficio: activar/desactivar capacidades en runtime para pruebas o incidentes.

### Métrica de negocio (Observer/Meter)

`PromotionMetrics` registra `circleguard.promotions.total` en Prometheus cada vez que se actualiza un estado de salud.
