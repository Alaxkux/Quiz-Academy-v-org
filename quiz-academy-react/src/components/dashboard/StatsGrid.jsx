import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { fmtNum } from '../../utils/format'

// Animated number counter
function CountUp({ target, duration = 1200 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    if (target === 0) return
    const steps = 40
    const step  = target / steps
    let current = 0
    const interval = setInterval(() => {
      current += step
      if (current >= target) { setVal(target); clearInterval(interval) }
      else setVal(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(interval)
  }, [target])

  return <span>{fmtNum(val)}</span>
}

const CARDS = [
  {
    key:     'quizzesTaken',
    label:   'Quizzes Taken',
    sub:     'All time',
    emoji:   '🎯',
    color:   'var(--accent)',
    border:  'var(--accent)',
  },
  {
    key:     'avgScore',
    label:   'Average Score',
    sub:     'Weighted recent',
    emoji:   '📈',
    color:   'var(--green)',
    border:  'var(--green)',
    suffix:  '%',
  },
  {
    key:     'totalPoints',
    label:   'Total Points',
    sub:     'Keep earning!',
    emoji:   '🏆',
    color:   'var(--gold)',
    border:  'var(--gold)',
  },
  {
    key:     'streak',
    label:   'Day Streak',
    sub:     '',
    emoji:   '🔥',
    color:   'var(--red)',
    border:  'var(--red)',
    dynamic: true,
  },
]

export default function StatsGrid({ stats = {}, history = [] }) {
  const values = {
    quizzesTaken: stats.quizzesTaken || 0,
    avgScore:     stats.weightedAvgScore || 0,
    totalPoints:  stats.totalPoints || 0,
    streak:       stats.streak || 0,
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {CARDS.map((card, i) => (
        <motion.div
          key={card.key}
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{
            background:  'var(--bg1)',
            border:      '1px solid var(--border)',
            borderTop:   `2px solid ${card.border}`,
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: i * 0.07, duration: 0.3 }}
        >
          {/* Background glow */}
          <div
            className="absolute top-0 right-0 w-16 h-16 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${card.color}15 0%, transparent 70%)`,
              transform:  'translate(20%, -20%)',
            }}
          />

          <div className="text-2xl mb-2">{card.emoji}</div>

          <div
            className="font-display font-black text-2xl mb-0.5"
            style={{ color: card.color }}
          >
            <CountUp target={values[card.key]} />
            {card.suffix}
          </div>

          <div className="text-xs font-medium text-primary">{card.label}</div>
          <div className="text-xs text-muted mt-0.5">
            {card.key === 'streak'
              ? (values.streak >= 7 ? 'On fire! 🔥' : values.streak >= 3 ? 'Keep it up!' : 'Start your streak')
              : card.sub
            }
          </div>
        </motion.div>
      ))}
    </div>
  )
}
