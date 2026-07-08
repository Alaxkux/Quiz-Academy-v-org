/* ================================================================
   QUIZ ACADEMY — SCORING UTILITIES
   Shared between routes. Kept separate to avoid circular deps.
   ================================================================ */

/**
 * Exponential moving average for quiz scores.
 * Recent quizzes weight more. Makes 100% achievable again.
 */
function calculateSmartAverage(history) {
  if (!history || !history.length) return 0;
  // Zero-score attempts shouldn't drag the running average down — excluded
  // the same way they already earn 0 XP. Kept in sync with the identical
  // client-side copy in quiz-academy-react/src/data/levels.js.
  const scored = history.filter(h => (h.percentage || 0) > 0);
  if (!scored.length) return 0;
  if (scored.length === 1) return scored[0].percentage;
  const alpha = 0.25;
  let avg = scored[0].percentage;
  for (let i = 1; i < scored.length; i++) {
    avg = alpha * scored[i].percentage + (1 - alpha) * avg;
  }
  return Math.round(avg);
}

/**
 * Mirrors the client-side XP formula in quiz-academy-react/src/data/levels.js.
 * Used server-side to clamp/validate history entries a client tries to sync,
 * so a crafted request can't grant unlimited XP/points.
 */
function calculateXP(percentage, questionCount, isDailyChallenge, difficulty) {
  if (percentage < 30) return 0;
  const diffMulti = { easy: 8, medium: 12, hard: 18, all: 10, mixed: 11 };
  const base = Math.floor((percentage / 100) * questionCount * (diffMulti[difficulty] || 18)); // unknown difficulty -> most generous multiplier, still bounded
  let perfBonus = 0;
  if (percentage === 100)     perfBonus = Math.round(base * 0.8);
  else if (percentage >= 90) perfBonus = Math.round(base * 0.5);
  else if (percentage >= 75) perfBonus = Math.round(base * 0.25);
  else if (percentage >= 60) perfBonus = Math.round(base * 0.1);
  return base + perfBonus + (isDailyChallenge ? 50 : 0);
}

function calculatePoints(percentage, isDailyChallenge) {
  return Math.round(percentage * 10) + (isDailyChallenge ? 50 : 0);
}

/**
 * Validates and clamps a single quiz history entry against the theoretical
 * max for its own reported total/difficulty, so xpEarned/points can't be
 * arbitrarily inflated by a client. Does NOT verify correctness of individual
 * answers (that needs server-graded quizzes) — this is a bound, not a proof.
 */
function sanitizeHistoryEntry(entry) {
  if (!entry || typeof entry !== 'object') return entry;
  const total   = Math.max(0, Number(entry.total) || 0);
  const score   = Math.min(Math.max(0, Number(entry.score) || 0), total);
  const pct     = total > 0 ? Math.round((score / total) * 100) : 0;
  const isDaily = !!entry.isDailyChallenge;

  const maxXp     = calculateXP(pct, total, isDaily, entry.difficulty || 'hard');
  const maxPoints = calculatePoints(pct, isDaily);

  return {
    ...entry,
    score,
    total,
    percentage: pct,
    xpEarned: Math.min(Math.max(0, Number(entry.xpEarned) || 0), Math.max(maxXp, 0)),
    points:   Math.min(Math.max(0, Number(entry.points)   || 0), Math.max(maxPoints, 0)),
  };
}

module.exports = { calculateSmartAverage, calculateXP, calculatePoints, sanitizeHistoryEntry };
