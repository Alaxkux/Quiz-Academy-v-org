const jwt  = require('jsonwebtoken');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  const header = req.header('Authorization');

  if (!header) {
    return res.status(401).json({ error: 'No token' });
  }

  const token = header.startsWith('Bearer ') ? header.slice(7) : header;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    // ── tokenVersion check: invalidates old tokens after password change / logout ──
    if (decoded.tv !== undefined && decoded.tv !== user.tokenVersion) {
      return res.status(401).json({ error: 'Session expired — please log in again' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function generateToken(userId, tokenVersion = 0) {
  return jwt.sign(
    { id: userId, tv: tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, generateToken };
