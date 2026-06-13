# --- Variables ---
variable "project_id" { type = string }
variable "region" { type = string }
variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "db_password" {
  type      = string
  sensitive = true
}

# --- Resources ---
resource "google_sql_database_instance" "postgres" {
  name             = "estrategia365-db-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region
  
  settings {
    tier = "db-custom-2-8192" # 2 vCPU, 8GB RAM as requested
    availability_type = "REGIONAL" # Multi-zone High Availability
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = var.vpc_id
    }
    
    backup_configuration {
      enabled    = true
      start_time = "04:00"
    }
  }
}

resource "google_sql_database" "estrategia365_db" {
  name     = "estrategia365_db"
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "postgres_user" {
  name     = "postgres"
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# --- Outputs ---
output "connection_name" {
  value       = google_sql_database_instance.postgres.connection_name
  description = "The connection name of the Cloud SQL instance"
}
