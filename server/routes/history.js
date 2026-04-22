/* ================================================================
   QUIZ ACADEMY — HISTORY ROUTES v4
   GET  /api/history          — paginated quiz history (no questionData)
   GET  /api/history/:index   — single quiz with full questionData
   DELETE /api/history/:index — delete one history entry
   DELETE /api/history        — clear all history
   ================================================================ */

const express = require('express');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const histLimiter = rateLimit({
  windowMs: 60 * 1000, max: 60,
  message: { error: 'Too many history requests' }
});

// ── GET PAGINATED HISTORY (strips questionData for performance) ──
router.get('/', requireAuth, histLimiter, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const user  = req.user;
    const total = user.history.length;

    // Return history in reverse (newest first), strip questionData from list
    const slice = user.history
      .slice()
      .reverse()
      .slice(skip, skip + limit)
      .map((h, i) => ({
        _index:          total - 1 - (skip + i), // original index for detail fetch
        category:        h.category,
        date:            h.date,
        score:           h.score,
        total:           h.total,
        percentage:      h.percentage,
        points:          h.points,
        xpEarned:        h.xpEarned,
        timeTaken:       h.timeTaken,
        timeTakenSeconds: h.timeTakenSeconds,
        isDailyChallenge: h.isDailyChallenge,
        hasReview:       !!(h.questionData?.length)
      }));

    res.json({
      history:     slice,
      total,
      page,
      totalPages:  Math.ceil(total / limit),
      hasMore:     skip + limit < total
    });
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ── GET SINGLE QUIZ WITH FULL questionData ──
router.get('/:index', requireAuth, histLimiter, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const user  = req.user;

    if (isNaN(index) || index < 0 || index >= user.history.length) {
      return res.status(404).json({ error: 'History entry not found' });
    }

    res.json({ entry: user.history[index] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history entry' });
  }
});

// ── DELETE SINGLE ENTRY ──
router.delete('/:index', requireAuth, async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    const user  = req.user;

    if (isNaN(index) || index < 0 || index >= user.history.length) {
      return res.status(404).json({ error: 'History entry not found' });
    }

    user.history.splice(index, 1);
    // Recalculate weighted average
    if (user.history.length > 0) {
      const { calculateSmartAverage } = require('../utils/scoring');
      user.stats.weightedAvgScore = calculateSmartAverage(user.history);
    } else {
      user.stats.weightedAvgScore = null;
    }
    await user.save();
    res.json({ ok: true, remaining: user.history.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// ── CLEAR ALL HISTORY ──
router.delete('/', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    user.history = [];
    user.stats.weightedAvgScore = null;
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

module.exports = router;
