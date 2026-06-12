output "vpc_id" { value = module.network.vpc_id }
output "db_endpoint" { value = module.database.endpoint }
output "eks_cluster_name" { value = module.kubernetes.cluster_name }
output "eks_cluster_endpoint" { value = module.kubernetes.cluster_endpoint }
