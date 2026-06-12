# Costos aproximados — CircleGuard (AWS)

Estimación mensual orientativa. Valores en USD, región us-east-1.

| Recurso | Dev | Stage | Prod |
|---------|-----|-------|------|
| EKS control plane | $73 | $73 | $73 |
| EC2 nodes (2-3 t3.medium) | $60 | $120 | $360 |
| RDS PostgreSQL | $15 | $50 | $280 |
| NAT Gateway | $35 | $35 | $70 |
| S3 + logs | $5 | $10 | $25 |
| **Total aprox.** | **~$190** | **~$290** | **~$810** |

## Optimización

- Dev: apagar cluster fuera de horario laboral
- Stage: instancias spot para node groups
- Prod: Reserved Instances para RDS y nodos estables

Local/minikube: costo $0 (solo hardware del desarrollador).
