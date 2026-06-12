variable "aws_region" { type = string }
variable "project_name" { type = string }
variable "environment" { type = string }
variable "vpc_cidr" { type = string }
variable "public_subnet_cidrs" { type = list(string) }
variable "private_subnet_cidrs" { type = list(string) }
variable "availability_zones" { type = list(string) }
variable "db_instance_class" { type = string }
variable "db_allocated_storage" { type = number }
variable "db_username" { type = string }
variable "db_password" {
  type      = string
  sensitive = true
}
variable "eks_cluster_version" { type = string }
variable "eks_node_instance_types" { type = list(string) }
variable "eks_node_desired_size" { type = number }
variable "eks_node_min_size" { type = number }
variable "eks_node_max_size" { type = number }
