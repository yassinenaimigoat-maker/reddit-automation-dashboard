# Railway Deployment Guide

## Quick Deploy to Railway

### Option 1: Deploy from GitHub (Recommended)

1. **Push code to GitHub first** (see GITHUB_SETUP.md)

2. **Go to Railway**: https://railway.app

3. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `reddit-automation-dashboard` repository
   
4. **Add PostgreSQL Database**:
   - Click "+ New"
   - Select "Database"
   - Choose "PostgreSQL"
   
5. **Add Redis**:
   - Click "+ New"
   - Select "Database"
   - Choose "Redis"

6. **Configure Backend Service**:
   - Railway will detect the Dockerfile
   - Set Root Directory: `backend`
   - Add Environment Variables (see below)

7. **Configure Worker Service**:
   - Click "+ New"
   - Select "GitHub repo" (same repo)
   - Set Root Directory: `backend`
   - Set Start Command: `npm run worker`
   - Use same environment variables as backend

8. **Configure Frontend Service**:
   - Click "+ New"
   - Select "GitHub repo" (same repo)
   - Set Root Directory: `frontend`
   - Railway will detect Dockerfile

### Environment Variables (Backend & Worker)

Add these in Railway dashboard under service → Variables:

**Required:**
```
NODE_ENV=production
PORT=5001

# Database (automatically set by Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (automatically set by Railway Redis)
REDIS_URL=${{Redis.REDIS_URL}}

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here

# JWT
JWT_SECRET=generate_a_random_secret_key_minimum_32_characters

# AI Provider (choose one)
OPENAI_API_KEY=sk-your-openai-key
# OR
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
AI_PROVIDER=openai

# Reddit API
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
REDDIT_USER_AGENT=RedditAutomation/1.0.0

# Product Info
PRODUCT_NAME=YourProductName
PRODUCT_URL=https://yourproduct.com
PRODUCT_DESCRIPTION=Brief description of your product

# Automation Settings
DRY_RUN_MODE=true
MAX_COMMENTS_PER_DAY=15
PROMOTIONAL_RATIO=0.3
```

### Environment Variables (Frontend)

```
VITE_API_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api
```

### Option 2: Deploy with Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd reddit-automation
railway init

# Add services
railway add -d postgres
railway add -d redis

# Set variables (see above list)
railway variables set ADMIN_USERNAME=admin
railway variables set ADMIN_PASSWORD=your_password
# ... set all other variables

# Deploy
railway up
```

## Post-Deployment Steps

1. **Get your frontend URL** from Railway dashboard
2. **Access the dashboard** at your frontend URL
3. **Login** with ADMIN_USERNAME and ADMIN_PASSWORD
4. **Configure settings**:
   - Go to Configuration page
   - Set product details
   - Configure automation limits
5. **Add Reddit account** in Accounts page
6. **Add subreddits** to monitor
7. **Test in dry-run mode** first!

## Important Notes

⚠️ **Security:**
- Change ADMIN_PASSWORD to a strong password
- Generate a secure JWT_SECRET (32+ characters)
- Never commit .env files to GitHub

⚠️ **Reddit API:**
- Get credentials from https://www.reddit.com/prefs/apps
- Start with low comment limits (2-3 per day)
- Keep DRY_RUN_MODE=true for testing

⚠️ **Monitoring:**
- Check Railway logs regularly
- Monitor account health scores
- Review posted comments

## Troubleshooting

**Database connection errors:**
- Ensure DATABASE_URL is set correctly
- Check PostgreSQL service is running

**Worker not running:**
- Verify worker service has correct start command
- Check Redis connection

**Frontend can't reach backend:**
- Ensure VITE_API_URL points to backend public domain
- Check CORS settings in backend

## Cost Estimate

Railway Free Tier includes:
- $5 free credits per month
- Enough for development/testing
- May need paid plan for production use

## Support

For issues:
1. Check Railway logs
2. Review backend/logs directory
3. Check README.md for common issues
