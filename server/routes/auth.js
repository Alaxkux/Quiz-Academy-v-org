/* ================================================================
   QUIZ ACADEMY — AUTH ROUTES v4.1
   POST /api/auth/signup          — create account
   POST /api/auth/login           — login, get JWT + set session
   POST /api/auth/logout          — destroy session + clear cookie
   GET  /api/auth/me              — get current user (protected)
   PUT  /api/auth/me              — update profile (protected)
   POST /api/auth/sync            — sync game state to DB (protected)
   GET  /api/auth/leaderboard     — leaderboard data (protected)
   POST /api/auth/forgot-password — send real reset email
   POST /api/auth/reset-password  — reset password with token
   POST /api/auth/google          — Google OAuth one-tap sign-in
   ================================================================ */

const express   = require('express');
const validator = require('validator');
const crypto    = require('crypto');
const rateLimit = require('express-rate-limit');
const User      = require('../models/User');
const { requireAuth, generateToken } = require('../middleware/auth');

const router = express.Router();

// ── Nodemailer (lazy-loaded) ──
let transporter = null;
function getMailer() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  return transporter;
}

// ── Rate limiters ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { error: 'Too many attempts — please wait 15 minutes and try again' },
  standardHeaders: true, legacyHeaders: false
});
const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  message: { error: 'Too many reset requests — please wait an hour' }
});
const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 30,
  message: { error: 'Too many OAuth requests — please wait and try again' }
});

// ── Input sanitizer ──
function sanitize(str, maxLen = 300) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;').trim().slice(0, maxLen);
}

