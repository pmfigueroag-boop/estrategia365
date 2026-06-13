resource "google_pubsub_topic" "plan_events" {
  name    = "plan-events-${var.environment}"
  project = var.project_id
}

resource "google_pubsub_topic" "okr_events" {
  name    = "okr-events-${var.environment}"
  project = var.project_id
}

resource "google_pubsub_topic" "simulation_events" {
  name    = "simulation-events-${var.environment}"
  project = var.project_id
}
