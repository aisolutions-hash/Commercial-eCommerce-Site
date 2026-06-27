# Step-by-Step Deployment Guide (For Beginners)

## 🎯 Goal
Deploy your KaliSoft marketplace to Google Cloud in 15 minutes

## ⏱️ Time Estimates
- Setup: 5 minutes
- Deployment: 10-15 minutes
- Testing: 5 minutes

---

## 📋 Prerequisites Checklist

Before you start, make sure you have:

- [ ] Google Cloud Project created
- [ ] Billing enabled on Google Cloud
- [ ] `gcloud` CLI installed
- [ ] `gcloud auth login` done
- [ ] Neon database created
- [ ] Neon connection string copied

**Don't have these?** See below.

---

## 🚀 EXECUTION GUIDE

### ✅ Step 0: Preparation (Do This First!)

#### A. Create Google Cloud Project

1. Go to: https://console.cloud.google.com
2. Click the **Project** dropdown (top left)
3. Click **New Project**
4. Name it: `kalisoft-marketplace`
5. Click **Create**
6. Wait 1-2 minutes for project to be created
7. Click on your project name to select it

#### B. Enable Billing

1. In Google Cloud Console
2. Click **Billing** (left menu)
3. Click **Link a Billing Account**
4. Follow the steps (need credit card)
5. ✅ Billing enabled

#### C. Get Your Project ID

1. In Google Cloud Console
2. Top left, see your project name/ID
3. **Copy the PROJECT_ID** (looks like: `kalisoft-marketplace-123`)
4. Save it somewhere safe

#### D. Create Neon Database

1. Go to: https://console.neon.tech
2. Click **Sign Up**
3. Use Google or email
4. Create project named: `kalisoft`
5. **Copy the connection string** (full string from console)
6. Save it somewhere safe

Format looks like:
```
postgresql+asyncpg://user:password@ep-cool-name.us-east-1.neon.tech/neondb?sslmode=require
```

#### E. Install and Setup gcloud

**For Windows:**
```bash
# Download and install from:
# https://cloud.google.com/sdk/docs/install-gcloud-windows

# Then authenticate:
gcloud auth login
```

**For macOS:**
```bash
brew install google-cloud-sdk
gcloud auth login
```

**For Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud auth login
```

#### F. Set Your Project

```bash
# Replace YOUR_PROJECT_ID with actual ID from Step C
gcloud config set project YOUR_PROJECT_ID

# Verify
gcloud config list
# Should show your project
```

---

### 🚀 Step 1: Open Cloud Shell

1. Go to: https://console.cloud.google.com
2. Click the **Cloud Shell** icon (looks like `>_`) top right
3. Wait for terminal to open (takes 30 seconds)
4. You should see: `user@cloudshell:~$`

---

### 🚀 Step 2: Clone Your Repository

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/Commercial-eCommerce-Site.git

# Navigate into it
cd Commercial-eCommerce-Site

# Verify deploy.sh exists
ls -la deploy.sh
```

**Expected output:** Shows `deploy.sh` file

---

### 🚀 Step 3: Make Script Executable

```bash
chmod +x deploy.sh
```

**What this does:** Allows the script to run

---

### 🚀 Step 4: Run the Deployment

```bash
./deploy.sh
```

---

### 🚀 Step 5: Answer the Script's Questions

#### Question 1: Confirm Project
```
Is this correct? (yes/no): yes
```
Press **Enter** to confirm

#### Question 2: Paste Neon Connection String
```
Paste your Neon connection string: 
```
Right-click and paste your connection string (from Step 0.D)

Should look like:
```
postgresql+asyncpg://user:password@ep-name.us-east-1.neon.tech/dbname?sslmode=require
```

#### Question 3: Enter Domain
```
Frontend domain (e.g., myapp.com) or press Enter for localhost:
```
Press **Enter** (unless you have a custom domain)

---

### ⏳ Step 6: Wait for Deployment

The script will:

