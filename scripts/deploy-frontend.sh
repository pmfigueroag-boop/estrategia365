#!/usr/bin/env bash
# ============================================================
# deploy-frontend.sh — Manual Deploy Frontend to Cloud Run
# ============================================================
# Usage:
#   ./scripts/deploy-frontend.sh [TAG]
#
# Run from: estrategia-365/ directory

set -euo pipefail

PROJECT_ID="estrategia-365"
REGION="us-east1"
REGISTRY="us-east1-docker.pkg.dev"
REPO="estrategia365"
SERVICE_NAME="estrategia365-frontend"
API_URL="https://estrategia-365-api-240909983026.us-east1.run.app"

TAG="${1:-$(git rev-parse --short HEAD 2>/dev/null || echo 'latest')}"
IMAGE="${REGISTRY}/${PROJECT_ID}/${REPO}/frontend:${TAG}"

echo "================================================"
echo "  Estrategia 365 — Frontend Cloud Run Deploy"
echo "  Image:   ${IMAGE}"
echo "  API URL: ${API_URL}"
echo "================================================"

# Auth
gcloud config set project "${PROJECT_ID}"
gcloud auth configure-docker "${REGISTRY}" --quiet

# Build (linux/amd64 para Cloud Run)
echo ""
echo "🐳 Building..."
docker build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL="${API_URL}" \
  --tag "${IMAGE}" \
  --tag "${REGISTRY}/${PROJECT_ID}/${REPO}/frontend:latest" \
  --cache-from "${REGISTRY}/${PROJECT_ID}/${REPO}/frontend:latest" \
  .

# Push
echo ""
echo "📦 Pushing to Artifact Registry..."
docker push "${IMAGE}"
docker push "${REGISTRY}/${PROJECT_ID}/${REPO}/frontend:latest"

# Deploy
echo ""
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image="${IMAGE}" \
  --region="${REGION}" \
  --platform=managed \
  --memory=512Mi \
  --cpu=1 \
  --concurrency=80 \
  --min-instances=1 \
  --max-instances=5 \
  --timeout=60 \
  --port=8080 \
  --set-env-vars="NODE_ENV=production,NEXT_TELEMETRY_DISABLED=1" \
  --allow-unauthenticated

# Smoke test
echo ""
echo "🔍 Smoke test..."
FRONTEND_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --format='value(status.url)')

STATUS=$(curl -sf -o /dev/null -w "%{http_code}" \
  --retry 3 --retry-delay 3 \
  "${FRONTEND_URL}")

if [ "${STATUS}" != "200" ]; then
  echo "❌ Frontend not responding: HTTP ${STATUS}"
  exit 1
fi

echo "✅ Frontend deployed!"
echo "🌐 URL: ${FRONTEND_URL}"
