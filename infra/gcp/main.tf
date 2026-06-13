terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  # backend "gcs" {
  #   bucket = "YOUR_TERRAFORM_STATE_BUCKET"
  #   prefix = "terraform/state"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# 1. Network Module (VPC, Subnets, Serverless Access)
module "network" {
  source      = "./modules/network"
  project_id       = var.project_id
  region           = var.region
  region_secondary = var.region_secondary
  environment      = var.environment
}

# 2. Database Module (Cloud SQL)
module "database" {
  source       = "./modules/database"
  project_id   = var.project_id
  region       = var.region
  environment  = var.environment
  vpc_id       = module.network.vpc_id
  db_password  = var.db_password
  depends_on   = [module.network]
}

# 3. Cache Module (Memorystore)
module "cache" {
  source      = "./modules/cache"
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
  vpc_id      = module.network.vpc_id
  depends_on  = [module.network]
}

# 4. Storage Module (GCS)
module "storage" {
  source      = "./modules/storage"
  project_id  = var.project_id
  region      = var.region
  environment = var.environment
}

# 5. Security & IAM Module (Service Accounts, Secrets)
module "security" {
  source         = "./modules/security"
  project_id     = var.project_id
  environment    = var.environment
  db_password    = var.db_password
  jwt_secret_key = var.jwt_secret_key
}

# 6a. Compute Module Primary (Cloud Run Frontend & Backend)
module "compute_primary" {
  source                    = "./modules/compute"
  project_id                = var.project_id
  region                    = var.region
  environment               = var.environment
  vpc_access_connector_id   = module.network.serverless_connector_id
  backend_sa_email          = module.security.backend_sa_email
  frontend_sa_email         = module.security.frontend_sa_email
  db_connection_name        = module.database.connection_name
  redis_host                = module.cache.redis_host
  redis_port                = module.cache.redis_port
  documents_bucket          = module.storage.documents_bucket_name
  assets_bucket             = module.storage.assets_bucket_name
  secret_jwt_id             = module.security.jwt_secret_id
  secret_db_pass_id         = module.security.db_pass_secret_id
  depends_on = [
    module.network,
    module.database,
    module.cache,
    module.storage,
    module.security
  ]
}

# 6b. Compute Module Secondary (Cloud Run Frontend & Backend)
module "compute_secondary" {
  source                    = "./modules/compute"
  project_id                = var.project_id
  region                    = var.region_secondary
  environment               = "${var.environment}-sec"
  vpc_access_connector_id   = module.network.serverless_connector_id_secondary
  backend_sa_email          = module.security.backend_sa_email
  frontend_sa_email         = module.security.frontend_sa_email
  db_connection_name        = module.database.connection_name
  redis_host                = module.cache.redis_host
  redis_port                = module.cache.redis_port
  documents_bucket          = module.storage.documents_bucket_name
  assets_bucket             = module.storage.assets_bucket_name
  secret_jwt_id             = module.security.jwt_secret_id
  secret_db_pass_id         = module.security.db_pass_secret_id
  depends_on = [
    module.network,
    module.database,
    module.cache,
    module.storage,
    module.security
  ]
}

# 9. Global Load Balancing Module
module "load_balancing" {
  source                     = "./modules/load_balancing"
  project_id                 = var.project_id
  environment                = var.environment
  region_primary             = var.region
  region_secondary           = var.region_secondary
  backend_service_primary    = module.compute_primary.backend_name
  backend_service_secondary  = module.compute_secondary.backend_name
  frontend_service_primary   = module.compute_primary.frontend_name
  frontend_service_secondary = module.compute_secondary.frontend_name
  depends_on = [
    module.compute_primary,
    module.compute_secondary
  ]
}

# 7. Pub/Sub Module (Event-Driven Architecture)
module "pubsub" {
  source      = "./modules/pubsub"
  project_id  = var.project_id
  environment = var.environment
}

# 8. Compute Jobs Module (Cloud Run Jobs for Wargaming/Simulations)
module "compute_jobs" {
  source                  = "./modules/compute_jobs"
  project_id              = var.project_id
  edge_regions            = [var.region, var.region_secondary, "europe-west1"] # Edge nodes for low latency
  environment             = var.environment
  vpc_access_connector_id = module.network.serverless_connector_id
  backend_sa_email        = module.security.backend_sa_email
  db_connection_name      = module.database.connection_name
  secret_db_pass_id       = module.security.db_pass_secret_id
  depends_on = [
    module.network,
    module.database,
    module.security
  ]
}

# 10. Service Mesh Module (Traffic Director)
module "service_mesh" {
  source           = "./modules/service_mesh"
  project_id       = var.project_id
  environment      = var.environment
  vpc_network_name = module.network.vpc_id
  depends_on       = [module.network]
}

# 11. Cloud Spanner Module (Global Multi-Region DB)
module "spanner" {
  source      = "./modules/spanner"
  project_id  = var.project_id
  environment = var.environment
}
