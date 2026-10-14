variable "aws_region" {
  description = "AWS region for provisioning resources"
  type        = string
  default     = "ap-southeast-2"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "campusfind-eks"
}

variable "environment" {
  description = "Environment identifier (e.g. dev, prod)"
  type        = string
  default     = "dev"
}

variable "node_instance_type" {
  description = "EC2 instance type for EKS managed node group"
  type        = string
  default     = "t3.small"
}

variable "min_nodes" {
  description = "Minimum number of worker nodes"
  type        = number
  default     = 2
}

variable "desired_nodes" {
  description = "Desired number of worker nodes"
  type        = number
  default     = 2
}

variable "max_nodes" {
  description = "Maximum number of worker nodes (capped at 2 to stay within 5 vCPU quota: 2x t3.small = 4 vCPUs)"
  type        = number
  default     = 2
}

variable "enable_eks" {
  description = "Controls whether EKS cluster, node groups, and NAT gateway are provisioned. Set to false for Plan B (VPC-only)."
  type        = bool
  default     = true
}
