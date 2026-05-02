export const LEVELS = [
  { level: 1,  xpRequired: 0,      title: 'Newcomer',     emoji: '🌱' },
  { level: 2,  xpRequired: 150,    title: 'Curious',      emoji: '👀' },
  { level: 3,  xpRequired: 400,    title: 'Eager',        emoji: '📖' },
  { level: 4,  xpRequired: 800,    title: 'Apprentice',   emoji: '✏️' },
  { level: 5,  xpRequired: 1400,   title: 'Student',      emoji: '🎒' },
  { level: 6,  xpRequired: 2200,   title: 'Thinker',      emoji: '💭' },
  { level: 7,  xpRequired: 3200,   title: 'Scholar',      emoji: '📚' },
  { level: 8,  xpRequired: 4500,   title: 'Analyst',      emoji: '🔍' },
  { level: 9,  xpRequired: 6000,   title: 'Strategist',   emoji: '♟️' },
  { level: 10, xpRequired: 8000,   title: 'Expert',       emoji: '🧩' },
  { level: 11, xpRequired: 10500,  title: 'Specialist',   emoji: '⚗️' },
  { level: 12, xpRequired: 13500,  title: 'Adept',        emoji: '🔬' },
  { level: 13, xpRequired: 17000,  title: 'Virtuoso',     emoji: '🎯' },
  { level: 14, xpRequired: 21000,  title: 'Authority',    emoji: '🏛️' },
  { level: 15, xpRequired: 26000,  title: 'Mastermind',   emoji: '🧠' },
  { level: 16, xpRequired: 32000,  title: 'Prodigy',      emoji: '⚡' },
  { level: 17, xpRequired: 39000,  title: 'Luminary',     emoji: '✨' },
  { level: 18, xpRequired: 47000,  title: 'Sage',         emoji: '🦉' },
  { level: 19, xpRequired: 56000,  title: 'Oracle',       emoji: '🔮' },
  { level: 20, xpRequired: 66000,  title: 'Transcendent', emoji: '👑' },
]

export function getLevelInfo(xp = 0) {
  let current = LEVELS[0]
  let next    = LEVELS[1]
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xpRequired) {
      current = LEVELS[i]
      next    = LEVELS[i + 1] || null
    }
  }
  const xpIntoLevel    = next ? xp - current.xpRequired : 0
  const xpForNextLevel = next ? next.xpRequired - current.xpRequired : 1
  const progress       = next ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100)) : 100
  return { current, next, progress, xpIntoLevel, xpForNextLevel }
}

export function calculateXP(percentage, questionCount, isDailyChallenge, difficulty) {
  if (percentage < 30) return 0
  const diffMulti = { easy: 8, medium: 12, hard: 18, all: 10, mixed: 11 }
  const base = Math.floor((percentage / 100) * questionCount * (diffMulti[difficulty] || 10))
  let perfBonus = 0
  if (percentage === 100)     perfBonus = Math.round(base * 0.8)
  else if (percentage >= 90) perfBonus = Math.round(base * 0.5)
  else if (percentage >= 75) perfBonus = Math.round(base * 0.25)
  else if (percentage >= 60) perfBonus = Math.round(base * 0.1)
  return base + perfBonus + (isDailyChallenge ? 50 : 0)
}

export function calculateSmartAverage(history = []) {
  if (!history.length) return 0
  if (history.length === 1) return history[0].percentage
  const alpha = 0.25
  let avg = history[0].percentage
  for (let i = 1; i < history.length; i++) {
    avg = alpha * history[i].percentage + (1 - alpha) * avg
  }
  return Math.round(avg)
}
