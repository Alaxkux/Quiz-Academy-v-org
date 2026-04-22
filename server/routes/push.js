/* ================================================================
   QUIZ ACADEMY — PUSH NOTIFICATION ROUTES v4
   GET  /api/push/vapid-public-key  — return VAPID public key to client
   POST /api/push/subscribe         — save push subscription to DB
   POST /api/push/unsubscribe       — remove push subscription from DB
   POST /api/push/test              — send test notification (dev only)
   ================================================================ */

const express    = require('express');
const webpush    = require('web-push');
const rateLimit  = require('express-rate-limit');
const User       = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ── Configure web-push with VAPID keys ──
function getWebPush() {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return null;
  try {
    webpush.setVapidDetails(
      `mailto:${process.env.EMAIL_USER || 'admin@quiz-academy.app'}`,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
    return webpush;
  } catch (err) {
    console.error('VAPID config error:', err.message);
    return null;
  }
}

const pushLimiter = rateLimit({
  windowMs: 60 * 1000, max: 10,
  message: { error: 'Too many push requests' }
});

// ── GET VAPID PUBLIC KEY ──
router.get('/vapid-public-key', (req, res) => {
  if (!process.env.VAPID_PUBLIC_KEY) {
    return res.status(503).json({ error: 'Push notifications not configured' });
  }
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// ── SUBSCRIBE ──
router.post('/subscribe', requireAuth, pushLimiter, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription?.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    const user = req.user;

    // Store subscription on user — avoid duplicates by endpoint
    if (!user.pushSubscriptions) user.pushSubscriptions = [];
    const exists = user.pushSubscriptions.some(s => s.endpoint === subscription.endpoint);
    if (!exists) {
      user.pushSubscriptions.push({
        endpoint: subscription.endpoint,
        keys:     subscription.keys,
        addedAt:  new Date()
      });
      // Keep max 5 subscriptions per user (one per device)
      if (user.pushSubscriptions.length > 5) {
        user.pushSubscriptions = user.pushSubscriptions.slice(-5);
      }
      await user.save();
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// ── UNSUBSCRIBE ──
router.post('/unsubscribe', requireAuth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    const user = req.user;
    if (user.pushSubscriptions) {
      user.pushSubscriptions = user.pushSubscriptions.filter(s => s.endpoint !== endpoint);
      await user.save();
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
});

// ── TEST PUSH (dev only) ──
router.post('/test', requireAuth, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Test endpoint disabled in production' });
  }

  const wp = getWebPush();
  if (!wp) return res.status(503).json({ error: 'Push not configured — add VAPID keys to .env' });

  const user = req.user;
  if (!user.pushSubscriptions?.length) {
    return res.status(400).json({ error: 'No push subscriptions found for your account' });
  }

  const payload = JSON.stringify({
    title:   '🎓 Quiz Academy Test',
    body:    'Push notifications are working! Keep your streak alive 🔥',
    icon:    '/icons/icon-192.png',
    tag:     'test',
    url:     '/'
  });

  const results = await sendToSubscriptions(wp, user.pushSubscriptions, payload);
  res.json({ sent: results.sent, failed: results.failed });
});

// ── SEND STREAK REMINDER (called by cron job) ──
async function sendStreakReminders() {
  const wp = getWebPush();
  if (!wp) return { skipped: true, reason: 'VAPID not configured' };

  const today = new Date().toDateString();
  let sent = 0, failed = 0, skipped = 0;

  try {
    // Find users who have push subscriptions, haven't quizzed today, and have an existing streak
    const users = await User.find({
      'pushSubscriptions.0': { $exists: true },
      $or: [
        { 'stats.lastQuizDate': { $lt: new Date(new Date().setHours(0,0,0,0)) } },
        { 'stats.lastQuizDate': null }
      ]
    }).select('name stats pushSubscriptions lastDailyChallenge');

    for (const user of users) {
      // Skip if they already completed today's daily challenge
      if (user.lastDailyChallenge === today) { skipped++; continue; }

      const streak = user.stats?.streak || 0;
      const body   = streak >= 7
        ? `Don't break your ${streak}-day streak! 🔥 Take today's quiz now.`
        : streak >= 3
        ? `You're on a ${streak}-day streak! Keep it going 🔥`
        : `Take a quick quiz today to build your streak! 🎓`;

      const payload = JSON.stringify({
        title:   '🔥 Quiz Academy — Daily Reminder',
        body,
        icon:    '/icons/icon-192.png',
        badge:   '/icons/icon-72.png',
        tag:     'streak-reminder',
        url:     '/',
        actions: [
          { action: 'open',    title: '▶ Take Quiz Now' },
          { action: 'dismiss', title: 'Later' }
        ]
      });

      const results = await sendToSubscriptions(wp, user.pushSubscriptions, payload);
      sent   += results.sent;
      failed += results.failed;

      // Clean up expired subscriptions
      if (results.expiredEndpoints.length > 0) {
        user.pushSubscriptions = user.pushSubscriptions.filter(
          s => !results.expiredEndpoints.includes(s.endpoint)
        );
        await user.save();
      }
    }

    console.log(`📱 Streak reminders sent: ${sent} ✅  failed: ${failed} ❌  skipped: ${skipped} ⏭️`);
    return { sent, failed, skipped };
  } catch (err) {
    console.error('Streak reminder error:', err);
    return { error: err.message };
  }
}

// ── HELPER: send to all subscriptions for a user ──
async function sendToSubscriptions(wp, subscriptions, payload) {
  let sent = 0, failed = 0;
  const expiredEndpoints = [];

  await Promise.allSettled(
    subscriptions.map(async sub => {
      try {
        await wp.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload,
          { TTL: 86400 } // 24 hour TTL
        );
        sent++;
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expired/invalid — mark for cleanup
          expiredEndpoints.push(sub.endpoint);
        }
        failed++;
      }
    })
  );

  return { sent, failed, expiredEndpoints };
}

module.exports = router;
module.exports.sendStreakReminders = sendStreakReminders;
