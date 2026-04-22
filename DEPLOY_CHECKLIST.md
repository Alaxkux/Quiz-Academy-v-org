# 🚀 Quiz Academy — Deployment Checklist

Run through this before going live.

---

## ✅ Before You Push to GitHub

- [ ] `.env` is in `.gitignore` and NOT committed
- [ ] No hardcoded secrets, API keys, or passwords in any source file
- [ ] `NODE_ENV` will be set to `production` on the server
- [ ] `npm install` runs cleanly with no errors locally
- [ ] `npm start` boots the server without crashing
- [ ] All 4 routes respond correctly:
  - `GET /api/auth/config` → `{ googleClientId: "..." }`
  - `GET /api/push/vapid-public-key` → `{ publicKey: "..." }`
  - `POST /api/auth/login` → works
  - `POST /api/ai/generate` → returns questions

---

## ✅ MongoDB Atlas

- [ ] Cluster created (free M0 tier is fine)
- [ ] Database user created with read/write access
- [ ] IP whitelist set to `0.0.0.0/0` (allow from anywhere)
- [ ] Connection string tested locally — server logs `✅ MongoDB connected`

---

## ✅ Environment Variables on Render

Set all of these in Render dashboard → Environment:

| Variable | Required | Notes |
|----------|----------|-------|
| `NODE_ENV` | ✅ | Set to `production` |
| `MONGODB_URI` | ✅ | Atlas connection string |
| `JWT_SECRET` | ✅ | 64+ char random string |
| `SESSION_SECRET` | ✅ | Different 64+ char random string |
| `GEMINI_API_KEY` | ✅ | From aistudio.google.com |
| `CLIENT_URL` | ✅ | `https://your-app.onrender.com` |
| `EMAIL_USER` | Optional | Gmail for password reset |
| `EMAIL_PASS` | Optional | Gmail App Password |
| `GOOGLE_CLIENT_ID` | Optional | For Google Sign In |
| `VAPID_PUBLIC_KEY` | Optional | For push notifications |
| `VAPID_PRIVATE_KEY` | Optional | For push notifications |

---

## ✅ Google OAuth (if enabled)

- [ ] `GOOGLE_CLIENT_ID` set in Render environment
- [ ] Production URL added to **Authorized JavaScript origins** in Google Cloud Console:
  - `https://your-app.onrender.com`

---

## ✅ After First Deploy

- [ ] App loads at your Render URL
- [ ] Can create an account and log in
- [ ] AI question generation works (Gemini)
- [ ] Leaderboard loads without error
- [ ] History page loads with pagination
- [ ] Settings page shows push notification toggle
- [ ] Service worker registered (check DevTools → Application → Service Workers)

---

## ✅ UptimeRobot (Keep Alive — Free Tier)

Render free tier sleeps after 15 min inactivity.

1. Go to [uptimerobot.com](https://uptimerobot.com) and create a free account
2. Add New Monitor:
   - **Monitor Type:** HTTP(s)
   - **URL:** `https://your-app.onrender.com/api/auth/config`
   - **Monitoring Interval:** Every 14 minutes
3. Save — your app stays awake 24/7 on the free tier

---

## ✅ Generate VAPID Keys (if using push)

Run this once. Save both keys in your `.env` and in Render environment:

```bash
npx web-push generate-vapid-keys
```

---

## 🔑 Generate Strong Secrets

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run this twice — once for `JWT_SECRET`, once for `SESSION_SECRET`.

---

## 📱 Test on Mobile After Deploy

- [ ] Open on iOS Safari → Add to Home Screen → works as PWA
- [ ] Open on Android Chrome → Install prompt → works as PWA
- [ ] Push notification permission prompt appears in Settings
- [ ] Share button generates and downloads score card PNG

---

**You're live! 🎉**