```
STEP 1: Checking Prerequisites
✓ gcloud CLI found
✓ Docker found
✓ openssl found

STEP 2: Google Cloud Project
ℹ Using Google Cloud project: your-project-id
✓ Project configuration confirmed

STEP 3: Neon Database Connection
✓ Neon connection string saved

STEP 4: Application Configuration
✓ Configuration complete

STEP 5: Enabling Google Cloud APIs
ℹ Enabling Cloud Run, Container Registry, and Cloud Build APIs...
✓ APIs enabled

STEP 6: Setting Up Docker Authentication
ℹ Configuring Docker to use Google Cloud credentials...
✓ Docker authenticated with Google Cloud

STEP 7: Building & Pushing Backend Image (Cloud Build)
ℹ Submitting backend build to Google Cloud Build...
ℹ This builds in Google's infrastructure (no local network issues!)
ℹ Estimated time: 3-5 minutes...

(waiting...)

✓ Backend image built and pushed
ℹ Build completed in Google Cloud

STEP 8: Deploying Backend to Cloud Run
ℹ Deploying backend service to Cloud Run...
✓ Backend deployed to Cloud Run
✓ Backend URL: https://kalisoft-api-xxxxx.run.app

STEP 9: Building & Pushing Frontend Image (Cloud Build)
ℹ Submitting frontend build to Google Cloud Build...
ℹ Estimated time: 3-5 minutes...

(waiting...)

✓ Frontend image built and pushed
ℹ Build completed in Google Cloud

STEP 10: Deploying Frontend to Cloud Run
ℹ Deploying frontend service to Cloud Run...
✓ Frontend deployed to Cloud Run
✓ Frontend URL: https://kalisoft-web-xxxxx.run.app

STEP 11: Database Migrations
ℹ To run database migrations, connect to your Neon database...
✓ Database connection string is configured

🎉 DEPLOYMENT COMPLETE!

📊 DEPLOYMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Frontend (Website)
   URL: https://kalisoft-web-xxxxx.run.app

🔌 Backend API
   URL: https://kalisoft-api-xxxxx.run.app
   Docs: https://kalisoft-api-xxxxx.run.app/docs
   Health: https://kalisoft-api-xxxxx.run.app/api/health

📦 Database
   Type: Neon PostgreSQL
   Status: Connected (verify with migrations)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Visit your website:
   https://kalisoft-web-xxxxx.run.app

2️⃣  Test the backend API:
   curl https://kalisoft-api-xxxxx.run.app/api/health

3️⃣  View API documentation:
   https://kalisoft-api-xxxxx.run.app/docs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Run Database Migrations
   cd server
   export DATABASE_URL="your-neon-connection-string"
   alembic upgrade head

2️⃣  View Logs
   gcloud run services logs read kalisoft-api --region=us-central1 --limit=50
   gcloud run services logs read kalisoft-web --region=us-central1 --limit=50

(more instructions shown)
```

---

### ✅ Step 7: Script Completed Successfully!

When you see:

```
✓ Happy deploying! 🚀
```

**CONGRATULATIONS!** Your app is deployed! 🎉

---

### 📝 Step 8: Copy Important Information

Save these URLs (shown at the end):

```
Frontend: https://kalisoft-web-xxxxx.run.app
Backend:  https://kalisoft-api-xxxxx.run.app
API Docs: https://kalisoft-api-xxxxx.run.app/docs
```

---

## 🧪 Step 9: Test Everything

### Test 1: Backend Health Check

```bash
# Copy this command from output, replace xxxxx with your URL
curl https://kalisoft-api-xxxxx.run.app/api/health

# Expected response:
{"status":"ok"}
```

### Test 2: Open Website

1. Go to: `https://kalisoft-web-xxxxx.run.app`
2. You should see your website!
3. Try logging in or viewing products

### Test 3: View API Documentation

1. Go to: `https://kalisoft-api-xxxxx.run.app/docs`
2. You see Swagger UI with all endpoints

---

## 🗄️ Step 10: Run Database Migrations

**This creates the database tables:**

In Cloud Shell (same terminal), run:

```bash
cd server

export DATABASE_URL="paste-your-neon-connection-string"

alembic upgrade head
```

