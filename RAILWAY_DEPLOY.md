# 🚂 One-Click Railway Deployment

## 🚀 Deploy Now!

Click the button below to deploy your Reddit Automation Dashboard to Railway:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/reddit-automation?referralCode=bonus)

**Alternative Deploy Link:**
https://railway.app/new/template?template=https://github.com/yassinenaimigoat-maker/reddit-automation-dashboard

---

## 📋 Deployment Steps:

### Step 1: Click Deploy Button
Click the deploy button above. You'll be redirected to Railway.

### Step 2: Configure Environment Variables

Railway will ask you to set these variables:

**Required:**
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecurePassword123!
JWT_SECRET=your-random-32-character-secret-key-here
```

**Optional (can configure in dashboard later):**
```
NODE_ENV=production
```

### Step 3: Deploy!

Railway will automatically:
- ✅ Create PostgreSQL database
- ✅ Create Redis database  
- ✅ Deploy Backend API
- ✅ Deploy Worker service
- ✅ Deploy Frontend

### Step 4: Access Your Dashboard

1. Wait for deployment to complete (2-3 minutes)
2. Get your frontend URL from Railway dashboard
3. Login with your admin credentials
4. Configure API keys in the dashboard UI:
   - Gemini API Key
   - Reddit API credentials
   - Product information

---

## 🔧 Manual Railway Deployment (If Button Doesn't Work)

If the one-click deploy doesn't work, follow these steps:

### 1. Create New Project on Railway

Go to: https://railway.app/new

### 2. Deploy from GitHub

- Click "Deploy from GitHub repo"
- Select: `yassinenaimigoat-maker/reddit-automation-dashboard`

### 3. Add Databases

Click "+ New" for each:
- **PostgreSQL**
- **Redis**

### 4. Configure Backend Service

The service should auto-detect. Configure it:
- **Root Directory**: `backend`
- **Start Command**: `npm start`

Add environment variables:
```bash
NODE_ENV=production
PORT=5001
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeThisPassword123!
JWT_SECRET=generate-random-secret-32-chars-minimum
```

### 5. Add Worker Service

- Click "+ New" → Same GitHub repo
- **Root Directory**: `backend`
- **Start Command**: `npm run worker`
- Copy same environment variables from Backend

### 6. Add Frontend Service

- Click "+ New" → Same GitHub repo
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Start Command**: `npx serve -s dist -l $PORT`

Add environment variable:
```bash
VITE_API_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api
```

### 7. Deploy & Access

- Wait for all services to deploy
- Access frontend URL
- Login and configure API keys

---

## 🔑 Post-Deployment: Get Your API Keys

### Google Gemini API (FREE!)
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Enter in Configuration page of your dashboard

### Reddit API
1. Go to: https://www.reddit.com/prefs/apps
2. Click "Create App"
3. Type: "script"
4. Redirect URI: `http://localhost:8080`
5. Copy Client ID and Secret
6. Add in Accounts page of your dashboard

---

## 📊 What Gets Deployed

- **Backend API**: Express.js server on port 5001
- **Worker**: Background job processor
- **Frontend**: React dashboard
- **PostgreSQL**: Database for storing configs, accounts, comments
- **Redis**: Queue management and caching

---

## 💰 Railway Pricing

- **Hobby Plan**: $5/month
- Includes all services and databases
- $5 free credits monthly

---

## 🆘 Troubleshooting

**Deployment fails?**
- Check Railway logs for errors
- Verify environment variables are set
- Ensure databases are running

**Can't login?**
- Verify ADMIN_USERNAME and ADMIN_PASSWORD are set
- Check frontend can reach backend API

**Need help?**
- Check the logs in Railway dashboard
- Review README.md for detailed docs

---

## ✅ Success Checklist

After deployment:
- [ ] All services show "Active" in Railway
- [ ] Frontend URL accessible
- [ ] Can login with admin credentials
- [ ] Configuration page loads
- [ ] Added Gemini API key
- [ ] Added Reddit credentials
- [ ] Set product information
- [ ] Tested in dry-run mode

🎉 **You're ready to automate Reddit marketing!**
