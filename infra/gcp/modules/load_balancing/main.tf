# --- Variables ---
variable "project_id" { type = string }
variable "environment" { type = string }
variable "backend_service_primary" { type = string }
variable "backend_service_secondary" { type = string }
variable "frontend_service_primary" { type = string }
variable "frontend_service_secondary" { type = string }
variable "region_primary" { type = string }
variable "region_secondary" { type = string }

# --- Resources ---

# 1. Global Static IP Address
resource "google_compute_global_address" "default" {
  name = "estrategia365-glb-ip-${var.environment}"
}

# 2. Serverless NEGs for Backend
resource "google_compute_region_network_endpoint_group" "backend_primary_neg" {
  name                  = "backend-primary-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region_primary
  cloud_run {
    service = var.backend_service_primary
  }
}

resource "google_compute_region_network_endpoint_group" "backend_secondary_neg" {
  name                  = "backend-secondary-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region_secondary
  cloud_run {
    service = var.backend_service_secondary
  }
}

# 3. Global Backend Service for Backend App
resource "google_compute_backend_service" "backend_app" {
  name                  = "estrategia365-backend-${var.environment}"
  protocol              = "HTTPS"
  load_balancing_scheme = "EXTERNAL_MANAGED"

  backend {
    group = google_compute_region_network_endpoint_group.backend_primary_neg.id
  }

  backend {
    group = google_compute_region_network_endpoint_group.backend_secondary_neg.id
  }
}

# 4. Serverless NEGs for Frontend
resource "google_compute_region_network_endpoint_group" "frontend_primary_neg" {
  name                  = "frontend-primary-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region_primary
  cloud_run {
    service = var.frontend_service_primary
  }
}

resource "google_compute_region_network_endpoint_group" "frontend_secondary_neg" {
  name                  = "frontend-secondary-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region_secondary
  cloud_run {
    service = var.frontend_service_secondary
  }
}

# 5. Global Backend Service for Frontend App
resource "google_compute_backend_service" "frontend_app" {
  name                  = "estrategia365-frontend-${var.environment}"
  protocol              = "HTTPS"
  load_balancing_scheme = "EXTERNAL_MANAGED"

  backend {
    group = google_compute_region_network_endpoint_group.frontend_primary_neg.id
  }

  backend {
    group = google_compute_region_network_endpoint_group.frontend_secondary_neg.id
  }
}

# 6. URL Map (Routing rules)
resource "google_compute_url_map" "default" {
  name            = "estrategia365-url-map-${var.environment}"
  default_service = google_compute_backend_service.frontend_app.id

  host_rule {
    hosts        = ["*"]
    path_matcher = "allpaths"
  }

  path_matcher {
    name            = "allpaths"
    default_service = google_compute_backend_service.frontend_app.id

    path_rule {
      paths   = ["/api", "/api/*"]
      service = google_compute_backend_service.backend_app.id
    }
  }
}

# 7. HTTP(S) Proxy
resource "google_compute_target_http_proxy" "default" {
  name    = "estrategia365-http-proxy-${var.environment}"
  url_map = google_compute_url_map.default.id
}

# 8. Global Forwarding Rule
resource "google_compute_global_forwarding_rule" "default" {
  name                  = "estrategia365-forwarding-rule-${var.environment}"
  target                = google_compute_target_http_proxy.default.id
  port_range            = "80"
  ip_address            = google_compute_global_address.default.id
  load_balancing_scheme = "EXTERNAL_MANAGED"
}

# --- Outputs ---
output "load_balancer_ip" {
  value = google_compute_global_address.default.address
}
