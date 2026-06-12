# Infraestructura — CircleGuard

## Local (desarrollo)

```bash
docker-compose -f docker-compose.dev.yml up -d
./gradlew bootRun --parallel
```

## Kubernetes

Manifiestos en `k8s/`:

- Namespace `circleguard`
- Infraestructura: PostgreSQL, Neo4j, Kafka, Redis
- 8 deployments de microservicios con probes y ConfigMaps
- RBAC con ServiceAccounts por servicio
- Ingress TLS de ejemplo

```bash
kubectl apply -f k8s/namespace.yaml
cp k8s/config/secrets.example.yaml k8s/config/secrets.yaml
kubectl apply -k k8s/
```

## Terraform (AWS)

Estructura modular en `terraform/`:

- `modules/network` — VPC, subnets
- `modules/database` — RDS PostgreSQL
- `modules/kubernetes` — EKS

Ambientes: `environments/dev`, `stage`, `prod` con tamaños distintos.

```bash
cd terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars
terraform init && terraform plan
```

Backend remoto de ejemplo: S3 + DynamoDB (`backend.tf.example`).

## Ambientes

| Ambiente | Branch/tag | Deploy workflow |
|----------|------------|-----------------|
| dev | develop | deploy-dev.yml |
| stage | main | deploy-stage.yml |
| prod | v*.*.* | deploy-prod.yml (aprobación manual) |

## Alcance futuro (bonificaciones PDF)

Multi-cloud, service mesh (Istio), chaos engineering y FinOps no están implementados. La base actual permite extender con los mismos manifiestos y módulos Terraform.
