# 🚀 Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Prerequisites

Make sure you have:
- Docker and Docker Compose installed
- Reddit account and API credentials
- OpenAI or Anthropic API key

## Step 2: Get Reddit API Credentials

1. Visit https://www.reddit.com/prefs/apps
2. Click "Create App"
3. Select "script" type
4. Fill in name and redirect URI (http://localhost:8080)
5. Copy the Client ID and Client Secret

## Step 3: Clone and Configure

```bash
# Clone repository
cd reddit-automation

# Copy environment file
cp backend/.env.example backend/.env

# Edit .env file
nano backend/.env
```

**Minimal required configuration:**
```env
# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# Reddit API
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password

# AI API (choose one)
OPENAI_API_KEY=sk-your-key
# OR
ANTHROPIC_API_KEY=sk-ant-your-key

# JWT Secret (generate a random string)
JWT_SECRET=generate_a_random_secret_key_here
```

## Step 4: Start the Application

```bash
docker-compose up -d
```

Wait 30 seconds for services to initialize.

## Step 5: Access the Dashboard

Open http://localhost:3000

Login with:
- **Username**: admin (or what you set)
- **Password**: your_secure_password (or what you set)

## Step 6: First-Time Setup

### 1. Configure Product (Configuration page)
- Product name: "MyTool"
- Product URL: https://mytool.com
- Description: Brief description
- Context: Detailed info for AI

### 2. Add Account (Accounts page)
- Click "Add Account"
- Enter Reddit credentials
- System will verify them

### 3. Add Subreddits (Subreddits page)
- Click "Add Subreddit"
- Example: "webdev"
- Keywords: ["javascript", "react", "api"]
- Set max comments: 2-3 per day

### 4. Test in Dry Run Mode
- Go to Dashboard
- Make sure "Dry Run Mode" is ON
- Click "Start Automation"
- Check Queue page to see scanned posts
- Generate test comments

### 5. Go Live (when ready)
- Go to Configuration
- Turn OFF "Dry Run Mode"
- Set promotional ratio to 0.2-0.3
- Start automation from Dashboard

## ⚠️ Important Tips

**First Week:**
- Keep max comments at 2-3 per day
- Use high promotional ratio (more helpful, less promotional)
- Build karma with genuine helpful comments

**Monitor:**
- Check Dashboard daily for account health
- Review Comments page for removed comments
- If health drops below 70, pause and investigate

**Safety:**
- Never exceed 15 comments per day
- Use active hours (9 AM - 11 PM)
- Take 1-2 rest days per week
- Be genuinely helpful, not spammy

## 🎯 Next Steps

1. Read the full README.md for detailed documentation
2. Explore all dashboard pages
3. Monitor analytics to optimize performance
4. Gradually increase activity as account matures

## 🆘 Common Issues

**Can't connect to database:**
```bash
docker-compose restart postgres
docker-compose logs postgres
```

**Frontend won't load:**
```bash
docker-compose restart frontend
# Check if port 3000 is available
```

**Comments not generating:**
- Verify AI API key is correct
- Check Configuration page settings
- Review Logs page for errors

---

**Happy Automating! 🚀**
