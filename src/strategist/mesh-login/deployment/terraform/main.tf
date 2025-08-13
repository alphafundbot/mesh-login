# deployment/terraform/main.tf
terraform {
  required_providers {
    google = { source = "hashicorp/google" version = "~> 4.0" }
  }
}
provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_secret_manager_secret" "gemini_key" {
  secret_id = "GEMINI_API_KEY"
  replication { automatic = true }
}