// ================================================================
// SIGNUP
// ================================================================
router.post('/signup', authLimiter, async (req, res) => {
  try {
    const name     = sanitize(req.body.name || '', 60);
    const email    = sanitize(req.body.email || '', 254);
    const password = req.body.password || '';

    if (name.length < 2)           return res.status(400).json({ error: 'Name must be at least 2 characters' });
    if (!validator.isEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address' });
    if (password.length < 8)       return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'This email is already registered' });

    const user  = await User.create({ name, email: email.toLowerCase(), password });
    req.session.userId = user._id.toString();
    const token = generateToken(user._id.toString(), user.tokenVersion || 0);
    res.status(201).json({ token, user: user.toPublicJSON() });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// ================================================================
// LOGIN
// ================================================================
router.post('/login', authLimiter, async (req, res) => {
  try {
    const email    = sanitize(req.body.email || '', 254);
    const password = req.body.password || '';
    const rememberMe = Boolean(req.body.rememberMe);

    if (!validator.isEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address' });
    if (!password)                  return res.status(400).json({ error: 'Password is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    // Block password login for Google-only accounts
    if (user.googleId && !user.hasSetPassword) {
      return res.status(400).json({ error: 'This account uses Google Sign-In. Please click "Continue with Google".' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    req.session.userId = user._id.toString();
    if (rememberMe) req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    const token = generateToken(user._id.toString(), user.tokenVersion || 0);
    res.json({ token, user: user.toPublicJSON() });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ================================================================
// GOOGLE OAUTH — verify ID token from Google One Tap / Sign In button
// ================================================================
router.post('/google', oauthLimiter, async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential)                  return res.status(400).json({ error: 'Google credential is required' });
    if (!process.env.GOOGLE_CLIENT_ID) return res.status(503).json({ error: 'Google OAuth not configured — add GOOGLE_CLIENT_ID to .env' });

    // Verify the Google ID token
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken:  credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.error('Google token verify failed:', verifyErr.message);
      return res.status(401).json({ error: 'Invalid Google credential — please try again' });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: 'Could not retrieve a valid email from Google' });
    }

    // Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (user) {
      // Link Google ID if this email existed as a password account
      if (!user.googleId) {
        user.googleId = googleId;
        // Update avatar with Google photo if they haven't set a custom one
        if (picture && user.avatar?.includes('ui-avatars')) user.avatar = picture;
        await user.save();
      }
    } else {
      // Brand new user via Google
      user = await User.create({
        name:          sanitize(name || 'User', 60),
        email:         email.toLowerCase(),
        googleId,
        avatar:        picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=6C8EFF&color=fff&size=128`,
        // Set a random unhashed dummy password — comparePassword will always fail for OAuth users
        password:      crypto.randomBytes(32).toString('hex'),
        hasSetPassword: false
      });
    }

    req.session.userId = user._id.toString();
    const token = generateToken(user._id.toString(), user.tokenVersion || 0);
    res.json({ token, user: user.toPublicJSON() });
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.status(500).json({ error: 'Google sign-in failed — please try again' });
  }
});

// ================================================================
// LOGOUT
// ================================================================
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Session destroy error:', err);
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// ================================================================
// GET CURRENT USER
// ================================================================
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

// ================================================================
// UPDATE PROFILE
// ================================================================
router.put('/me', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { name, bio, avatar, settings, stats, history, achievements, notifications, lastDailyChallenge } = req.body;

    if (name !== undefined) {
      const clean = sanitize(name, 60);
      if (clean.length < 2) return res.status(400).json({ error: 'Name must be at least 2 characters' });
      user.name = clean;
    }
    if (bio      !== undefined) user.bio      = sanitize(bio, 300);
    if (avatar !== undefined) {
      // Only accept safe URLs (https or data URIs for base64 avatars)
      if (typeof avatar === 'string' && (
        avatar.startsWith('https://') ||
        avatar.startsWith('data:image/')
      )) {
        user.avatar = avatar;
      }
    }
    if (settings !== undefined) user.settings = { ...user.settings, ...settings };
    if (lastDailyChallenge !== undefined) user.lastDailyChallenge = lastDailyChallenge;
    if (stats        !== undefined) user.stats        = { ...(user.stats.toObject ? user.stats.toObject() : user.stats), ...stats };
    if (history      !== undefined) user.history      = history;
    if (achievements !== undefined) user.achievements = achievements;
    if (notifications !== undefined) user.notifications = notifications.slice(0, 50);

    await user.save();
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ================================================================
// SYNC
// ================================================================
router.post('/sync', requireAuth, async (req, res) => {
  try {
    const user    = req.user;
    const allowed = ['stats','history','achievements','notifications','settings','lastDailyChallenge','isNewUser','bio','avatar','name'];
    allowed.forEach(key => {
      if (req.body[key] !== undefined) {
        user[key] = key === 'name' ? sanitize(req.body[key], 60)
                  : key === 'bio'  ? sanitize(req.body[key], 300)
                  : req.body[key];
      }
    });
    await user.save();
    res.json({ ok: true, user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ error: 'Sync failed' });
  }
});

// ================================================================
// LEADERBOARD
// ================================================================
router.get('/leaderboard', requireAuth, async (req, res) => {
  try {
    const users = await User.find({})
      .select('name avatar stats achievements joinDate')
      .lean();
    // Strip sensitive fields and don't expose full history publicly
    const safeUsers = users.map(u => ({
      _id:          u._id,
      name:         u.name,
      avatar:       u.avatar,
      stats:        u.stats,
      achievements: u.achievements,
      joinDate:     u.joinDate,
    }));
    res.json({ users: safeUsers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ================================================================
// FORGOT PASSWORD
// ================================================================
router.post('/forgot-password', forgotLimiter, async (req, res) => {
  try {
    const email      = sanitize(req.body.email || '', 254);
    const successMsg = { message: 'If this email is registered, a reset link has been sent.' };

    if (!validator.isEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json(successMsg);

    const token   = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000;
    user.resetPasswordToken   = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const mailer   = getMailer();
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    if (!mailer) {
      console.log(`\n🔑 DEV RESET LINK: ${resetUrl}\n`);
      return res.json(successMsg);
    }

    await mailer.sendMail({
      from:    `"Quiz Academy" <${process.env.EMAIL_USER}>`,
      to:      user.email,
      subject: 'Reset Your Quiz Academy Password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#07090E;color:#fff;border-radius:12px">
          <h2 style="color:#6C8EFF;margin-bottom:8px">🎓 Quiz Academy</h2>
          <h3 style="margin-bottom:16px">Password Reset Request</h3>
          <p style="color:#aaa;margin-bottom:24px">Hi ${user.name}, someone requested a password reset for your account.</p>
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#6C8EFF,#4DFFC3);color:#fff;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:700;font-size:15px">Reset My Password</a>
          <p style="color:#666;font-size:12px;margin-top:24px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>`
    });

    res.json(successMsg);
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// ================================================================
// RESET PASSWORD
// ================================================================
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token)                return res.status(400).json({ error: 'Reset token is required' });
    if (!password || password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const user = await User.findOne({
      resetPasswordToken:   token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

    user.password             = password;
    user.hasSetPassword       = true;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// CHANGE PASSWORD — authenticated users only
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword)              return res.status(400).json({ error: 'Current password is required' })
    if (!newPassword || newPassword.length < 8)
      return res.status(400).json({ error: 'New password must be at least 8 characters' })

    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect' })

    user.password = newPassword
    user.hasSetPassword = true
    await user.save()
    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    console.error('Change password error:', err)
    res.status(500).json({ error: 'Failed to change password' })
  }
})

// CONFIG — exposes safe public config
router.get('/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null
  });
});

module.exports = router;