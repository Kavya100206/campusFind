data "aws_availability_zones" "available" {
  state = "available"
  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.8.1"

  name = "campusfind-vpc"
  cidr = "10.20.0.0/16"

  azs             = slice(data.aws_availability_zones.available.names, 0, 2)
  private_subnets = ["10.20.1.0/24", "10.20.2.0/24"]
  public_subnets  = ["10.20.101.0/24", "10.20.102.0/24"]

  enable_nat_gateway = var.enable_eks
  single_nat_gateway = var.enable_eks

  public_subnet_tags = {
    "kubernetes.io/role/elb"                    = 1
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb"           = 1
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }

  tags = {
    Environment = var.environment
  }
}

# --- IAM Role for EBS CSI Driver (IRSA) ---
data "aws_iam_policy_document" "ebs_csi_assume_role_policy" {
  count = var.enable_eks && var.enable_irsa_ebs_csi ? 1 : 0

  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    effect  = "Allow"

    condition {
      test     = "StringEquals"
      variable = "${replace(try(module.eks.cluster_oidc_issuer_url, ""), "https://", "")}:sub"
      values   = ["system:serviceaccount:kube-system:ebs-csi-controller-sa"]
    }

    condition {
      test     = "StringEquals"
      variable = "${replace(try(module.eks.cluster_oidc_issuer_url, ""), "https://", "")}:aud"
      values   = ["sts.amazonaws.com"]
    }

    principals {
      identifiers = [try(module.eks.oidc_provider_arn, "")]
      type        = "Federated"
    }
  }
}

resource "aws_iam_role" "ebs_csi_driver" {
  count              = var.enable_eks && var.enable_irsa_ebs_csi ? 1 : 0
  name_prefix        = "${var.cluster_name}-ebs-csi-"
  assume_role_policy = data.aws_iam_policy_document.ebs_csi_assume_role_policy[0].json

  tags = {
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ebs_csi_policy" {
  count      = var.enable_eks && var.enable_irsa_ebs_csi ? 1 : 0
  role       = aws_iam_role.ebs_csi_driver[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
}

# --- EKS Cluster ---
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "20.37.1"

  create = var.enable_eks

  cluster_name    = var.cluster_name
  cluster_version = "1.35"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access           = true
  enable_cluster_creator_admin_permissions = true
  enable_irsa                              = var.enable_irsa_ebs_csi

  # Cost optimization for capstone demo: disable KMS CMK and CloudWatch log group
  create_kms_key              = false
  cluster_encryption_config   = {}
  create_cloudwatch_log_group = false
  cluster_enabled_log_types   = []

  cluster_addons = merge(
    {
      metrics-server = {
        most_recent = true
      }
    },
    var.enable_irsa_ebs_csi ? {
      aws-ebs-csi-driver = {
        most_recent              = true
        service_account_role_arn = try(aws_iam_role.ebs_csi_driver[0].arn, null)
      }
    } : {}
  )

  eks_managed_node_groups = {
    main = {
      instance_types = [var.node_instance_type]
      min_size       = var.min_nodes
      max_size       = var.max_nodes
      desired_size   = var.desired_nodes

      ami_type = "AL2023_x86_64_STANDARD"
    }
  }

  tags = {
    Environment = var.environment
  }
}
