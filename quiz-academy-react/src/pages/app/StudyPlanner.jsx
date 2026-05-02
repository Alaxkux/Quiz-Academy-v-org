import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, Flame, Snowflake, ChevronRight, Calendar } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { getTodayProgress, getWeekProgress } from '../../utils/gamification'
import { getAllCourses } from '../../data/quizData'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'

// Circular progress ring
function GoalRing({ done, goal }) {
  const pct    = Math.min(100, goal > 0 ? (done / goal) * 100 : 0)
  const r      = 40
  const circ   = 2 * Math.PI * r
  const dash   = (pct / 100) * circ
  const done_  = done >= goal
  const color  = done_ ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--accent)'

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg viewBox="0 0 96 96" className="absolute inset-0 w-full h-full -rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="font-display font-black text-2xl" style={{ color }}>{done}</div>
        <div className="text-xs text-muted">/{goal}</div>
      </div>
    </div>
  )
}

// Week calendar strip
function WeekStrip({ weekData, dailyGoal }) {
  const DAYS = ['M','T','W','T','F','S','S']
  return (
    <div className="flex gap-2 justify-between">
      {weekData.map((day, i) => {
        const label  = DAYS[i]
        const isToday = i === weekData.findIndex((_, idx) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - idx)); return d.toDateString() === new Date().toDateString()
        })

        return (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
            <span className="text-xs text-muted" style={{ fontSize: 10 }}>{label}</span>
            <div
              className="w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background: day.met
                  ? 'var(--green)'
                  : day.done > 0
                    ? 'var(--gold-dim)'
                    : 'var(--bg2)',
                border: isToday
                  ? '2px solid var(--accent)'
                  : `1px solid ${day.met ? 'rgba(77,255,195,.3)' : 'var(--border)'}`,
                color: day.met ? '#0a1a12' : day.done > 0 ? 'var(--gold)' : 'var(--t3)',
              }}
            >
              {day.met ? '✓' : day.done || ''}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function StudyPlanner() {
  const navigate         = useNavigate()
  const { user, updateUser } = useAuth()

  const settings     = user?.settings || {}
  const stats        = user?.stats    || {}
  const history      = user?.history  || []

  const dailyGoal    = settings.dailyGoal    || 2
  const freezeTokens = stats.freezeTokens    || 0
  const todayProg    = getTodayProgress(history, dailyGoal)
  const weekData     = getWeekProgress(history, dailyGoal)
  const weekMet      = weekData.filter(d => d.met).length

  // Edit daily goal
  const [editGoal,    setEditGoal]    = useState(false)
  const [goalInput,   setGoalInput]   = useState(String(dailyGoal))

  function saveGoal() {
    const n = parseInt(goalInput)
    if (isNaN(n) || n < 1 || n > 20) { toast.error('Goal must be between 1 and 20'); return }
    updateUser({ settings: { ...settings, dailyGoal: n } })
    setEditGoal(false)
    toast.success('Daily goal updated!')
  }

  function useFreeze() {
    if (!freezeTokens) { toast.error('No freeze tokens available'); return }
    updateUser({ stats: { ...stats, freezeTokens: freezeTokens - 1, streak: stats.streak || 0 } })
    toast.success('Streak freeze used! 🧊 Streak protected.')
  }

  const allCourses    = getAllCourses()
  const weakCategories = Object.keys(allCourses).filter(cat => {
    const h = history.filter(h => h.category === cat)
    if (!h.length) return false
    const avg = h.reduce((s, x) => s + x.percentage, 0) / h.length
    return avg < 60
  })

  const today     = new Date().toDateString()
  const todayDone = history.filter(h => new Date(h.date).toDateString() === today)
  const planDone  = todayProg.done >= dailyGoal

  return (
    <PageWrapper>
      <PageHeader
        title="📅 Study Planner"
        subtitle="Track your daily learning goals and build consistency"
      />

      {/* Today's progress */}
      <motion.div
        className="rounded-2xl p-5"
        style={{
          background: planDone ? 'var(--green-dim)' : 'var(--bg1)',
          border:     `1px solid ${planDone ? 'rgba(77,255,195,.3)' : 'var(--border)'}`,
        }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-5">
          <GoalRing done={todayProg.done} goal={dailyGoal} />
          <div className="flex-1">
            <h3 className="font-display font-bold text-base text-primary mb-1">
              {planDone ? '✅ Goal Complete!' : "Today's Goal"}
            </h3>
            <p className="text-sm text-secondary mb-3">
              {planDone
                ? `You've completed ${todayProg.done} quiz${todayProg.done !== 1 ? 'zes' : ''} today. Great work!`
                : `${todayProg.done} of ${dailyGoal} quizzes done today`}
            </p>
            {!planDone && (
              <Button variant="primary" size="sm" onClick={() => navigate('/play')}>
                Start a Quiz →
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Weekly calendar */}
      <motion.div
        className="rounded-2xl p-5"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-sm text-primary">📆 This Week</h3>
            <p className="text-xs text-muted mt-0.5">{weekMet}/7 days goal met</p>
          </div>
          <div
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: weekMet >= 5 ? 'var(--green-dim)' : 'var(--gold-dim)',
              color:      weekMet >= 5 ? 'var(--green)'     : 'var(--gold)',
              border:     `1px solid ${weekMet >= 5 ? 'rgba(77,255,195,.2)' : 'rgba(245,200,66,.2)'}`,
            }}
          >
            {weekMet >= 7 ? '🔥 Perfect Week!' : weekMet >= 5 ? '💪 Strong week' : weekMet >= 3 ? '👍 Good effort' : '📚 Keep going'}
          </div>
        </div>
        <WeekStrip weekData={weekData} dailyGoal={dailyGoal} />
      </motion.div>

      {/* Goal + streak settings */}
      <motion.div
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
      >
        {/* Daily goal */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
              <Target size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div className="font-medium text-sm text-primary">Daily Quiz Goal</div>
              <div className="text-xs text-muted">Quizzes to complete each day</div>
            </div>
          </div>
          {editGoal ? (
            <div className="flex items-center gap-2">
              <input
                type="number" value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                min={1} max={20}
                className="w-14 px-2 py-1.5 rounded-lg text-sm text-center outline-none"
                style={{ background: 'var(--bg2)', border: '1px solid var(--accent)', color: 'var(--t1)' }}
              />
              <Button variant="primary" size="xs" onClick={saveGoal}>Save</Button>
              <Button variant="secondary" size="xs" onClick={() => { setEditGoal(false); setGoalInput(String(dailyGoal)) }}>
                Cancel
              </Button>
            </div>
          ) : (
            <button onClick={() => setEditGoal(true)}
              className="flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent)' }}>
              {dailyGoal} / day <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,107,138,.2)' }}>
              <Flame size={16} style={{ color: 'var(--red)' }} />
            </div>
            <div>
              <div className="font-medium text-sm text-primary">Current Streak</div>
              <div className="text-xs text-muted">Consecutive days of quizzing</div>
            </div>
          </div>
          <div className="font-display font-black text-xl" style={{ color: 'var(--red)' }}>
            {stats.streak || 0} 🔥
          </div>
        </div>

        {/* Freeze tokens */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(56,189,248,.1)', border: '1px solid rgba(56,189,248,.2)' }}>
              <Snowflake size={16} style={{ color: '#38BDF8' }} />
            </div>
            <div>
              <div className="font-medium text-sm text-primary">Streak Freeze Tokens</div>
              <div className="text-xs text-muted">
                {freezeTokens > 0
                  ? `${freezeTokens} token${freezeTokens !== 1 ? 's' : ''} available — protects your streak for 1 missed day`
                  : 'Earn 1 token every 7-day streak · Keep quizzing!'}
              </div>
            </div>
          </div>
          {freezeTokens > 0 ? (
            <Button variant="secondary" size="xs" onClick={useFreeze}>
              🧊 Use ({freezeTokens})
            </Button>
          ) : (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'var(--bg2)', color: 'var(--t3)', border: '1px solid var(--border)' }}>
              0 tokens
            </span>
          )}
        </div>
      </motion.div>

      {/* Recommended quizzes */}
      <motion.div
        className="rounded-2xl p-5"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
      >
        <h3 className="font-display font-semibold text-sm text-primary mb-3">
          🎯 Recommended for Today
        </h3>

        {weakCategories.length > 0 ? (
          <div className="flex flex-col gap-2">
            {weakCategories.slice(0, 3).map(cat => (
              <button key={cat}
                onClick={() => navigate('/quiz/config', { state: { category: cat } })}
                className="flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:opacity-80"
                style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                <span className="text-lg">{allCourses[cat]?.icon || '📚'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-primary truncate">{cat}</div>
                  <div className="text-xs text-muted">Below 60% — needs practice</div>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--t3)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">🌟</div>
            <p className="text-sm text-secondary">All topics above 60% — great work!</p>
            <Button variant="ghost" size="sm" className="mt-3"
              onClick={() => navigate('/categories')}>
              Browse All Courses
            </Button>
          </div>
        )}
      </motion.div>
    </PageWrapper>
  )
}
