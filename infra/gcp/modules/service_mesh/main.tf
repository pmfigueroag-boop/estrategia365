# --- Variables ---
variable "project_id" { type = string }
variable "environment" { type = string }
variable "vpc_network_name" { type = string }

# --- Resources ---

# Habilitar APIs necesarias para Traffic Director (Cloud Service Mesh)
resource "google_project_service" "traffic_director_api" {
  project            = var.project_id
  service            = "trafficdirector.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "network_services_api" {
  project            = var.project_id
  service            = "networkservices.googleapis.com"
  disable_on_destroy = false
}

# Mesh (Andamiaje base para Traffic Director)
resource "google_network_services_mesh" "default" {
  name        = "estrategia365-mesh-${var.environment}"
  description = "Service Mesh para mTLS y enrutamiento interno de Microservicios"
  depends_on  = [google_project_service.network_services_api]
}

# Nota: A futuro aquí se añadirán los google_network_services_gateway, 
# tcp_routes y http_routes para conectar Execution, Formulation y Monitoring.

# --- Outputs ---
output "mesh_name" {
  value = google_network_services_mesh.default.name
}
