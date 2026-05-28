import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { isDailyChallengeCompleted, getTodayProgress } from '../../utils/gamification'

function ActionTile({ emoji, label, sub, onClick, accent, badge, delay = 0 }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-center w-full h-full transition-all relative"
      style={{
        background: 'var(--bg1)',
        border:     `1px solid ${accent ? 'var(--accent-border)' : 'var(--border)'}`,
        cursor:     'pointer',
        minHeight:  96,
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay, duration: 0.25 }}
      whileHover={{ y: -2, borderColor: 'var(--accent)' }}
      whileTap={{ scale: 0.97 }}
    >
      {badge && (
        <span
          className="absolute top-2 right-2 font-bold px-1.5 py-0.5 rounded-md"
          style={{ background: 'var(--red)', color: '#fff', fontSize: 9 }}
        >
          {badge}
        </span>
      )}

      <span className="text-2xl leading-none">{emoji}</span>

      <div className="font-display font-semibold text-xs text-primary leading-tight">{label}</div>
      {sub && (
        <div className="text-muted leading-tight" style={{ fontSize: 10 }}>{sub}</div>
      )}
    </motion.button>
  )
}

export default function QuickActions({ user, hasInProgress = false }) {
  const navigate  = useNavigate()
  const dailyDone = isDailyChallengeCompleted(user)
  const todayProg = getTodayProgress(user?.history || [], user?.settings?.dailyGoal || 2)

  const actions = [
    hasInProgress && {
      emoji: '▶️', label: 'Resume Quiz', sub: 'Continue where you left off',
      onClick: () => navigate('/quiz/active'), accent: true, delay: 0,
    },
    {
      emoji:   dailyDone ? '✅' : '⭐',
      label:   'Daily Challenge',
      sub:     dailyDone ? 'Completed!' : 'New challenge available',
      onClick: () => navigate('/play'),
      delay:   0.05,
    },
    {
      emoji: '📚', label: 'Browse Courses', sub: 'All categories',
      onClick: () => navigate('/categories'), delay: 0.1,
    },
    {
      emoji: '🎲', label: 'Quick Play', sub: 'Random mixed quiz',
      onClick: () => navigate('/play'), delay: 0.15,
    },
    {
      emoji: '💪', label: 'Weak Topics', sub: 'Practice what you missed',
      onClick: () => navigate('/play'), delay: 0.2,
    },
    {
      emoji: '📅',
      label: 'Study Planner',
      sub:   `${todayProg.done}/${todayProg.goal} today`,
      onClick: () => navigate('/planner'),
      delay:  0.25,
    },
    {
      emoji: '🔍', label: 'Review Mistakes', sub: 'Choose a course to review',
      onClick: () => navigate('/play?tab=review'), delay: 0.3,
    },
    {
      emoji: '🤖', label: 'AI Questions', sub: 'Generate with Gemini',
      onClick: () => navigate('/ai'), delay: 0.35, badge: 'New',
    },
    {
      emoji: '🏆', label: 'Leaderboard', sub: 'Global rankings',
      onClick: () => navigate('/leaderboard'), delay: 0.4,
    },
  ].filter(Boolean)

  return (
    <div>
      <h2 className="font-display font-semibold text-sm text-primary mb-3">Quick Actions</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
        {actions.map((a, i) => (
          <div key={i} className="relative">
            <ActionTile {...a} />
          </div>
        ))}
      </div>
    </div>
  )
}
