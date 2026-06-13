resource "google_cloud_run_v2_job" "simulation_worker" {
  for_each = toset(var.edge_regions)
  name     = "simulation-job-worker-${each.key}-${var.environment}"
  location = each.key
  project  = var.project_id

  template {
    template {
      service_account = var.backend_sa_email
      
      vpc_access {
        connector = var.vpc_access_connector_id
        egress    = "ALL_TRAFFIC"
      }

      containers {
        # Using a dummy image or the same backend image. We assume a CI/CD pipeline deploys the real image.
        image = "us-docker.pkg.dev/cloudrun/container/job:latest"
        
        # Override the entrypoint to run the job script
        command = ["python", "job_runner.py"]
        
        env {
          name  = "APP_ENV"
          value = var.environment
        }
        
        env {
          name  = "DATABASE_URL"
          # Usually constructed from secrets at runtime
          value = "postgresql://postgres:REPLACEME@/estrategia365_db?host=/cloudsql/${var.db_connection_name}"
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
        
        resources {
          limits = {
            cpu    = "2"
            memory = "2Gi"
          }
        }
        
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
    }
  }
}
