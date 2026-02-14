# 🚀 Deployment Instructions

## Railway Free Plan Limit Reached

Your Railway account has reached the free plan resource limit. Here are your options:

### Option 1: Upgrade Railway Plan (Recommended for Production)

1. Go to https://railway.app/account/billing
2. Upgrade to the Hobby plan ($5/month)
3. Then deploy using the instructions below

### Option 2: Deploy to Alternative Platforms

#### A. Render.com (Free Tier Available)
1. Go to https://render.com
2. Create a new account
3. Create services for:
   - PostgreSQL database (free)
   - Redis (free)
   - Backend API (web service)
   - Worker (background worker)
   - Frontend (static site)

#### B. Railway Manual Deploy (After Upgrade)

1. **Push code to GitHub**:
```bash
# Create GitHub repo at https://github.com/new
# Name it: reddit-automation-dashboard

cd reddit-automation
git remote add origin https://github.com/YOUR_USERNAME/reddit-automation-dashboard.git
git branch -M main
git push -u origin main
```

2. **Deploy on Railway**:
   - Go to https://railway.app/new
   - Click "Deploy from GitHub repo"
   - Select your `reddit-automation-dashboard` repository
   
3. **Add PostgreSQL Database**:
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   
4. **Add Redis**:
   - Click "+ New"
   - Select "Database" → "Redis"
   
5. **Configure Backend Service**:
   - Service will auto-detect from repo
   - Set **Root Directory**: `backend`
   - Add these **Environment Variables**:
     ```
     NODE_ENV=production
     PORT=5001
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     REDIS_URL=${{Redis.REDIS_URL}}
     ADMIN_USERNAME=admin
     ADMIN_PASSWORD=YourSecurePassword123!
     JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
     FRONTEND_URL=${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
     ```

6. **Configure Worker Service**:
   - Click "+ New"
   - Select same GitHub repo
   - Set **Root Directory**: `backend`
   - Set **Start Command**: `npm run worker`
   - Add same environment variables as Backend

7. **Configure Frontend Service**:
   - Click "+ New"
   - Select same GitHub repo
   - Set **Root Directory**: `frontend`
   - Add environment variable:
     ```
     VITE_API_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api
     ```

8. **Deploy**:
   - Railway will automatically build and deploy
   - Wait for all services to be healthy
   - Get your frontend URL from Railway dashboard

## 🎯 Post-Deployment Setup

Once deployed, access your dashboard:

1. **Open Frontend URL** (from Railway dashboard)
2. **Login** with:
   - Username: `admin`
   - Password: (whatever you set as ADMIN_PASSWORD)

3. **Configure in Dashboard** (no .env files needed!):
   - Go to **Configuration** page
   - Select **Google Gemini** as AI Provider
   - Enter your **Gemini API Key** (get from https://aistudio.google.com/app/apikey)
   - Set your **Product Information**
   - Configure automation settings

4. **Add Reddit Account**:
   - Go to **Accounts** page
   - Get Reddit API credentials from https://www.reddit.com/prefs/apps
   - Add your Reddit account

5. **Add Subreddits**:
   - Go to **Subreddits** page
   - Add subreddits to monitor with keywords

6. **Test**:
   - Keep **Dry Run Mode ON** initially
   - Start automation from Dashboard
   - Review generated comments in Queue page
   - Once satisfied, turn off Dry Run Mode

## 📝 Important Notes

### API Keys to Prepare

✅ **Required**:
- **Gemini API Key**: Free from https://aistudio.google.com/app/apikey
- **Reddit API Credentials**:
  - Client ID
  - Client Secret
  - Username
  - Password
  - Get from: https://www.reddit.com/prefs/apps

⚠️ **All API keys are entered in the dashboard UI** - no need to set them as environment variables!

### Security Tips

- Use a **strong admin password**
- Generate a **random JWT secret** (32+ characters)
- Never share your API keys
- Start with **Dry Run Mode** enabled
- Keep **max comments per day low** initially (2-3)

### Cost Estimates

**Railway Hobby Plan**: $5/month
- Includes PostgreSQL, Redis, and services
- $5 free credits monthly
- Pay for additional usage

**API Costs**:
- **Gemini API**: Very generous free tier (60 requests/minute)
- **Reddit API**: Free

## 🆘 Need Help?

If you encounter issues:
1. Check Railway logs for errors
2. Verify all environment variables are set
3. Ensure databases are connected
4. Review the README.md for troubleshooting

## Alternative: Local Development

To run locally with Docker:
```bash
cd reddit-automation
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials
docker-compose up -d
```

Access at: http://localhost:3000
