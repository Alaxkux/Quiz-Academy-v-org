// Format numbers with commas
export function fmtNum(n) {
  return (n || 0).toLocaleString()
}

// Format time in seconds to m:ss
export function fmtTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${s < 10 ? '0' + s : s}s`
}

// Format a date string to readable form
export function fmtDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Date group label — Today, Yesterday, This Week, Earlier
export function dateGroup(dateStr) {
  const d     = new Date(dateStr)
  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff  = Math.floor((today - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff <= 7)  return 'This Week'
  return 'Earlier'
}

// Score colour
export function scoreColor(pct) {
  if (pct >= 80) return 'var(--green)'
  if (pct >= 60) return 'var(--gold)'
  return 'var(--red)'
}

// Score emoji
export function scoreEmoji(pct) {
  if (pct >= 90) return '🎉'
  if (pct >= 75) return '😊'
  if (pct >= 60) return '👍'
  if (pct >= 40) return '📚'
  return '💪'
}

// Score grade
export function scoreGrade(pct) {
  if (pct >= 90) return 'Excellent!'
  if (pct >= 75) return 'Great Job!'
  if (pct >= 60) return 'Good Effort!'
  if (pct >= 40) return 'Keep Learning!'
  return 'Keep Practicing!'
}

// Truncate text
export function truncate(str, len = 40) {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

// Get week start (Monday)
export function getWeekStart() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const mon = new Date(now.setDate(diff))
  mon.setHours(0, 0, 0, 0)
  return mon
}

// Weekly points from history
export function weeklyPoints(history = []) {
  const ws = getWeekStart()
  return history
    .filter(h => new Date(h.date) >= ws)
    .reduce((sum, h) => sum + (h.points || 0), 0)
}

// Last 7 days quiz count per day for chart
export function last7DaysData(history = []) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const label = d.toLocaleDateString('en-GB', { weekday: 'short' })
    const quizzes = history.filter(h => {
      const hd = new Date(h.date)
      hd.setHours(0, 0, 0, 0)
      return hd.getTime() === d.getTime()
    })
    const avgScore = quizzes.length
      ? Math.round(quizzes.reduce((s, q) => s + q.percentage, 0) / quizzes.length)
      : 0
    days.push({ day: label, score: avgScore, quizzes: quizzes.length })
  }
  return days
}
