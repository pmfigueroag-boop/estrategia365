output "backend_url" {
  description = "The URL of the Backend Cloud Run service"
  value       = module.compute.backend_url
}

output "frontend_url" {
  description = "The URL of the Frontend Cloud Run service"
  value       = module.compute.frontend_url
}

output "database_connection_name" {
  description = "The Cloud SQL instance connection name"
  value       = module.database.connection_name
}

output "redis_host" {
  description = "The IP address of the Memorystore Redis instance"
  value       = module.cache.redis_host
}
