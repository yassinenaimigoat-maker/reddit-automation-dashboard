# 🚂 Reddit Automation Dashboard - Railway Deployment Status

## ✅ Completed Steps

### 1. Railway Project Created ✅
- **Project Name:** gentle-contentment
- **Project ID:** b9711bb5-5e26-4f4e-925a-0c252fb26b33
- **Dashboard URL:** https://railway.com/project/b9711bb5-5e26-4f4e-925a-0c252fb26b33

### 2. Databases Deployed ✅
- ✅ **PostgreSQL** - Running successfully
  - Internal URL: `postgresql://postgres:OYmCnwrrnYumVVUXQIlAnrHBGjyfsePi@postgres.railway.internal:5432/railway`
  - Public URL: `postgresql://postgres:OYmCnwrrnYumVVUXQIlAnrHBGjyfsePi@shortline.proxy.rlwy.net:43829/railway`
  
- ✅ **Redis** - Running successfully
  - Internal URL: `redis://default:qGiEkLzVllnxWlEkrPmJuSNlDkFhFkfw@redis.railway.internal:6379`
  - Public URL: `redis://default:qGiEkLzVllnxWlEkrPmJuSNlDkFhFkfw@shuttle.proxy.rlwy.net:25264`

### 3. GitHub Repository ✅
- **Repo:** https://github.com/yassinenaimigoat-maker/reddit-automation-dashboard
- **Status:** Connected and ready

---

## 🔧 Next Steps (5 minutes via Dashboard)

### Step 1: Add Backend Service (2 minutes)

1. **Open Railway Dashboard:**
   ```
   https://railway.com/project/b9711bb5-5e26-4f4e-925a-0c252fb26b33
   ```

2. **Click "+ New Service"**

3. **Select "GitHub Repo"**

4. **Choose:** `yassinenaimigoat-maker/reddit-automation-dashboard`

5. **Configure Backend Service:**
   - **Service Name:** `backend`
   - **Root Directory:** `backend`
   - **Start Command:** `npm start`

6. **Add Environment Variables** (click "Variables" tab):
   ```bash
   NODE_ENV=production
   PORT=5001
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=ChangeThisSecurePassword123!
   JWT_SECRET=your-random-32-character-secret-key-here-change-this
   ```

7. **Deploy** - Railway will automatically build and deploy

---

### Step 2: Add Worker Service (1 minute)

1. **Click "+ New Service"** again

2. **Select "GitHub Repo"**

3. **Choose:** `yassinenaimigoat-maker/reddit-automation-dashboard`

4. **Configure Worker Service:**
   - **Service Name:** `worker`
   - **Root Directory:** `backend`
   - **Start Command:** `npm run worker`

5. **Add Same Environment Variables** as Backend:
   ```bash
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=ChangeThisSecurePassword123!
   JWT_SECRET=your-random-32-character-secret-key-here-change-this
   ```

6. **Deploy**

---

### Step 3: Add Frontend Service (2 minutes)

1. **Click "+ New Service"** again

2. **Select "GitHub Repo"**

3. **Choose:** `yassinenaimigoat-maker/reddit-automation-dashboard`

4. **Configure Frontend Service:**
   - **Service Name:** `frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npx serve -s dist -l $PORT`

5. **Add Environment Variable:**
   ```bash
   VITE_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}/api
   ```
   
   **OR** after backend deploys, get its public URL and use:
   ```bash
   VITE_API_URL=https://backend-production-xyz.up.railway.app/api
   ```

6. **Generate Public Domain** (in Settings → Networking)

7. **Deploy**

---

## 🎯 Final Configuration (After Deployment)

### Step 4: Get API Keys

1. **Google Gemini API (FREE!):**
   - Go to: https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key

2. **Reddit API:**
   - Go to: https://www.reddit.com/prefs/apps
   - Click "Create App"
   - Type: "script"
   - Redirect URI: `http://localhost:8080`
   - Copy Client ID and Secret

### Step 5: Access Your Dashboard

1. **Get Frontend URL** from Railway dashboard (frontend service)
   - Example: `https://frontend-production-xyz.up.railway.app`

2. **Login:**
   - Username: `admin`
   - Password: `ChangeThisSecurePassword123!` (or whatever you set)

3. **Configure in Dashboard UI:**
   - Go to "Configuration" page
   - Add Gemini API Key
   - Add Product Information
   - Go to "Accounts" page
   - Add Reddit credentials

4. **Test in Dry-Run Mode:**
   - Enable dry-run mode
   - Monitor for errors
   - Review generated comments

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│           Railway Project                       │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Frontend │  │ Backend  │  │  Worker  │      │
│  │  (React) │◄─┤   API    │◄─┤  Jobs    │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│       │              │              │           │
│       │         ┌────┴────┐    ┌───┴────┐      │
│       │         │         │    │        │       │
│       │    ┌────▼────┐ ┌──▼────▼───┐           │
│       │    │PostgreSQL│ │   Redis   │           │
│       │    └──────────┘ └───────────┘           │
│       │                                          │
│  Public URL                                      │
│  (Your Dashboard)                                │
└─────────────────────────────────────────────────┘
```

---

## ✅ Success Checklist

After deployment, verify:
- [ ] All 5 services show "Active" in Railway
- [ ] Backend has public domain generated
- [ ] Frontend has public domain generated
- [ ] Can access frontend URL
- [ ] Can login with admin credentials
- [ ] Configuration page loads
- [ ] Can add Gemini API key
- [ ] Can add Reddit credentials
- [ ] Can add product information
- [ ] Subreddits page loads
- [ ] Accounts page loads

---

## 🆘 Troubleshooting

### Backend Won't Start
**Check logs for:**
- Database connection errors → Verify `DATABASE_URL` is set to `${{Postgres.DATABASE_URL}}`
- Redis connection errors → Verify `REDIS_URL` is set to `${{Redis.REDIS_URL}}`
- Missing env vars → Double-check all variables are set

### Frontend Can't Connect to Backend
**Fix:**
- Make sure `VITE_API_URL` points to backend's public domain
- Format: `https://backend-domain.up.railway.app/api` (note the `/api` at the end)
- Redeploy frontend after fixing

### Worker Not Processing Jobs
**Check:**
- Worker service is running (green status)
- Same environment variables as backend
- Redis connection is working
- Check worker logs for errors

---

## 💰 Cost Estimate

**Railway Hobby Plan:** $5/month
- Includes 5 services (Frontend, Backend, Worker, PostgreSQL, Redis)
- $5 free credits monthly (covers small usage)
- Pay only for what you use beyond free tier

---

## 🎉 What You'll Get

Once deployed, you'll have a full-featured Reddit automation dashboard:

✨ **Features:**
- AI-powered comment generation (Google Gemini)
- Multi-account Reddit management
- Subreddit monitoring and targeting
- Smart anti-ban protection
- Comment scheduling and queuing
- Dry-run testing mode
- Real-time activity logs
- Product-aware marketing
- Secure authentication

🛡️ **Security:**
- JWT-based authentication
- Encrypted Reddit credentials
- Secure API key storage
- Environment-based configuration

---

## 📞 Need Help?

If you encounter any issues:
1. Check Railway service logs (click on service → Deployments → View Logs)
2. Verify environment variables are set correctly
3. Ensure databases are running (green status)
4. Check that all services are using the same environment

---

**Deployment Ready!** 🚀

Just follow the steps above in the Railway dashboard and you'll be live in 5 minutes!
