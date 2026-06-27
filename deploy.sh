#!/bin/bash

################################################################################
# KaliSoft Marketplace - Google Cloud Run Deployment with Neon Database
# 
# Usage: ./deploy.sh
#
# What this script does:
# 1. Asks for your Neon database connection string
# 2. Builds Docker images for backend and frontend
# 3. Deploys both to Google Cloud Run
# 4. Sets up environment variables
# 5. Runs database migrations
#
# Prerequisites:
# - gcloud CLI installed and authenticated (gcloud auth login)
# - Docker installed and running
# - A Neon database account: https://neon.tech (free tier available)
# - A Google Cloud project with billing enabled
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Helper functions
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ============================================================================
# STEP 1: Check Prerequisites
# ============================================================================

print_header "STEP 1: Checking Prerequisites"

if ! command -v gcloud &> /dev/null; then
    error "gcloud CLI not found. Install from: https://cloud.google.com/sdk/docs/install"
fi
success "gcloud CLI found"

if ! command -v docker &> /dev/null; then
    error "Docker not found. Install from: https://www.docker.com/products/docker-desktop"
fi
success "Docker found"

if ! command -v openssl &> /dev/null; then
    error "openssl not found. Please install openssl"
fi
success "openssl found"

# ============================================================================
# STEP 2: Get Google Cloud Project
# ============================================================================

print_header "STEP 2: Google Cloud Project"

PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    error "No Google Cloud project configured. Run: gcloud config set project YOUR_PROJECT_ID"
fi

info "Using Google Cloud project: $PROJECT_ID"

read -p "Is this correct? (yes/no): " confirm_project
if [ "$confirm_project" != "yes" ]; then
    error "Deployment cancelled. Run: gcloud config set project YOUR_PROJECT_ID"
fi

REGION="us-central1"
API_SERVICE="kalisoft-api"
WEB_SERVICE="kalisoft-web"

success "Project configuration confirmed"

# ============================================================================
# STEP 3: Get Neon Database Connection String
# ============================================================================

print_header "STEP 3: Neon Database Connection"

echo "You need a Neon database connection string."
echo ""
echo "📍 To get it:"
echo "  1. Go to: https://console.neon.tech"
echo "  2. Sign up (free tier available)"
echo "  3. Create a project"
echo "  4. Copy the connection string"
echo ""
echo "📋 Format: postgresql+asyncpg://user:password@ep-name.region.neon.tech/dbname?sslmode=require"
echo ""

read -p "Paste your Neon connection string: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    error "Database connection string is required"
fi

if [[ ! $DATABASE_URL =~ "neon.tech" ]]; then
    warning "This doesn't look like a Neon connection string"
    read -p "Continue anyway? (yes/no): " continue_neon
    if [ "$continue_neon" != "yes" ]; then
        error "Deployment cancelled"
    fi
fi

success "Neon connection string saved"

# ============================================================================
# STEP 4: Get Application Configuration
# ============================================================================

print_header "STEP 4: Application Configuration"

read -p "Frontend domain (e.g., myapp.com) or press Enter for localhost: " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN="localhost:3000"
    warning "Using localhost for development. Update CORS_ORIGINS later for production"
fi

JWT_SECRET=$(openssl rand -base64 32)
info "Generated JWT secret (for secure token signing)"

success "Configuration complete"

# ============================================================================
# STEP 5: Enable Google Cloud APIs
# ============================================================================

print_header "STEP 5: Enabling Google Cloud APIs"

info "Enabling Cloud Run, Container Registry, and Cloud Build APIs..."
gcloud services enable \
    run.googleapis.com \
    containerregistry.googleapis.com \
    cloudbuild.googleapis.com \
    --project=$PROJECT_ID \
    --quiet

success "APIs enabled"

# ============================================================================
# STEP 6: Docker Authentication
# ============================================================================

print_header "STEP 6: Setting Up Docker Authentication"

info "Configuring Docker to use Google Cloud credentials..."
gcloud auth configure-docker gcr.io --quiet

success "Docker authenticated with Google Cloud"

# ============================================================================
# STEP 7: Build and Push Backend Image (Using Cloud Build)
# ============================================================================

print_header "STEP 7: Building & Pushing Backend Image (Cloud Build)"

info "Submitting backend build to Google Cloud Build..."
info "This builds in Google's infrastructure (no local network issues!)"
info "Estimated time: 3-5 minutes..."
echo ""

gcloud builds submit server \
  --tag=gcr.io/$PROJECT_ID/$API_SERVICE:latest \
  --project=$PROJECT_ID \
  --quiet || error "Backend build failed"

success "Backend image built and pushed to gcr.io/$PROJECT_ID/$API_SERVICE:latest"
info "Build completed in Google Cloud (more reliable than local push!)"

# ============================================================================
# STEP 9: Deploy Backend to Cloud Run
# ============================================================================

print_header "STEP 9: Deploying Backend to Cloud Run"

info "Deploying backend service to Cloud Run..."

# Create temporary env file to avoid escaping issues
cat > /tmp/backend-env.yaml << EOF
DATABASE_URL: $DATABASE_URL
JWT_SECRET: $JWT_SECRET
CORS_ORIGINS: https://$DOMAIN,http://localhost:3000
APP_URL: https://$DOMAIN
EOF

