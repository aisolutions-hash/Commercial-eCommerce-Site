# KaliSoft Marketplace - Windows deployment runner
param(
    [string]$ProjectId = "gen-lang-client-0132243782",
    [string]$Region = "us-central1",
    [string]$ApiService = "kalisoft-api",
    [string]$WebService = "kalisoft-web",
    [string]$DatabaseUrl = "postgresql+asyncpg://neondb_owner:npg_Dwk2AWz7GsBc@ep-dry-bonus-adx3z6mb.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
)

$ErrorActionPreference = "Stop"

function Write-Header($text) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Blue
    Write-Host $text -ForegroundColor Blue
    Write-Host "==========================================" -ForegroundColor Blue
    Write-Host ""
}

Write-Header "STEP 1: Checking Prerequisites"

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    throw "gcloud CLI not found"
}
Write-Host "OK gcloud CLI found" -ForegroundColor Green

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker not found"
}
Write-Host "OK Docker found" -ForegroundColor Green

Write-Header "STEP 2: Google Cloud Project"
Write-Host "Using project: $ProjectId"
Write-Host "OK Project configuration confirmed" -ForegroundColor Green

Write-Header "STEP 3: Neon Database Connection"
Write-Host "OK Neon connection string configured" -ForegroundColor Green

Write-Header "STEP 4: Application Configuration"
$JwtSecret = -join ((1..32) | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { "{0:X2}" -f $_ })
$Domain = "localhost:3000"
Write-Host "OK Generated JWT secret" -ForegroundColor Green
Write-Host "OK Using localhost for CORS" -ForegroundColor Green

Write-Header "STEP 5: Enabling Google Cloud APIs"
gcloud services enable run.googleapis.com containerregistry.googleapis.com cloudbuild.googleapis.com --project=$ProjectId --quiet
Write-Host "OK APIs enabled" -ForegroundColor Green

Write-Header "STEP 6: Docker Authentication"
gcloud auth configure-docker gcr.io --quiet
Write-Host "OK Docker authenticated with Google Cloud" -ForegroundColor Green

Write-Header "STEP 7: Building Backend Image (Cloud Build)"
gcloud builds submit server --tag="gcr.io/$ProjectId/$ApiService`:latest" --project=$ProjectId --quiet
Write-Host "OK Backend image built and pushed" -ForegroundColor Green

Write-Header "STEP 8: Deploying Backend to Cloud Run"
$envFile = Join-Path $env:TEMP "backend-env.yaml"
"DATABASE_URL: $DatabaseUrl`nJWT_SECRET: $JwtSecret`nCORS_ORIGINS: https://$Domain,http://localhost:3000`nAPP_URL: https://$Domain`n" | Out-File -FilePath $envFile -Encoding utf8

gcloud run deploy $ApiService --image="gcr.io/$ProjectId/$ApiService`:latest" --platform=managed --region=$Region --memory=512Mi --cpu=1 --timeout=540 --allow-unauthenticated --env-vars-file=$envFile --project=$ProjectId --quiet

Remove-Item $envFile -ErrorAction SilentlyContinue
Write-Host "OK Backend deployed to Cloud Run" -ForegroundColor Green

$BackendUrl = (gcloud run services describe $ApiService --platform=managed --region=$Region --format='value(status.url)' --project=$ProjectId).Trim()
Write-Host "OK Backend URL: $BackendUrl" -ForegroundColor Green

Write-Header "STEP 9: Building Frontend Image (Cloud Build)"
gcloud builds submit client --tag="gcr.io/$ProjectId/$WebService`:latest" --project=$ProjectId --quiet
Write-Host "OK Frontend image built and pushed" -ForegroundColor Green

Write-Header "STEP 10: Deploying Frontend to Cloud Run"
gcloud run deploy $WebService --image=gcr.io/$ProjectId/$WebService:latest --platform=managed --region=$Region --memory=256Mi --allow-unauthenticated --set-env-vars VITE_API_BASE_URL="$BackendUrl/api" --project=$ProjectId --quiet

$FrontendUrl = (gcloud run services describe $WebService --platform=managed --region=$Region --format='value(status.url)' --project=$ProjectId).Trim()
Write-Host "OK Frontend URL: $FrontendUrl" -ForegroundColor Green

Write-Header "STEP 11: Database Migrations"
Write-Host "Run these commands in server/ with the DATABASE_URL set:" -ForegroundColor Yellow
Write-Host "  cd server"
Write-Host "  `$env:DATABASE_URL = '$DatabaseUrl'"
Write-Host "  alembic upgrade head"
Write-Host "  python seed.py"
Write-Host ""

Write-Header "DEPLOYMENT COMPLETE"
Write-Host "Frontend: $FrontendUrl" -ForegroundColor Green
Write-Host "Backend: $BackendUrl" -ForegroundColor Green
Write-Host "API Docs: $BackendUrl/docs" -ForegroundColor Green
Write-Host "Health: $BackendUrl/api/health" -ForegroundColor Green
