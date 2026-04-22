require('dotenv').config();
const express      = require('express');
const session      = require('express-session');
const MongoStore   = require('connect-mongo');
const cookieParser = require('cookie-parser');
const cors         = require('cors');
const helmet       = require('helmet');
const path         = require('path');
const connectDB    = require('./config/db');

const app = express();

// ── Connect to MongoDB ──
connectDB();

// ── Helmet (security headers) ──
app.use(helmet({
  contentSecurityPolicy: false, // disabled so inline scripts still work
  crossOriginEmbedderPolicy: false
}));

// ── CORS ──
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// ── Body parsers ──
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Session ──
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_dev_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 14 * 24 * 60 * 60
  }),
  cookie: {
    secure:   process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge:   7 * 24 * 60 * 60 * 1000
  }
}));

// ── Routes ──
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/ai',      require('./routes/ai'));
app.use('/api/push',    require('./routes/push'));
app.use('/api/history', require('./routes/history'));

// ── Streak reminder cron — fires daily at 8 PM server time ──
const { sendStreakReminders } = require('./routes/push');
function scheduleDailyReminder() {
  const now     = new Date();
  const next8pm = new Date(now);
  next8pm.setHours(20, 0, 0, 0);
  if (next8pm <= now) next8pm.setDate(next8pm.getDate() + 1);
  const msUntil = next8pm - now;

  setTimeout(() => {
    sendStreakReminders();
    setInterval(sendStreakReminders, 24 * 60 * 60 * 1000); // repeat every 24h
  }, msUntil);

  const h = Math.floor(msUntil / 3600000);
  const m = Math.floor((msUntil % 3600000) / 60000);
  console.log(`   Push:    ${process.env.VAPID_PUBLIC_KEY ? `✅ configured — first reminder in ${h}h ${m}m` : '⚠️  VAPID keys missing (push disabled)'}`);
}

// ── Static frontend ──
app.use(express.static(path.join(__dirname, '../client')));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/index.html'));
  }
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🎓 Quiz Academy running at http://localhost:${PORT}`);
  console.log(`   Mode:    ${process.env.NODE_ENV || 'development'}`);
  console.log(`   MongoDB: ${process.env.MONGODB_URI        ? '✅ configured' : '❌ MONGODB_URI missing'}`);
  console.log(`   Gemini:  ${process.env.GEMINI_API_KEY     ? '✅ configured' : '❌ GEMINI_API_KEY missing'}`);
  console.log(`   Email:   ${process.env.EMAIL_USER         ? '✅ configured' : '⚠️  EMAIL_USER missing (password reset disabled)'}`);
  scheduleDailyReminder();
  console.log('');
});
