# Reddit Marketing Automation Dashboard

A full-stack web application that automates Reddit marketing by browsing subreddits, finding relevant posts, and leaving natural, value-driven comments using AI.

## 🚀 Features

### Core Functionality
- **🤖 AI-Powered Comment Generation** - Uses OpenAI GPT or Anthropic Claude to generate human-like, contextual comments
- **🔍 Intelligent Post Scanner** - Automatically scans target subreddits for relevant posts
- **⚡ Smart Anti-Ban System** - Implements human-like behavior patterns to avoid detection
- **📊 Real-Time Dashboard** - Monitor all activity, stats, and account health
- **✅ Manual Approval Mode** - Review and approve comments before posting
- **📈 Analytics & Insights** - Track performance, karma, and engagement over time
- **👥 Multi-Account Support** - Manage and rotate between multiple Reddit accounts

### Anti-Ban Features ⚠️
- Random delays with jitter between actions
- Configurable rate limits (per hour and per day)
- Active hours scheduling (mimic human activity patterns)
- Rest days (randomly skip days)
- Promotional/helpful comment ratio control
- Similarity detection to avoid duplicate comments
- Subreddit-specific cooldowns
- Slow ramp-up for new accounts
- Account health monitoring

## 📋 Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 15+
- **Redis** 7+
- **Reddit API** credentials ([Get them here](https://www.reddit.com/prefs/apps))
- **AI API Key** (OpenAI or Anthropic)

## 🛠️ Installation

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd reddit-automation

# Copy environment files
cp backend/.env.example backend/.env

# Edit backend/.env with your credentials
nano backend/.env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
nano .env

# Start PostgreSQL and Redis (if not using Docker)
# Make sure they're running on default ports

# Run database migrations
npm run dev

# Start the server
npm start

# In a separate terminal, start the worker
npm run worker
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# Or build for production
npm run build
```

## ⚙️ Configuration

### Backend Environment Variables

Edit `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reddit_automation
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secret (change this!)
JWT_SECRET=your_super_secret_jwt_key_here

# Admin Login (change these!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123

# AI API Keys (add at least one)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
AI_PROVIDER=openai

# Reddit API Credentials
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USERNAME=your_username
REDDIT_PASSWORD=your_password
REDDIT_USER_AGENT=RedditAutomation/1.0.0

# Automation Settings
DRY_RUN_MODE=true
MAX_COMMENTS_PER_DAY=15
MAX_COMMENTS_PER_HOUR=3
MIN_DELAY_MINUTES=3
MAX_DELAY_MINUTES=15
ACTIVE_HOURS_START=9
ACTIVE_HOURS_END=23
PROMOTIONAL_RATIO=0.3
```

### Getting Reddit API Credentials

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Select "script" as the app type
4. Fill in the form:
   - **name**: Your app name
   - **redirect uri**: http://localhost:8080 (required but not used)
5. Click "Create app"
6. Copy the **Client ID** (under the app name) and **Client Secret**

## 📖 Usage Guide

### 1. Login

Default credentials:
- **Username**: admin
- **Password**: changeme123

⚠️ **Change these immediately in production!**

### 2. Configure AI and Product

Go to **Configuration** page:
- Add your AI API key (OpenAI or Anthropic)
- Enter your product name, URL, and description
- Write detailed product context for the AI
- Configure automation settings

### 3. Add Reddit Account

Go to **Accounts** page:
- Click "Add Account"
- Enter Reddit username and API credentials
- The system will test the credentials

### 4. Add Target Subreddits

Go to **Subreddits** page:
- Click "Add Subreddit"
- Enter subreddit name (without r/)
- Add relevant keywords
- Set priority and tone notes
- Configure max comments per day

### 5. Start Automation

On the **Dashboard**:
- Make sure **Dry Run Mode** is OFF (in Configuration)
- Click "Start Automation"
- The system will begin scanning and generating comments

### 6. Review Queue

Go to **Queue** page:
- See all queued posts
- Click a post to generate a comment
- Review and edit the AI-generated comment
- Approve or skip

### 7. Monitor Performance

- **Dashboard**: Real-time stats and account health
- **Comments**: View all comments and their status
- **Analytics**: Charts showing activity and karma over time
- **Logs**: Detailed activity logs

## 🎯 Best Practices

### Avoiding Bans

1. **Start Slow**: Begin with 2-3 comments per day for the first week
2. **Build Karma First**: Set promotional ratio to 0.2 (80% helpful, 20% promotional)
3. **Use Active Hours**: Only operate during realistic hours (9 AM - 11 PM)
4. **Add Rest Days**: Skip 1-2 days per week
5. **Monitor Health**: Pause if health score drops below 50
6. **Rotate Accounts**: Don't use the same account for everything
7. **Vary Comments**: The AI generates unique comments, but check similarity warnings

### Subreddit Selection

- Start with 3-5 subreddits
- Choose subreddits where your product genuinely helps
- Read and respect subreddit rules
- Avoid heavily moderated subs initially
- Test manually before automating

### Comment Quality

- Use detailed product context for better AI responses
- Add tone notes for each subreddit
- Review and edit AI-generated comments
- Never force product mentions - be genuinely helpful
- Build a reputation before promoting

## 🏗️ Architecture

```
reddit-automation/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database & Redis config
│   ├── models/             # Sequelize models
│   ├── services/           # Reddit & AI services
│   ├── utils/              # Anti-ban system & helpers
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   └── jobs/           # Background worker
│   └── server.js           # Main server
├── frontend/               # React/Vite UI
│   ├── src/
│   │   ├── pages/          # Dashboard pages
│   │   ├── components/     # Reusable components
│   │   └── services/       # API client
│   └── ...
└── docker-compose.yml      # Docker setup
```

## 📊 Database Schema

- **accounts**: Reddit account credentials and stats
- **subreddits**: Target subreddit configuration
- **scanned_posts**: Posts found during scanning
- **comments**: Generated and posted comments
- **action_logs**: Activity logs for monitoring
- **config**: Global configuration

## 🔒 Security Notes

- All Reddit credentials are encrypted at rest
- JWT tokens for admin authentication
- Environment variables for sensitive data
- Never commit `.env` files
- Change default admin password immediately
- Use HTTPS in production

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs postgres
```

### Redis Connection Error
```bash
# Restart Redis
docker-compose restart redis
```

### Comments Not Posting
- Check Dry Run Mode is OFF
- Verify Reddit credentials
- Check account status (not paused or banned)
- Review rate limits

### AI Generation Failing
- Verify API key is correct
- Check API provider setting matches your key
- Review logs for error messages

## 📝 API Documentation

### Authentication
```
POST /api/auth/login
Body: { username, password }
Returns: { token, user }
```

### Key Endpoints
- `GET /api/config` - Get configuration
- `GET /api/accounts` - List accounts
- `GET /api/subreddits` - List subreddits
- `GET /api/queue` - Get queued posts
- `POST /api/queue/:postId/generate` - Generate comment
- `GET /api/analytics/dashboard` - Dashboard stats

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a Pull Request

## ⚠️ Disclaimer

This tool is for educational purposes. Use responsibly and in accordance with Reddit's Terms of Service and API rules. The authors are not responsible for any bans or violations resulting from misuse.

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs (`docker-compose logs`)
3. Open an issue on GitHub

---

**Built with ❤️ for ethical Reddit marketing**
