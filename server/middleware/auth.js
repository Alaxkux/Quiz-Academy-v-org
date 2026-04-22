/* ================================================================
   QUIZ ACADEMY — AUTH MIDDLEWARE
   Supports both JWT (Authorization header) and
   Express sessions (cookie-based) simultaneously.
   ================================================================ */

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Verify JWT or Session ──
async function requireAuth(req, res, next) {
  try {
    let userId = null;

    // 1. Try JWT from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    }

    // 2. Fall back to session
    if (!userId && req.session?.userId) {
      userId = req.session.userId;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
    if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
    res.status(500).json({ error: 'Auth error' });
  }
}

// ── Generate JWT ──
function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = { requireAuth, generateToken };