**Expected output:**
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade -> 001_initial_schema, done
```

---

## 🌱 Step 11: Seed Sample Data (Optional)

Add sample products to your database:

```bash
# Still in server/ directory
python seed.py
```

Now your website has sample data!

---

## 📊 What Just Happened?

```
Your Local Computer
        ↓
      Cloud Shell
        ↓
   Google Cloud Build (built your images)
        ↓
Container Registry (stored images)
        ↓
    Cloud Run (running your app)
        ↓
   Your Website (live on internet!)
```

---

## ❌ If Something Goes Wrong

### Problem: Script says "Project not found"

**Fix:**
```bash
# Check project ID
gcloud config list

# If wrong, set it:
gcloud config set project YOUR_PROJECT_ID
```

### Problem: "Permission denied" errors

**Fix:**
```bash
# Re-authenticate
gcloud auth login

# Or activate Cloud Shell
# (It might ask to activate in the UI)
```

### Problem: "Neon connection failed"

**Fix:**
```bash
# Verify connection string format
# Should have: postgresql+asyncpg://
# Should have: @ep-
# Should have: .neon.tech

# Test locally (if you have psql):
psql "your-connection-string"
```

### Problem: "Build failed" error

**Check logs:**
```bash
# See what went wrong
gcloud builds log --stream

# Or list builds
gcloud builds list
```

---

## 🎯 Success Checklist

After completing all steps, you should have:

- [ ] ✅ Google Cloud project created
- [ ] ✅ Neon database created
- [ ] ✅ deploy.sh ran successfully
- [ ] ✅ Backend URL working
- [ ] ✅ Frontend URL working
- [ ] ✅ Database migrations run
- [ ] ✅ Can access API docs
- [ ] ✅ Can visit website
- [ ] ✅ Sample data seeded (optional)

**If all checked, you're done!** 🎉

---

## 📚 What To Do Next

### Option 1: Test More Features
- Add products via API
- Create accounts
- Test checkout (if implemented)
- Upload images

### Option 2: Monitor Your App
```bash
# View logs in real-time
gcloud run services logs read kalisoft-api --follow

# Check metrics
gcloud run services describe kalisoft-api
```

### Option 3: Setup Custom Domain
```bash
# Map your domain
gcloud run domain-mappings create \
  --service=kalisoft-web \
  --domain=yourdomain.com \
  --region=us-central1
```

### Option 4: Update Your App
```bash
# Make code changes locally
# Commit to GitHub
# Run deploy again:
./deploy.sh
```

---

## 💡 Key Commands for Later

```bash
# View logs
gcloud run services logs read kalisoft-api --limit=50

# List deployments
gcloud run services list

# Update environment variables
gcloud run services update kalisoft-api \
  --set-env-vars KEY=VALUE \
  --region=us-central1

# Delete service (if needed)
gcloud run services delete kalisoft-api --region=us-central1
```

---

## 🎓 You Just Learned!

✅ What Cloud Build is
✅ How to deploy to Google Cloud
✅ How to use Neon database
✅ How to run migrations
✅ How to test your app
✅ How to troubleshoot
✅ How to monitor your app

**You're officially a cloud deployment expert!** 🚀

---

## ❓ Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| Project not found | `gcloud config set project PROJECT_ID` |
| Permission denied | `gcloud auth login` |
| Build failed | `gcloud builds log --stream` |
| Can't connect to Neon | Check connection string format |
| Website shows 404 | Wait 2 minutes for deployment to complete |
| API returns 500 | `gcloud run services logs read kalisoft-api` |

---

## 🎉 Congratulations!

Your KaliSoft marketplace is now **LIVE on Google Cloud!** 

**Share your URLs:**
- Website: `https://kalisoft-web-xxxxx.run.app`
- API: `https://kalisoft-api-xxxxx.run.app`

---

## 📞 Getting Help

- **Script issues?** Check CLOUDBUILD_GUIDE.md
- **Google Cloud issues?** Check Google Cloud docs
- **Neon issues?** Check Neon documentation
- **Code issues?** Check your GitHub issues

---

**Enjoy your deployed app! 🚀**
