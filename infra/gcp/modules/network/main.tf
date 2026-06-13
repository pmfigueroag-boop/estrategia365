# --- Variables ---
variable "project_id" { type = string }
variable "region" { type = string }
variable "environment" { type = string }
variable "region_secondary" { type = string }

# --- Resources ---
resource "google_compute_network" "vpc_network" {
  name                    = "estrategia365-vpc-${var.environment}"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "private_subnet" {
  name          = "private-subnet-${var.environment}"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.vpc_network.id
  private_ip_google_access = true
}

resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-db-${var.environment}"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc_network.id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

resource "google_vpc_access_connector" "serverless_connector" {
  name          = "vpc-cx-${var.environment}"
  region        = var.region
  network       = google_compute_network.vpc_network.name
  ip_cidr_range = "10.8.0.0/28"
  machine_type  = "e2-micro"
  min_instances = 2
  max_instances = 3
  depends_on    = [google_compute_network.vpc_network]
}

resource "google_vpc_access_connector" "serverless_connector_secondary" {
  name          = "vpc-cx-sec-${var.environment}"
  region        = var.region_secondary
  network       = google_compute_network.vpc_network.name
  ip_cidr_range = "10.8.1.0/28"
  machine_type  = "e2-micro"
  min_instances = 2
  max_instances = 3
  depends_on    = [google_compute_network.vpc_network]
}

# --- Outputs ---
output "vpc_id" {
  value = google_compute_network.vpc_network.id
}

output "private_subnet_id" {
  value = google_compute_subnetwork.private_subnet.id
}

output "serverless_connector_id" {
  value = google_vpc_access_connector.serverless_connector.id
}

output "serverless_connector_id_secondary" {
  value = google_vpc_access_connector.serverless_connector_secondary.id
}
