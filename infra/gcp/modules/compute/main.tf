# --- Variables ---
variable "project_id" { type = string }
variable "region" { type = string }
variable "environment" { type = string }
variable "vpc_access_connector_id" { type = string }
variable "backend_sa_email" { type = string }
variable "frontend_sa_email" { type = string }
variable "db_connection_name" { type = string }
variable "redis_host" { type = string }
variable "redis_port" { type = number }
variable "documents_bucket" { type = string }
variable "assets_bucket" { type = string }
variable "secret_jwt_id" { type = string }
variable "secret_db_pass_id" { type = string }

# --- Resources ---

# 1. Backend Service (FastAPI)
resource "google_cloud_run_v2_service" "backend" {
  name     = "estrategia365-backend-${var.environment}"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL" # Or INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER if behind Gateway

  template {
    service_account = var.backend_sa_email

    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder, replaced by Cloud Build

      resources {
        limits = {
          cpu    = "2"
          memory = "2Gi"
        }
      }

      # Environment Variables
      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }
      env {
        name  = "REDIS_URL"
        value = "redis://${var.redis_host}:${var.redis_port}"
      }
      env {
        name  = "GCS_DOCUMENTS_BUCKET"
        value = var.documents_bucket
      }
      env {
        name  = "GCS_ASSETS_BUCKET"
        value = var.assets_bucket
      }
      env {
        name  = "DOCTRINAL_GATE_MODE"
        value = "STRICT"
      }
      env {
        name  = "LOG_LEVEL"
        value = "info"
      }
      env {
        name  = "AI_SERVICE_URL"
        value = google_cloud_run_v2_service.ai_service.uri
      }

      # Secrets via Secret Manager
      env {
        name = "JWT_SECRET_KEY"
        value_source {
          secret_key_ref {
            secret  = var.secret_jwt_id
            version = "latest"
          }
        }
      }

      env {
        name = "DB_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = var.secret_db_pass_id
            version = "latest"
          }
        }
      }

      env {
        # Constructed database URL using the secret password and Cloud SQL connection name (UNIX socket)
        name  = "DATABASE_URL"
        value = "postgresql+psycopg2://postgres:$${DB_PASSWORD}@/estrategia365_db?host=/cloudsql/${var.db_connection_name}"
      }

      # Cloud SQL UNIX Socket volume mount for proxy-less connection
      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }
    }

    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [var.db_connection_name]
      }
    }
    
    scaling {
      min_instance_count = 1
      max_instance_count = 10
    }

    vpc_access {
      connector = var.vpc_access_connector_id
      egress    = "PRIVATE_RANGES_ONLY"
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image, # Ignored so Cloud Build deployments aren't overwritten by terraform apply
    ]
  }
}

# Allow unauthenticated invocation for backend (since it has its own JWT validation)
resource "google_cloud_run_v2_service_iam_member" "backend_invoker" {
  name     = google_cloud_run_v2_service.backend.name
  location = google_cloud_run_v2_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# 2. Frontend Service (Next.js)
resource "google_cloud_run_v2_service" "frontend" {
  name     = "estrategia365-frontend-${var.environment}"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = var.frontend_sa_email

    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
      }

      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = google_cloud_run_v2_service.backend.uri
      }
    }
    
    scaling {
      min_instance_count = 1
      max_instance_count = 10
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }
}

resource "google_cloud_run_v2_service_iam_member" "frontend_invoker" {
  name     = google_cloud_run_v2_service.frontend.name
  location = google_cloud_run_v2_service.frontend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# 3. AI Service (LLM Microservice)
resource "google_cloud_run_v2_service" "ai_service" {
  name     = "estrategia365-ai-${var.environment}"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY" # Only accessible within GCP VPC/Project

  template {
    service_account = var.backend_sa_email # Share SA for internal inter-service auth

    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder

      resources {
        limits = {
          cpu    = "4"     # AI loads can be CPU intensive
          memory = "8Gi"   # Needs memory for LangChain / Contexts
        }
      }

      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }
    }
    
    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }

    vpc_access {
      connector = var.vpc_access_connector_id
      egress    = "PRIVATE_RANGES_ONLY"
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }
}

# IAM allow backend_sa to invoke AI Service
resource "google_cloud_run_v2_service_iam_member" "backend_invokes_ai" {
  name     = google_cloud_run_v2_service.ai_service.name
  location = google_cloud_run_v2_service.ai_service.location
  role     = "roles/run.invoker"
  member   = "serviceAccount:${var.backend_sa_email}"
}

# 4. Doctrinal Gate Proxy (FastAPI Sidecar/Middleware)
resource "google_cloud_run_v2_service" "doctrinal_proxy" {
  name     = "estrategia365-doctrinal-${var.environment}"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY" # Strictly internal zero-trust

  template {
    service_account = var.backend_sa_email

    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi" # Lightweight proxy
        }
      }

      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }
    }
    
    scaling {
      min_instance_count = 1 # Keep at least 1 warm for low latency gating
      max_instance_count = 10
    }

    vpc_access {
      connector = var.vpc_access_connector_id
      egress    = "PRIVATE_RANGES_ONLY"
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }
}

# IAM allow backend_sa to invoke Doctrinal Proxy
resource "google_cloud_run_v2_service_iam_member" "backend_invokes_doctrinal" {
  name     = google_cloud_run_v2_service.doctrinal_proxy.name
  location = google_cloud_run_v2_service.doctrinal_proxy.location
  role     = "roles/run.invoker"
  member   = "serviceAccount:${var.backend_sa_email}"
}

# --- Outputs ---
output "backend_url" {
  value = google_cloud_run_v2_service.backend.uri
}

output "frontend_url" {
  value = google_cloud_run_v2_service.frontend.uri
}

output "backend_name" {
  value = google_cloud_run_v2_service.backend.name
}

output "frontend_name" {
  value = google_cloud_run_v2_service.frontend.name
}
