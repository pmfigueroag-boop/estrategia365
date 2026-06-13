output "topic_plan_events_name" {
  value = google_pubsub_topic.plan_events.name
}

output "topic_okr_events_name" {
  value = google_pubsub_topic.okr_events.name
}

output "topic_simulation_events_name" {
  value = google_pubsub_topic.simulation_events.name
}
