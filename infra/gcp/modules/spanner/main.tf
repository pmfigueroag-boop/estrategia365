# --- Variables ---
variable "project_id" { type = string }
variable "environment" { type = string }

# --- Resources ---
# Aprovisionar Instancia Global (Multi-Región)
resource "google_spanner_instance" "global_instance" {
  name             = "estrategia365-spanner-${var.environment}"
  config           = "nam-eur-asia1" # Topología global (Multi-continent)
  display_name     = "Estrategia 365 Global Spanner"
  num_nodes        = 1               # Mínimo para producción HA
  labels = {
    env = var.environment
  }
}

# Base de Datos con Dialecto PostgreSQL nativo
resource "google_spanner_database" "estrategia365_db" {
  instance         = google_spanner_instance.global_instance.name
  name             = "estrategia365-db"
  database_dialect = "POSTGRESQL"
}

# --- Outputs ---
output "spanner_instance_name" {
  value = google_spanner_instance.global_instance.name
}

output "spanner_database_name" {
  value = google_spanner_database.estrategia365_db.name
}
