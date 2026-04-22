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
  if (history.length === 1) return history[0].percentage;
  const alpha = 0.25;
  let avg = history[0].percentage;
  for (let i = 1; i < history.length; i++) {
    avg = alpha * history[i].percentage + (1 - alpha) * avg;
  }
  return Math.round(avg);
}

module.exports = { calculateSmartAverage };
