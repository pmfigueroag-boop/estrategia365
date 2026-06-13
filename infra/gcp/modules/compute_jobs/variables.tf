variable "project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "edge_regions" {
  description = "List of GCP Regions for Edge Compute"
  type        = list(string)
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "vpc_access_connector_id" {
  description = "VPC connector ID for private networking"
  type        = string
}

variable "backend_sa_email" {
  description = "Service account email to run the job"
  type        = string
}

variable "db_connection_name" {
  description = "Cloud SQL connection name"
  type        = string
}

variable "secret_db_pass_id" {
  description = "Secret ID for DB password"
  type        = string
}
