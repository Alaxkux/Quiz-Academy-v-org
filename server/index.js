require('dotenv').config();

const dns = require('dns');
// Some ISP / mobile-hotspot DNS resolvers intermittently fail SRV record
// queries (ESERVFAIL) even though the record is valid. This only affects
// dns.resolve*() — used for the mongodb+srv:// SRV lookup — and does NOT
// touch dns.lookup() (used for the actual shard connections), so it's safe
// and won't cause the "Invalid IP address" issue from before.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const mongoose = require('mongoose');
const { startServer } = require('./utils/startServer');

const app = express();


// ─────────────────────────────
// 🔐 ENV SAFETY CHECK (IMPORTANT)
// ─────────────────────────────
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing in environment variables");
  process.exit(1);
}


// ─────────────────────────────
// 📡 MongoDB Connection
// ─────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });


// ─────────────────────────────
// 🛡️ Security Middleware
// ─────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));


// ─────────────────────────────
// 🌐 CORS
// ─────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));


// ─────────────────────────────
// 🧾 Body Parsers
// ─────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// ─────────────────────────────
// 🧠 Session (Mongo Store)
// ─────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));


// ─────────────────────────────
// 📦 Routes
// ─────────────────────────────
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/ai',      require('./routes/ai'));
app.use('/api/push',    require('./routes/push'));
app.use('/api/history', require('./routes/history'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/admin',   require('./routes/admin'));


// ─────────────────────────────
// ⏰ Push reminder scheduler
// ─────────────────────────────
const { sendStreakReminders } = require('./routes/push');

function scheduleDailyReminder() {
  const now = new Date();
  const next8pm = new Date(now);

  next8pm.setHours(20, 0, 0, 0);
  if (next8pm <= now) next8pm.setDate(next8pm.getDate() + 1);

  const msUntil = next8pm - now;

  setTimeout(() => {
    try { sendStreakReminders(); } catch(e) { console.error('Push reminder error:', e.message); }
    setInterval(() => {
      try { sendStreakReminders(); } catch(e) { console.error('Push reminder error:', e.message); }
    }, 24 * 60 * 60 * 1000);
  }, msUntil);

  console.log(
    process.env.VAPID_PUBLIC_KEY
      ? `✅ Push scheduled in ${Math.floor(msUntil / 3600000)}h`
      : "⚠️ Push disabled (missing VAPID keys)"
  );
}


// ─────────────────────────────
// 🧱 Static frontend (production)
// ─────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// ─────────────────────────────
// ❌ Error handler
// ─────────────────────────────
app.use((err, req, res, next) => {
  console.error("🔥 Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});


// ─────────────────────────────
// 🚀 Start server
// ─────────────────────────────
const PORT = Number(process.env.PORT || 3000);

startServer(app, {
  port: PORT,
  host: '0.0.0.0',
  onListening: (server, actualPort) => {
    console.log(`\n🚀 Server running on port ${actualPort}`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Mongo: ${process.env.MONGO_URI ? '✅ set' : '❌ missing'}`);
    console.log(`Email: ${process.env.EMAIL_USER ? '✅ set' : '⚠️ missing'}`);

    scheduleDailyReminder();
  },
  onError: (err) => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
});