#!/bin/bash

# SpeedyCRM Webhook Service - Cloud Run Deployment Script
# This script deploys the webhook service to Cloud Run

PROJECT_ID="my-clever-crm"
SERVICE_NAME="speedycrm-webhook"
REGION="us-central1"

echo "🚀 Deploying SpeedyCRM Webhook Service to Cloud Run..."
echo ""

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
  --source . \
  --project=$PROJECT_ID \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=10 \
  --min-instances=0 \
  --timeout=60s \
  --ingress=all \
  --port=8080

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Service URL:"
gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)'
echo ""
echo "Test endpoint:"
echo "$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')/test?apiKey=scr-webhook-2025-secure-key-abc123"
echo ""
echo "Production webhook endpoint:"
echo "$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')/webhook?apiKey=scr-webhook-2025-secure-key-abc123"