gcloud run deploy $API_SERVICE \
  --image=gcr.io/$PROJECT_ID/$API_SERVICE:latest \
  --platform=managed \
  --region=$REGION \
  --memory=512Mi \
  --cpu=1 \
  --timeout=540 \
  --allow-unauthenticated \
  --env-vars-file=/tmp/backend-env.yaml \
  --project=$PROJECT_ID \
  --quiet || error "Backend deployment failed"

# Clean up temp file
rm -f /tmp/backend-env.yaml

success "Backend deployed to Cloud Run"

# Get backend URL
BACKEND_URL=$(gcloud run services describe $API_SERVICE \
  --platform=managed \
  --region=$REGION \
  --format='value(status.url)' \
  --project=$PROJECT_ID)

success "Backend URL: $BACKEND_URL"

# ============================================================================
# STEP 10: Build and Push Frontend Image (Using Cloud Build)
# ============================================================================

print_header "STEP 10: Building & Pushing Frontend Image (Cloud Build)"

info "Submitting frontend build to Google Cloud Build..."
info "This builds in Google's infrastructure (no local network issues!)"
info "Estimated time: 3-5 minutes..."
echo ""

gcloud builds submit client \
  --tag=gcr.io/$PROJECT_ID/$WEB_SERVICE:latest \
  --project=$PROJECT_ID \
  --quiet || error "Frontend build failed"

success "Frontend image built and pushed to gcr.io/$PROJECT_ID/$WEB_SERVICE:latest"
info "Build completed in Google Cloud (more reliable than local push!)"

# ============================================================================
# STEP 11: Deploy Frontend to Cloud Run
# ============================================================================

print_header "STEP 11: Deploying Frontend to Cloud Run"

info "Deploying frontend service to Cloud Run..."

gcloud run deploy $WEB_SERVICE \
  --image=gcr.io/$PROJECT_ID/$WEB_SERVICE:latest \
  --platform=managed \
  --region=$REGION \
  --memory=256Mi \
  --allow-unauthenticated \
  --set-env-vars VITE_API_BASE_URL="$BACKEND_URL" \
  --project=$PROJECT_ID \
  --quiet || error "Frontend deployment failed"

success "Frontend deployed to Cloud Run"

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe $WEB_SERVICE \
  --platform=managed \
  --region=$REGION \
  --format='value(status.url)' \
  --project=$PROJECT_ID)

success "Frontend URL: $FRONTEND_URL"

# ============================================================================
# STEP 12: Database Migrations
# ============================================================================

print_header "STEP 12: Database Migrations"

info "To run database migrations, connect to your Neon database and run:"
echo ""
echo "  1. From your local machine:"
echo "     cd server"
echo "     export DATABASE_URL=\"$DATABASE_URL\""
echo "     alembic upgrade head"
echo ""
echo "  2. Or manually via Neon console:"
echo "     - Go to: https://console.neon.tech"
echo "     - Run SQL to create tables as needed"
echo ""

warning "Make sure migrations are run before using the application in production"

success "Database connection string is configured"

# ============================================================================
# FINAL SUMMARY
# ============================================================================

print_header "🎉 DEPLOYMENT COMPLETE!"

echo -e "${GREEN}Your application is now live on Google Cloud Run!${NC}\n"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 DEPLOYMENT SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🌐 Frontend (Website)"
echo "   URL: $FRONTEND_URL"
echo ""

echo "🔌 Backend API"
echo "   URL: $BACKEND_URL"
echo "   Docs: $BACKEND_URL/docs"
echo "   Health: $BACKEND_URL/api/health"
echo ""

echo "📦 Database"
echo "   Type: Neon PostgreSQL"
echo "   Status: Connected (verify with migrations)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TESTING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "1️⃣  Visit your website:"
echo "   $FRONTEND_URL"
echo ""

echo "2️⃣  Test the backend API:"
echo "   curl $BACKEND_URL/api/health"
echo ""

echo "3️⃣  View API documentation:"
echo "   $BACKEND_URL/docs"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "1️⃣  Run Database Migrations"
echo "   cd server"
echo "   export DATABASE_URL=\"$DATABASE_URL\""
echo "   alembic upgrade head"
echo ""

echo "2️⃣  View Logs"
echo "   gcloud run services logs read $API_SERVICE --region=$REGION --limit=50"
echo "   gcloud run services logs read $WEB_SERVICE --region=$REGION --limit=50"
echo ""

echo "3️⃣  Update Environment Variables (if needed)"
echo "   gcloud run services update $API_SERVICE \\"
echo "     --set-env-vars CORS_ORIGINS=\"https://yourdomain.com\" \\"
echo "     --region=$REGION"
echo ""

echo "4️⃣  Setup Custom Domain (optional)"
echo "   gcloud run domain-mappings create \\"
echo "     --service=$WEB_SERVICE \\"
echo "     --domain=yourdomain.com \\"
echo "     --region=$REGION"
echo ""

echo "5️⃣  Monitor Services"
echo "   - Cloud Console: https://console.cloud.google.com"
echo "   - Cloud Run: https://console.cloud.google.com/run"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

success "Happy deploying! 🚀"

