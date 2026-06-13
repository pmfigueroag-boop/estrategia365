# --- Variables ---
variable "project_id" { type = string }
variable "region" { type = string }
variable "environment" { type = string }
variable "vpc_id" { type = string }

# --- Resources ---
resource "google_redis_instance" "cache" {
  name           = "estrategia365-redis-${var.environment}"
  tier           = "STANDARD_HA"
  memory_size_gb = 1
  region         = var.region
  
  authorized_network = var.vpc_id
  connect_mode       = "PRIVATE_SERVICE_ACCESS"
  
  redis_version = "REDIS_7_0"
  display_name  = "Estrategia 365 Redis Cache"
}

# --- Outputs ---
output "redis_host" {
  value       = google_redis_instance.cache.host
  description = "The IP address of the Redis instance"
}

output "redis_port" {
  value       = google_redis_instance.cache.port
  description = "The port of the Redis instance"
}
