# --- Variables ---
variable "project_id" { type = string }
variable "environment" { type = string }
variable "db_password" {
  type      = string
  sensitive = true
}
variable "jwt_secret_key" {
  type      = string
  sensitive = true
}

# --- Resources ---

# 1. Service Accounts
resource "google_service_account" "backend_sa" {
  account_id   = "estrategia365-backend-${var.environment}"
  display_name = "Backend Service Account for Cloud Run"
}

resource "google_service_account" "frontend_sa" {
  account_id   = "estrategia365-frontend-${var.environment}"
  display_name = "Frontend Service Account for Cloud Run"
}

# 2. Secret Manager
resource "google_secret_manager_secret" "db_password" {
  secret_id = "db-password-${var.environment}"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_password_data" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = var.db_password
}

resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret-key-${var.environment}"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "jwt_secret_data" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = var.jwt_secret_key
}

# 3. IAM Bindings for Backend SA
resource "google_project_iam_member" "backend_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "backend_secret_accessor_db" {
  secret_id = google_secret_manager_secret.db_password.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.backend_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "backend_secret_accessor_jwt" {
  secret_id = google_secret_manager_secret.jwt_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.backend_sa.email}"
}

# Add IAM for Storage (Backend can read/write documents and assets)
resource "google_project_iam_member" "backend_storage_admin" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

# Cloud Trace & Logging are generally available to Cloud Run default execution environments,
# but it's good practice to assign them.
resource "google_project_iam_member" "backend_trace_agent" {
  project = var.project_id
  role    = "roles/cloudtrace.agent"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

resource "google_project_iam_member" "backend_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

# Pub/Sub Publisher role for backend EDA
resource "google_project_iam_member" "backend_pubsub_publisher" {
  project = var.project_id
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

# Cloud Run Invoker role (so API can trigger Cloud Run Jobs)
resource "google_project_iam_member" "backend_run_invoker" {
  project = var.project_id
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.backend_sa.email}"
}

# --- Outputs ---
output "backend_sa_email" {
  value = google_service_account.backend_sa.email
}

output "frontend_sa_email" {
  value = google_service_account.frontend_sa.email
}

output "db_pass_secret_id" {
  value = google_secret_manager_secret.db_password.secret_id
}

output "jwt_secret_id" {
  value = google_secret_manager_secret.jwt_secret.secret_id
}
