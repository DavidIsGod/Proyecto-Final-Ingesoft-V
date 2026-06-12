# Terraform — CircleGuard

Infraestructura modular en AWS para dev, stage y prod.

## Estructura

```
terraform/
  modules/network/      # VPC, subnets, IGW
  modules/database/     # RDS PostgreSQL
  modules/kubernetes/   # EKS cluster + node group
  environments/dev|stage|prod/
```

## Inicializar

```bash
cd environments/dev
cp backend.tf.example backend.tf      # opcional: usar backend local comentando backend block
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars con valores ficticios

terraform init
terraform plan
terraform apply
```

## Backend remoto

El archivo `backend.tf.example` muestra configuración S3 + DynamoDB para state locking. Crear el bucket y tabla antes del primer `terraform init` con backend remoto, o usar state local para demos:

```bash
terraform init -backend=false
```

## Ambientes

| Ambiente | VPC CIDR   | DB instance  | EKS nodes |
|----------|------------|--------------|-----------|
| dev      | 10.0.0.0/16| db.t3.micro  | 1-3       |
| stage    | 10.1.0.0/16| db.t3.small  | 2-4       |
| prod     | 10.2.0.0/16| db.r6g.large | 3-6, Multi-AZ DB |

No commitear `terraform.tfvars` con contraseñas reales.
