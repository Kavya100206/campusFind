output "cluster_name" {
  description = "EKS cluster name"
  value       = var.enable_eks ? module.eks.cluster_name : null
}

output "cluster_endpoint" {
  description = "EKS cluster control plane endpoint"
  value       = var.enable_eks ? module.eks.cluster_endpoint : null
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnets" {
  description = "List of private subnet IDs"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "List of public subnet IDs"
  value       = module.vpc.public_subnets
}

output "ebs_csi_role_arn" {
  description = "IAM role ARN used by the AWS EBS CSI driver"
  value       = var.enable_eks && var.enable_irsa_ebs_csi ? try(aws_iam_role.ebs_csi_driver[0].arn, null) : null
}
