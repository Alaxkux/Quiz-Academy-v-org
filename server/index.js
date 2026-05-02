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

// ✅ Connect DB
connectDB();

// ✅ Security
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// ✅ CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// ✅ Body parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

// ✅ Routes
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/ai',      require('./routes/ai'));
app.use('/api/push',    require('./routes/push'));
app.use('/api/history', require('./routes/history'));

// ✅ Cron reminder
const { sendStreakReminders } = require('./routes/push');

function scheduleDailyReminder() {
  const now = new Date();
  const next8pm = new Date();

  next8pm.setHours(20, 0, 0, 0);
  if (next8pm <= now) next8pm.setDate(next8pm.getDate() + 1);

  const delay = next8pm - now;

  setTimeout(() => {
    sendStreakReminders();
    setInterval(sendStreakReminders, 24 * 60 * 60 * 1000);
  }, delay);
}

// ✅ Serve frontend (only if built)
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  }
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);

  scheduleDailyReminder();
});