import { getLevelInfo, calculateSmartAverage } from '../data/levels'
import { ACHIEVEMENTS } from '../data/achievements'

// ── CHECK AND AWARD ACHIEVEMENTS ──
export function checkAchievements(user) {
  const { stats, history = [], achievements = [] } = user
  const newOnes = []
  const xpInfo  = getLevelInfo(stats?.totalXP || 0)

  function check(id, condition) {
    if (condition && !achievements.includes(id)) newOnes.push(id)
  }

  check('first_quiz',        (stats?.quizzesTaken || 0) >= 1)
  check('quiz_5',            (stats?.quizzesTaken || 0) >= 5)
  check('quiz_10',           (stats?.quizzesTaken || 0) >= 10)
  check('quiz_50',           (stats?.quizzesTaken || 0) >= 50)
  check('quiz_100',          (stats?.quizzesTaken || 0) >= 100)
  check('points_500',        (stats?.totalPoints  || 0) >= 500)
  check('points_1000',       (stats?.totalPoints  || 0) >= 1000)
  check('points_5000',       (stats?.totalPoints  || 0) >= 5000)
  check('streak_3',          (stats?.streak       || 0) >= 3)
  check('streak_7',          (stats?.streak       || 0) >= 7)
  check('streak_30',         (stats?.streak       || 0) >= 30)
  check('level_5',           xpInfo.current.level >= 5)
  check('level_10',          xpInfo.current.level >= 10)
  check('level_15',          xpInfo.current.level >= 15)
  check('level_20',          xpInfo.current.level >= 20)
  check('daily_7',           (stats?.dailyChallengesDone || 0) >= 7)

  const last = history[history.length - 1]
  if (last) {
    check('perfect_score', last.percentage === 100)
    check('speed_demon',   (last.timeTakenSeconds || 9999) < 60)
    if (history.length >= 2) {
      const prev = history[history.length - 2]
      check('comeback_kid', last.percentage >= 80 && prev.percentage < 50)
    }
  }

  return {
    newAchievements: newOnes.map(id => ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean),
    updatedList:     [...achievements, ...newOnes],
  }
}

// ── UPDATE STREAK (standard day-boundary comparison, like Duolingo/most streak apps) ──
function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function updateStreak(stats) {
  const today = startOfDay(new Date())
  const last  = stats?.lastQuizDate ? startOfDay(new Date(stats.lastQuizDate)) : null

  if (!last) {
    return { ...stats, streak: 1, lastQuizDate: new Date().toISOString() }
  }

  // Whole-day difference between local midnights — safe across DST,
  // unlike comparing raw 24h (86400000ms) windows.
  const dayDiff = Math.round((today - last) / 86400000)

  if (dayDiff === 0) return stats                    // already checked in today — no change
  if (dayDiff === 1) return { ...stats, streak: (stats.streak || 0) + 1, lastQuizDate: new Date().toISOString() } // consecutive day
  return { ...stats, streak: 1, lastQuizDate: new Date().toISOString() } // missed a day — streak resets to 1
}

// ── DAILY CHALLENGE ──
export function getDailyChallenge(quizData) {
  const today  = new Date().toDateString()
  const seed   = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const cats   = Object.keys(quizData)
  const cat    = cats[seed % cats.length]
  const qs     = quizData[cat]?.questions || []
  const idxs   = []
  let s = seed
  while (idxs.length < Math.min(5, qs.length)) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const i = s % qs.length
    if (!idxs.includes(i)) idxs.push(i)
  }
  return { category: cat, questions: idxs.map(i => qs[i]), date: today }
}

export function isDailyChallengeCompleted(user) {
  return user?.lastDailyChallenge === new Date().toDateString()
}

export function getDailyCountdown() {
  const now = new Date()
  const mid = new Date(now)
  mid.setHours(24, 0, 0, 0)
  const d = mid - now
  const h = Math.floor(d / 3600000)
  const m = Math.floor((d % 3600000) / 60000)
  return `Resets in ${h}h ${m}m`
}

// ── CATEGORY MASTERY ──
export function getCategoryMastery(history = [], category) {
  const h = history.filter(h => h.category === category)
  if (!h.length) return 0
  return calculateSmartAverage(h)
}

// ── WEAK TOPICS ──
export function getWeakTopics(history = [], quizData = {}) {
  return Object.keys(quizData).filter(cat => {
    const m = getCategoryMastery(history, cat)
    return m > 0 && m < 60
  })
}

// ── STUDY PLANNER HELPERS ──
export function getTodayProgress(history = [], dailyGoal = 2) {
  const today = new Date().toDateString()
  const done  = history.filter(h => new Date(h.date).toDateString() === today).length
  return { done, goal: dailyGoal, pct: Math.min(100, Math.round((done / dailyGoal) * 100)) }
}

export function getWeekProgress(history = [], dailyGoal = 2) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toDateString()
    const done    = history.filter(h => new Date(h.date).toDateString() === dateStr).length
    days.push({ date: d, done, met: done >= dailyGoal })
  }
  return days
}