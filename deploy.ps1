param(
    [string]$ProjectId = "gen-lang-client-0132243782",
    [string]$Region = "us-central1",
    [string]$Service = "kalisoft-app",
    [string]$DatabaseUrl = "postgresql+asyncpg://neondb_owner:npg_Dwk2AWz7GsBc@ep-dry-bonus-adx3z6mb.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
)

$ErrorActionPreference = "Stop"

function Write-Header($text) {
    Write-Host ""; Write-Host "==========================================" -ForegroundColor Blue
    Write-Host $text -ForegroundColor Blue; Write-Host "==========================================" -ForegroundColor Blue; Write-Host ""
}

Write-Header "STEP 1: Prerequisites"
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) { throw "gcloud not found" }
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw "docker not found" }
Write-Host "OK" -ForegroundColor Green

Write-Header "STEP 2: Project"
Write-Host "Project: $ProjectId" -ForegroundColor Blue
Write-Host "OK" -ForegroundColor Green

Write-Header "STEP 3: Enable APIs"
gcloud services enable run.googleapis.com containerregistry.googleapis.com cloudbuild.googleapis.com --project=$ProjectId --quiet
Write-Host "OK APIs enabled" -ForegroundColor Green

Write-Header "STEP 4: Docker auth"
gcloud auth configure-docker gcr.io --quiet
Write-Host "OK" -ForegroundColor Green

Write-Header "STEP 5: Build image (Cloud Build)"
gcloud builds submit . --tag="gcr.io/$ProjectId/$Service`:latest" --project=$ProjectId --quiet
Write-Host "OK Image built" -ForegroundColor Green

Write-Header "STEP 6: Deploy to Cloud Run"
$envFile = Join-Path $env:TEMP "app-env.yaml"
@"
DATABASE_URL: $DatabaseUrl
JWT_SECRET: $(-join ((1..32) | ForEach-Object { Get-Random -Maximum 256 } | ForEach-Object { "{0:X2}" -f $_ }))
CORS_ORIGINS: http://localhost:3000,http://127.0.0.1:3000
APP_URL: http://localhost:3000
"@ | Out-File -FilePath $envFile -Encoding utf8

gcloud run deploy $Service --image="gcr.io/$ProjectId/$Service`:latest" --platform=managed --region=$Region --memory=512Mi --cpu=1 --timeout=540 --allow-unauthenticated --env-vars-file=$envFile --project=$ProjectId --quiet
Remove-Item $envFile -ErrorAction SilentlyContinue

$AppUrl = (gcloud run services describe $Service --platform=managed --region=$Region --format='value(status.url)' --project=$ProjectId).Trim()
Write-Host "OK Deployed" -ForegroundColor Green

Write-Header "DEPLOYMENT COMPLETE"
Write-Host "Website: $AppUrl" -ForegroundColor Green
Write-Host "API Docs: $AppUrl/docs" -ForegroundColor Green
Write-Host "Health: $AppUrl/api/health" -ForegroundColor Green
Write-Host "WARNING: org-policy may block public access" -ForegroundColor Yellow
