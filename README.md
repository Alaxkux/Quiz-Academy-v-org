# 🎓 Quiz Academy v4

A full-stack interactive learning platform with AI-generated questions, gamification, real-time leaderboard, and web push notifications.

---

## ✨ Features

| Feature | Status |
|---------|--------|
| Email + Password Auth | ✅ |
| Google OAuth (One Tap) | ✅ |
| Password Reset via Email | ✅ |
| AI Question Generation (Gemini) | ✅ |
| 20-Level XP System | ✅ |
| Smart Average Score | ✅ |
| Quiz Config Page (CBT / Live mode) | ✅ |
| Quiz Exit Guard (tab lock) | ✅ |
| Results Share Card (PNG) | ✅ |
| Web Push Streak Reminders | ✅ |
| Real Leaderboard (MongoDB) | ✅ |
| Course Builder | ✅ |
| Brainstorming Mode | ✅ |
| Paginated History | ✅ |
| 8 Themes (dark + light) | ✅ |
| Helmet Security Headers | ✅ |
| Rate Limiting (auth + AI) | ✅ |
| Input Sanitization | ✅ |

---

## 🗂 Project Structure

```
quiz-academy/
├── client/                   # Frontend (served as static files)
│   ├── index.html
│   ├── sw.js                 # Service worker for push notifications
│   ├── css/
│   │   ├── themes.css        # 8 colour themes
│   │   ├── base.css          # Reset, keyframes, utilities
│   │   ├── layout.css        # Shell, sidebar, topbar
│   │   ├── components.css    # All reusable UI components
│   │   ├── pages.css         # Quiz, results, review, AI page
│   │   ├── features.css      # Course builder, brainstorm, levels
│   │   ├── mobile.css        # All responsive overrides
│   │   └── course-builder.css
│   └── js/
│       ├── api.js            # Fetch wrapper + all API objects
│       ├── app.js            # App init, splash, theme
│       ├── auth.js           # Login, signup, Google OAuth, reset
│       ├── data.js           # QUIZ_DATA, LEVELS (x20), ACHIEVEMENTS
│       ├── gamification.js   # XP, level up, streaks, achievements
│       ├── quiz.js           # Quiz engine, config page, exit guard
│       ├── share.js          # Canvas score card generator
│       ├── push.js           # Web push subscription management
│       ├── ui.js             # All page renders, navigation, history
│       ├── ai.js             # AI questions page (Gemini)
│       ├── brainstorm.js     # Flashcard study mode
│       ├── timer-settings.js # Per-question time limit settings
│       └── course-builder.js # Course create/edit/import/export
│
├── server/
│   ├── index.js              # Express app, cron job, static serve
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js    # JWT + session auth middleware
│   ├── models/User.js        # Mongoose user schema
│   ├── routes/
│   │   ├── auth.js           # Auth + Google OAuth + password reset
│   │   ├── ai.js             # Gemini AI question generation
│   │   ├── push.js           # Web push subscribe/send
│   │   └── history.js        # Paginated quiz history API
│   └── utils/
│       └── scoring.js        # Smart average score calculation
│
├── .env.example              # Copy to .env and fill in values
├── render.yaml               # One-click Render deployment
├── package.json
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Clone and install

```bash
git clone https://github.com/yourusername/quiz-academy.git
cd quiz-academy
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the values (see the section below for each one).

### 3. Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in each value:

### Required

| Variable | How to get it |
|----------|---------------|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Create cluster → Connect → Node.js connection string |
| `JWT_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `SESSION_SECRET` | Same as above — generate a different one |

### AI (Free)

| Variable | How to get it |
|----------|---------------|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) — completely free, 1500 requests/day |

### Email (Password Reset)

| Variable | How to get it |
|----------|---------------|
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Gmail App Password: [myaccount.google.com](https://myaccount.google.com) → Security → 2-Step Verification → App passwords |

> ⚠️ Use an **App Password**, not your real Gmail password.

### Google OAuth (Optional)

| Variable | How to get it |
|----------|---------------|
| `GOOGLE_CLIENT_ID` | [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client ID → Web application |

Add `http://localhost:3000` to **Authorized JavaScript origins**. For production, add your live URL too.

### Web Push / Streak Reminders (Optional)

```bash
# Generate VAPID keys (run once, save the output)
npx web-push generate-vapid-keys
```

| Variable | Value |
|----------|-------|
| `VAPID_PUBLIC_KEY` | From the command above |
| `VAPID_PRIVATE_KEY` | From the command above |

