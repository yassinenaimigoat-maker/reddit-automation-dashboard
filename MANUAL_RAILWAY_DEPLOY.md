# Manual Railway Deployment Guide

Since CLI login isn't available, follow these steps to deploy manually:

## Step 1: Push to GitHub

```bash
# Create repo at: https://github.com/new
# Name: reddit-automation-dashboard

cd /root/reddit-automation
git remote add origin https://github.com/YOUR_USERNAME/reddit-automation-dashboard.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy on Railway Dashboard

1. Go to: https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Authorize GitHub and select: `reddit-automation-dashboard`

## Step 3: Add Databases

Click "+ New" twice to add:
- PostgreSQL
- Redis

## Step 4: Create Backend Service

- Railway auto-detects the repo
- Click the service → Settings
- **Root Directory**: `backend`
- **Start Command**: `npm start`

Add environment variables:
```
NODE_ENV=production
PORT=5001
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeThisPassword123!
JWT_SECRET=your-random-32-character-secret-key-here
```

## Step 5: Create Worker Service

- Click "+ New" → GitHub repo (same repo)
- **Root Directory**: `backend`
- **Start Command**: `npm run worker`
- Use same environment variables as Backend

## Step 6: Create Frontend Service

- Click "+ New" → GitHub repo (same repo)
- **Root Directory**: `frontend`
- Add environment variable:
```
VITE_API_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api
```

## Step 7: Deploy!

Railway will automatically build and deploy all services.

## Step 8: Access Dashboard

1. Get frontend URL from Railway dashboard
2. Login with admin credentials
3. Configure Gemini API key in dashboard UI

Done! 🎉
