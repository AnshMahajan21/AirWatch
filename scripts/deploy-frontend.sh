#!/usr/bin/env bash
set -euo pipefail

# AirWatch - Frontend Build and AWS S3/CloudFront Deployment Script
# Usage: ./scripts/deploy-frontend.sh <STACK_NAME> <AWS_REGION>

STACK_NAME="${1:-airwatch-prod}"
REGION="${2:-ap-south-1}"

echo "=================================================="
echo "  Deploying AirWatch Frontend to AWS (Region: $REGION)"
echo "=================================================="

# 1. Fetch CloudFormation stack outputs
echo "Fetching AWS CloudFormation outputs for stack '$STACK_NAME'..."
API_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" \
  --output text)

S3_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" \
  --output text)

CF_DIST_ID=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" \
  --output text)

echo "Found API Gateway: $API_URL"
echo "Found Target S3 Bucket: $S3_BUCKET"
echo "Found CloudFront Distribution: $CF_DIST_ID"

# 2. Build Vite Frontend with production API Gateway endpoint
echo "Building React frontend with VITE_API_URL=$API_URL..."
VITE_API_URL="$API_URL" npm run build

# 3. Sync built assets to S3
echo "Syncing /dist to s3://$S3_BUCKET..."
aws s3 sync dist/ "s3://$S3_BUCKET" \
  --delete \
  --region "$REGION" \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html"

# Upload index.html with no-cache so SPA updates immediately
aws s3 cp dist/index.html "s3://$S3_BUCKET/index.html" \
  --region "$REGION" \
  --cache-control "no-cache, no-store, must-revalidate"

# 4. Invalidate CloudFront CDN Cache
echo "Creating CloudFront cache invalidation for distribution $CF_DIST_ID..."
aws cloudfront create-invalidation \
  --distribution-id "$CF_DIST_ID" \
  --paths "/*" \
  --output text

echo "=================================================="
echo "🎉 AirWatch frontend successfully deployed to CloudFront!"
echo "=================================================="
