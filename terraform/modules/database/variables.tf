variable "project_name" { type = string }
variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "allowed_cidr" { type = string }
variable "instance_class" { type = string }
variable "allocated_storage" { type = number }
variable "db_username" { type = string }
variable "db_password" {
  type      = string
  sensitive = true
}
variable "multi_az" { type = bool }
