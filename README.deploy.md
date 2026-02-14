# Deployment Instructions

## Railway Deployment

This application is configured for Railway deployment with the following services:
- PostgreSQL Database
- Redis
- Backend API
- Background Worker
- Frontend

### Deploy to Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Create a new project:
```bash
railway init
```

4. Add PostgreSQL:
```bash
railway add -d postgres
```

5. Add Redis:
```bash
railway add -d redis
```

6. Set environment variables:
```bash
railway variables set ADMIN_USERNAME=admin
railway variables set ADMIN_PASSWORD=your_secure_password
railway variables set JWT_SECRET=your_jwt_secret_key_here
railway variables set OPENAI_API_KEY=your_openai_key
railway variables set REDDIT_CLIENT_ID=your_reddit_client_id
railway variables set REDDIT_CLIENT_SECRET=your_reddit_client_secret
railway variables set REDDIT_USERNAME=your_reddit_username
railway variables set REDDIT_PASSWORD=your_reddit_password
railway variables set NODE_ENV=production
```

7. Deploy:
```bash
railway up
```

### Environment Variables Required

See `.env.example` files for all required environment variables.

**Critical variables:**
- `ADMIN_USERNAME` - Admin dashboard login
- `ADMIN_PASSWORD` - Admin dashboard password
- `JWT_SECRET` - Secret for JWT tokens
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - AI provider API key
- `REDDIT_CLIENT_ID` - Reddit API client ID
- `REDDIT_CLIENT_SECRET` - Reddit API secret
- `REDDIT_USERNAME` - Reddit account username
- `REDDIT_PASSWORD` - Reddit account password

### Post-Deployment

1. Access the frontend URL provided by Railway
2. Login with your admin credentials
3. Configure your product settings
4. Add Reddit accounts and subreddits
5. Start automation in dry-run mode first
