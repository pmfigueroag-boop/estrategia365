variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The primary region for resources"
  type        = string
  default     = "us-central1"
}

variable "region_secondary" {
  description = "The secondary region for HA resources"
  type        = string
  default     = "us-east1"
}

variable "zone" {
  description = "The primary zone for resources"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment name (e.g., prod, staging, dev)"
  type        = string
  default     = "prod"
}

variable "db_password" {
  description = "Password for the database user"
  type        = string
  sensitive   = true
}

variable "jwt_secret_key" {
  description = "Secret key for JWT generation"
  type        = string
  sensitive   = true
}
