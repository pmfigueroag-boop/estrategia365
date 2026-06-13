# --- Variables ---
variable "project_id" { type = string }
variable "region" { type = string }
variable "environment" { type = string }

# --- Resources ---
resource "google_storage_bucket" "documents" {
  name          = "${var.project_id}-documents-${var.environment}"
  location      = "US" # Multi-regional HA
  force_destroy = false

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }
}

resource "google_storage_bucket" "assets" {
  name          = "${var.project_id}-assets-${var.environment}"
  location      = "US" # Multi-regional HA
  force_destroy = false

  uniform_bucket_level_access = true

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "OPTIONS"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Make assets bucket public read
resource "google_storage_bucket_iam_binding" "assets_public_rule" {
  bucket = google_storage_bucket.assets.name
  role   = "roles/storage.objectViewer"
  members = [
    "allUsers",
  ]
}

# --- Outputs ---
output "documents_bucket_name" {
  value = google_storage_bucket.documents.name
}

output "assets_bucket_name" {
  value = google_storage_bucket.assets.name
}
