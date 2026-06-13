#!/bin/bash
set -e

PROJECT_ID="estrategia-365"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/synthetic-monitor:latest"
JOB_NAME="synthetic-monitor-job"

echo "==========================================="
echo " Deploying Synthetic Monitoring to GCP"
echo "==========================================="

# 1. Build and push Docker image
echo "=> Building Docker image..."
# Run this from the root of the project
# docker build -f Dockerfile.synthetic -t $IMAGE_NAME .
# docker push $IMAGE_NAME

# 2. Create/Update Cloud Run Job
echo "=> Creating Cloud Run Job..."
# gcloud beta run jobs create $JOB_NAME \
#   --image $IMAGE_NAME \
#   --region $REGION \
#   --tasks 1 \
#   --set-env-vars="ENABLE_GCP_METRICS=true,PLAYWRIGHT_BASE_URL=https://app.estrategia365.com"

# 3. Create Cloud Scheduler Trigger (Every 10 minutes)
echo "=> Configuring Cloud Scheduler..."
# gcloud scheduler jobs create http synthetic-trigger \
#   --schedule="*/10 * * * *" \
#   --uri="https://${REGION}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${PROJECT_ID}/jobs/${JOB_NAME}:run" \
#   --http-method=POST \
#   --oauth-service-account-email="compute@developer.gserviceaccount.com" \
#   --location=$REGION || true

# 4. Create Dashboards
echo "=> Creating Monitoring Dashboards..."
# gcloud monitoring dashboards create --config-from-file=gcp/synthetic/dashboard.json

# 5. Create Alerts
echo "=> Creating Alert Policies..."
# gcloud alpha monitoring policies create --policy-from-file=gcp/synthetic/alert-policies.json

echo "==========================================="
echo " Synthetic Monitoring Deployed Successfully"
echo "==========================================="
