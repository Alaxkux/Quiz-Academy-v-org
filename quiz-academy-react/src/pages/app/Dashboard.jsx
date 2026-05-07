import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { getLevelInfo } from '../../data/levels'
import { getAllCourses } from '../../data/quizData'
import { getWeakTopics, isDailyChallengeCompleted, getDailyCountdown } from '../../utils/gamification'
import { fmtNum } from '../../utils/format'
import PageWrapper from '../../components/layout/PageWrapper'
import StatsGrid from '../../components/dashboard/StatsGrid'
import WeeklyChart from '../../components/dashboard/WeeklyChart'
import QuickActions from '../../components/dashboard/QuickActions'
import RecommendBanner from '../../components/dashboard/RecommendBanner'
import ProgressBar from '../../components/ui/ProgressBar'
import Badge from '../../components/ui/Badge'

function RecentItem({ entry }) {
  const navigate = useNavigate()
  const pct   = entry.percentage
  const color = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--gold)' : 'var(--red)'
  const emoji = pct >= 80 ? '⭐' : pct >= 60 ? '👍' : '📝'

  return (
    <motion.div
      className="flex items-center gap-3 py-2.5 border-b last:border-0 cursor-pointer hover:opacity-75 transition-opacity"
      style={{ borderColor: 'var(--border)' }}
      onClick={() => navigate('/history')}
      whileTap={{ scale: 0.99 }}
    >
      <span className="text-lg flex-shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-primary truncate">{entry.category}</div>
        <div className="text-xs text-muted">{new Date(entry.date).toLocaleDateString()} · {entry.timeTaken}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-muted">{entry.score}/{entry.total}</span>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-xs border-2 flex-shrink-0"
          style={{ borderColor: color, color }}>
          {pct}%
        </div>
      </div>
    </motion.div>
  )
}

function XPCard({ xpInfo }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <div className="font-display font-bold text-sm text-primary">
            {xpInfo.current.emoji} Level {xpInfo.current.level} — {xpInfo.current.title}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {fmtNum(xpInfo.xpIntoLevel)} / {fmtNum(xpInfo.xpForNextLevel)} XP
          </div>
        </div>
        {xpInfo.next && (
          <Badge variant="accent">→ Lv.{xpInfo.current.level + 1} {xpInfo.next.title}</Badge>
        )}
      </div>
      <ProgressBar
        value={xpInfo.xpIntoLevel}
        max={xpInfo.xpForNextLevel}
        height={6}
        color="linear-gradient(90deg, var(--accent), var(--green))"
      />
      {!xpInfo.next && (
        <div className="text-xs font-medium text-center mt-2" style={{ color: 'var(--gold)' }}>
          👑 Maximum Level Reached!
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  if (!user) return (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-sm text-muted">Loading...</div>
  </div>
)

  const stats      = user.stats || {}
  const history    = user.history || []
  const xpInfo     = getLevelInfo(stats.totalXP || 0)
  const weakTopics = getWeakTopics(history, getAllCourses())
  const recent     = [...history].reverse().slice(0, 3)
  const hasInProgress = !!localStorage.getItem('qa_inProgressQuiz')
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary">
            {greeting}, {user.name.split(' ')[0]}! 👋
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}>
              Lv.{xpInfo.current.level} {xpInfo.current.title} {xpInfo.current.emoji}
            </span>
            {stats.streak > 0 && (
              <span className="text-xs text-secondary">🔥 {stats.streak}-day streak</span>
            )}
          </div>
        </div>
        <motion.button
          onClick={() => navigate('/play')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium flex-shrink-0"
          style={{
            background: isDailyChallengeCompleted(user) ? 'var(--green-dim)' : 'var(--accent-dim)',
            border:     `1px solid ${isDailyChallengeCompleted(user) ? 'rgba(77,255,195,.3)' : 'var(--accent-border)'}`,
            color:      isDailyChallengeCompleted(user) ? 'var(--green)' : 'var(--accent)',
          }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
        >
          {isDailyChallengeCompleted(user) ? '✅ Daily Done!' : '⭐ Daily Challenge'}
          {!isDailyChallengeCompleted(user) && (
            <span className="text-muted" style={{ fontSize: 10 }}>{getDailyCountdown()}</span>
          )}
        </motion.button>
      </div>

      {/* Recommendation */}
      {weakTopics.length > 0 && <RecommendBanner weakTopics={weakTopics} />}

      {/* Stats */}
      <StatsGrid stats={stats} history={history} />

      {/* XP */}
      <XPCard xpInfo={xpInfo} />

      {/* Chart */}
      <WeeklyChart history={history} />

      {/* Quick actions */}
      <QuickActions user={user} hasInProgress={hasInProgress} />

      {/* Recent activity */}
      {recent.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-sm text-primary">Recent Activity</h2>
            <button onClick={() => navigate('/history')}
              className="text-xs font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--accent)' }}>
              View all →
            </button>
          </div>
          {recent.map((entry, i) => <RecentItem key={i} entry={entry} />)}
        </div>
      )}

      {/* Empty state */}
      {!history.length && (
        <motion.div
          className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--bg1)', border: '1px dashed var(--border)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          <div className="text-4xl mb-3">🎓</div>
          <h3 className="font-display font-bold text-base text-primary mb-2">Ready to start learning?</h3>
          <p className="text-sm text-secondary mb-5 max-w-xs mx-auto">
            Take your first quiz to start earning XP, building your streak, and climbing the leaderboard.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <motion.button
              onClick={() => navigate('/categories')}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ background: 'linear-gradient(135deg,var(--accent),var(--green))' }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              Browse Courses →
            </motion.button>
            <motion.button
              onClick={() => navigate('/ai')}
              className="px-5 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t2)' }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              Try AI Generator 🤖
            </motion.button>
          </div>
        </motion.div>
      )}
    </PageWrapper>
  )
}