### CORS

| Variable | Value |
|----------|-------|
| `CLIENT_URL` | `http://localhost:3000` for dev, your live URL for production |

---

## 🌐 Deploying to Render (Free)

Render is the recommended host — it supports persistent Node.js servers, unlike Vercel which is serverless-only.

### Step 1 — Push to GitHub

Make sure `.env` is in `.gitignore` (it already is). Push your code:

```bash
git add .
git commit -m "Quiz Academy v4"
git push origin main
```

### Step 2 — Create a Render Web Service

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` and fills in settings:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Environment:** Node

### Step 3 — Set Environment Variables

In Render dashboard → your service → **Environment**:

Add every variable from your `.env` file. Critical ones:

```
NODE_ENV          = production
MONGODB_URI       = your_atlas_uri
JWT_SECRET        = your_secret
SESSION_SECRET    = your_secret
GEMINI_API_KEY    = your_key
CLIENT_URL        = https://your-app.onrender.com
```

For Google OAuth, also add your production URL to the Authorized JavaScript origins in Google Cloud Console.

### Step 4 — Deploy

Click **Deploy**. Render will build and deploy automatically. Every future `git push` to main auto-deploys.

### Step 5 — Keep it awake (free tier)

Render's free tier sleeps after 15 minutes of inactivity. To keep it awake:

- Use [UptimeRobot](https://uptimerobot.com) (free) — ping `https://your-app.onrender.com/api/auth/config` every 14 minutes
- Or upgrade to Render's $7/month plan for always-on

### MongoDB Atlas — Whitelist Render's IP

For the free tier, whitelist `0.0.0.0/0` in MongoDB Atlas → **Network Access** so Render can connect regardless of which IP it assigns.

---

## 🔒 MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. **Database Access** → Add Database User → username + password
4. **Network Access** → Add IP Address → `0.0.0.0/0` (allow from anywhere)
5. **Clusters** → Connect → Connect your application → Copy the connection string
6. Replace `<password>` in the string with your database user password
7. Paste into `MONGODB_URI` in your `.env`

---

## 🧪 Testing Push Notifications

Once VAPID keys are set and the server is running:

1. Open the app → Settings → Enable Streak Reminders → Allow in browser
2. Test the push immediately (dev only):

```bash
curl -X POST http://localhost:3000/api/push/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Get your JWT token from `localStorage.getItem('qa_token')` in browser DevTools.

---

## 🎨 Adding Custom Courses

Three ways to add quiz content:

**1. Edit `client/js/data.js` directly** — add a new entry to `QUIZ_DATA` following the existing format.

**2. Use the in-app Course Builder** — Sidebar → Course Builder → New Course. No code required.

**3. Import a JSON file** — Course Builder → Import JSON. Download the template first to see the format.

---

## 📱 PWA / Mobile

The app is PWA-ready. On mobile:
- Open in Safari/Chrome → Share → Add to Home Screen
- Receives push notifications when added to home screen
- Works offline for cached pages

---

## 🛡️ Security Features

- **Helmet.js** — HTTP security headers
- **Rate limiting** — 20 auth requests per 15 min, 10 AI requests per min
- **Input sanitization** — all user text fields sanitized server-side
- **JWT + session dual auth** — tokens rotate, sessions expire
- **HTTPS only cookies** in production
- **Google OAuth token verification** — ID tokens verified server-side with `google-auth-library`
- **VAPID authentication** — push subscriptions cryptographically verified

---

## 📊 Score & XP System

**Smart Average Score** — uses exponential moving average (α=0.25). Recent quizzes count more. You can always recover to 100% with good performance.

**XP Calculation:**
- Below 30% → 0 XP (no reward for guessing)
- 30–59% → base XP only (8–12 XP per correct answer depending on difficulty)
- 60–74% → base + 10% bonus
- 75–89% → base + 25% bonus
- 90–99% → base + 50% bonus
- 100% → base + 80% bonus (big reward for perfection)
- Daily challenge → +50 XP bonus

**20 Levels:**
Newcomer → Curious → Eager → Apprentice → Student → Thinker → Scholar → Analyst → Strategist → Expert → Specialist → Adept → Virtuoso → Authority → Mastermind → Prodigy → Luminary → Sage → Oracle → Transcendent

---

## 📝 License

MIT — free to use and modify.

---

Built with ❤️ using Node.js, Express, MongoDB, and vanilla JS.
# Quiz-Academy-v-org
