#!/bin/bash
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
print_header() { echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n${BLUE}$1${NC}\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"; }
success() { echo -e "${GREEN}✓ $1${NC}"; }
error() { echo -e "${RED}✗ $1${NC}"; exit 1; }
warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
info() { echo -e "${BLUE}ℹ $1${NC}"; }

print_header "STEP 1: Prerequisites"
if ! command -v gcloud &> /dev/null; then error "gcloud not found"; fi
if ! command -v docker &> /dev/null; then error "docker not found"; fi
success "Prerequisites OK"

print_header "STEP 2: Project"
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then error "No project set. Run: gcloud config set project YOUR_PROJECT_ID"; fi
info "Project: $PROJECT_ID"
read -p "Correct? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then error "Cancelled. Set project: gcloud config set project YOUR_PROJECT_ID"; fi
REGION="us-central1"
SERVICE="kalisoft-app"
success "Project: $PROJECT_ID"

print_header "STEP 3: Database"
echo "Neon connection string needed."
echo "Format: postgresql+asyncpg://user:password@ep-name.region.neon.tech/dbname?sslmode=require"
read -p "Paste: " DATABASE_URL
if [ -z "$DATABASE_URL" ]; then error "Required"; fi
if [[ ! $DATABASE_URL =~ "neon.tech" ]]; then
    warning "Doesn't look like Neon URL"
    read -p "Continue? (yes/no): " cont
    if [ "$cont" != "yes" ]; then error "Cancelled"; fi
fi
success "Database URL saved"

print_header "STEP 4: Config"
read -p "Domain (Enter for localhost): " DOMAIN
DOMAIN=${DOMAIN:-localhost:3000}
JWT_SECRET=$(openssl rand -base64 32)
success "Config done"

print_header "STEP 5: Enable APIs"
gcloud services enable run.googleapis.com containerregistry.googleapis.com cloudbuild.googleapis.com --project=$PROJECT_ID --quiet
success "APIs enabled"

print_header "STEP 6: Docker auth"
gcloud auth configure-docker gcr.io --quiet
success "Docker auth OK"

print_header "STEP 7: Build image (Cloud Build)"
info "Building single container (client + server)..."
gcloud builds submit . \
  --tag=gcr.io/$PROJECT_ID/$SERVICE:latest \
  --project=$PROJECT_ID \
  --quiet || error "Build failed"
success "Image built: gcr.io/$PROJECT_ID/$SERVICE:latest"

print_header "STEP 8: Deploy to Cloud Run"
cat > /tmp/app-env.yaml << EOF
DATABASE_URL: $DATABASE_URL
JWT_SECRET: $JWT_SECRET
CORS_ORIGINS: http://localhost:3000,http://127.0.0.1:3000
APP_URL: https://$DOMAIN
EOF

gcloud run deploy $SERVICE \
  --image=gcr.io/$PROJECT_ID/$SERVICE:latest \
  --platform=managed \
  --region=$REGION \
  --memory=512Mi \
  --cpu=1 \
  --timeout=540 \
  --allow-unauthenticated \
  --env-vars-file=/tmp/app-env.yaml \
  --project=$PROJECT_ID \
  --quiet || error "Deploy failed"
rm -f /tmp/app-env.yaml

APP_URL=$(gcloud run services describe $SERVICE \
  --platform=managed \
  --region=$REGION \
  --format='value(status.url)' \
  --project=$PROJECT_ID)
success "App URL: $APP_URL"

print_header "STEP 9: Migrations"
info "Run from local machine:"
echo "  cd server"
echo "  export DATABASE_URL=\"$DATABASE_URL\""
echo "  alembic upgrade head"
echo "  python seed.py"

print_header "🎉 DEPLOYMENT COMPLETE"
echo "Website: $APP_URL"
echo "API Docs: $APP_URL/docs"
echo "Health: $APP_URL/api/health"
echo ""
warning "Verify IAM: org-policy may block public access"
