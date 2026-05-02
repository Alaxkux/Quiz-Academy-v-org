import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { scoreColor, scoreGrade, scoreEmoji, fmtNum } from '../../utils/format'
import PageWrapper from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'

// Animated count-up number
function CountUp({ target, suffix = '', duration = 1000, color }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return
    const steps = 30
    const step  = target / steps
    let   cur   = 0
    const timer = setInterval(() => {
      cur += step
      if (cur >= target) { setVal(target); clearInterval(timer) }
      else setVal(Math.floor(cur))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target])
  return (
    <span style={{ color }}>{fmtNum(val)}{suffix}</span>
  )
}

// Score circle
function ScoreCircle({ percentage }) {
  const color   = scoreColor(percentage)
  const radius  = 54
  const circ    = 2 * Math.PI * radius
  const [dash, setDash] = useState(0)

  useEffect(() => {
    setTimeout(() => setDash((percentage / 100) * circ), 200)
  }, [percentage])

  return (
    <div className="relative w-36 h-36 flex items-center justify-center mx-auto">
      <svg viewBox="0 0 128 128" className="absolute inset-0 w-full h-full -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle
          cx="64" cy="64" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s ease' }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="font-display font-black text-3xl" style={{ color }}>
          <CountUp target={percentage} suffix="%" color={color} />
        </div>
        <div className="text-xs text-muted">Score</div>
      </div>
    </div>
  )
}

// Achievement toast
function AchievementToast({ achievement }) {
  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: 'var(--gold-dim)',
        border:     '1px solid rgba(245,200,66,.3)',
      }}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1,   y: 0  }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <span className="text-2xl">{achievement.icon}</span>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--gold)' }}>
          Achievement Unlocked
        </div>
        <div className="font-display font-semibold text-sm text-primary">{achievement.name}</div>
        <div className="text-xs text-secondary">{achievement.desc}</div>
      </div>
    </motion.div>
  )
}

export default function Results() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user }  = useAuth()
  const { result, newAchievements = [] } = location.state || {}

  useEffect(() => {
    if (!result) navigate('/dashboard', { replace: true })
  }, [result])

  if (!result) return null

  const { percentage, score, total, points, xpEarned, timeTaken, category, isDailyChallenge, revealMode } = result

  const grade  = scoreGrade(percentage)
  const emoji  = scoreEmoji(percentage)
  const color  = scoreColor(percentage)

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto w-full flex flex-col gap-5">

        {/* Emoji + Grade */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-6xl mb-2">{emoji}</div>
          <h1 className="font-display font-black text-3xl text-primary">{grade}</h1>
          <p className="text-secondary text-sm mt-1">
            You scored on <strong style={{ color: 'var(--accent)' }}>{category}</strong>
          </p>
          {isDailyChallenge && (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mt-2"
              style={{ background: 'var(--gold-dim)', border: '1px solid rgba(245,200,66,.3)', color: 'var(--gold)' }}
            >
              ⭐ Daily Challenge Completed!
            </span>
          )}
        </motion.div>

        {/* Score circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1  }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
        >
          <ScoreCircle percentage={percentage} />
        </motion.div>

        {/* Stats grid — 2x2 */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.3 }}
        >
          {[
            { label: 'Correct',  value: `${score}/${total}`, color: 'var(--t1)'    },
            { label: 'Points',   value: points,  suffix: '',   color: 'var(--green)' },
            { label: 'XP Earned',value: xpEarned, suffix: '',  color: 'var(--accent)'},
            { label: 'Time',     value: timeTaken, raw: true,  color: 'var(--gold)'  },
          ].map((s, i) => (
            <div
              key={s.label}
              className="rounded-2xl p-4 text-center"
              style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
            >
              <div className="font-display font-black text-xl mb-0.5" style={{ color: s.color }}>
                {s.raw
                  ? s.value
                  : typeof s.value === 'number'
                    ? <CountUp target={s.value} suffix={s.suffix || ''} color={s.color} delay={i * 100} />
                    : s.value
                }
              </div>
              <div className="text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* New achievements */}
        {newAchievements.length > 0 && (
          <div className="flex flex-col gap-2">
            {newAchievements.map((ach, i) => (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.2 }}
              >
                <AchievementToast achievement={ach} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Actions */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.5 }}
        >
          {result.questionData?.length > 0 && (
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/quiz/review', { state: { result } })}
            >
              📋 Review Answers
            </Button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/categories')}
            >
              Try Another
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
