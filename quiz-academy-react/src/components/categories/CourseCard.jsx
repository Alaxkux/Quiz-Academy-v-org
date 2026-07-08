import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getCategoryMastery } from '../../utils/gamification'
import ProgressBar from '../ui/ProgressBar'

export default function CourseCard({ id, data, history = [], index = 0 }) {
  const navigate = useNavigate()
  const mastery  = getCategoryMastery(history, id)
  const attempts = history.filter(h => h.category === id)
  const best     = attempts.length ? Math.max(...attempts.map(h => h.percentage)) : null
  const isCustom = !!data.isCustom

  // Show real count: prefer array length (local quizData), fall back to numeric count (DB)
  const questionCount = Array.isArray(data.questions)
    ? data.questions.length
    : (typeof data.questions?.length === 'number' ? data.questions.length : 0)

  function handleClick() {
    // Pass both the fetch key (id/code) AND a human-readable display name —
    // QuizConfig needs `category` to look up questions, but should store the
    // *name* as the quiz's category so history/leaderboards don't show raw
    // codes like "AI_javascript_mr7ej7t6".
    const displayName = data.name || data.title || (id.startsWith('custom_') ? 'Custom Course' : id)
    navigate('/quiz/config', { state: { category: id, title: displayName } })
  }

  return (
    <motion.div
      className="rounded-2xl p-4 flex flex-col gap-3 cursor-pointer"
      style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      whileHover={{ y: -2, borderColor: 'var(--accent)' }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
    >
      {/* Icon + custom badge */}
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: data.color || 'var(--accent-dim)' }}
        >
          {data.icon}
        </div>
        {isCustom && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'var(--green-dim)', border: '1px solid rgba(77,255,195,.2)', color: 'var(--green)' }}
          >
            Custom
          </span>
        )}
      </div>

      {/* Course name + description */}
      <div className="flex-1">
        <h3 className="font-display font-semibold text-sm text-primary leading-tight mb-1">
          {data.name || data.title || (id.startsWith('custom_') ? 'Custom Course' : id)}
        </h3>
        <p className="text-xs text-secondary leading-snug line-clamp-2">
          {data.description}
        </p>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs px-2 py-0.5 rounded-lg"
          style={{ background: 'var(--bg2)', color: 'var(--t3)' }}
        >
          {questionCount} question{questionCount !== 1 ? 's' : ''}
        </span>
        {attempts.length > 0 && (
          <span
            className="text-xs px-2 py-0.5 rounded-lg"
            style={{ background: 'var(--bg2)', color: 'var(--t3)' }}
          >
            {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
          </span>
        )}
        {best !== null && (
          <span
            className="text-xs px-2 py-0.5 rounded-lg font-medium"
            style={{
              background: 'var(--bg2)',
              color: best >= 80 ? 'var(--green)' : best >= 60 ? 'var(--gold)' : 'var(--red)',
            }}
          >
            Best: {best}%
          </span>
        )}
      </div>

      {/* Mastery bar */}
      {mastery > 0 && (
        <div>
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Mastery</span>
            <span style={{ color: mastery >= 80 ? 'var(--green)' : mastery >= 60 ? 'var(--gold)' : 'var(--red)' }}>
              {mastery}%
            </span>
          </div>
          <ProgressBar
            value={mastery}
            max={100}
            height={4}
            color={mastery >= 80 ? 'var(--green)' : mastery >= 60 ? 'var(--gold)' : 'var(--red)'}
          />
        </div>
      )}

      {/* CTA */}
      <div
        className="w-full py-2 rounded-xl text-xs font-semibold text-center transition-all"
        style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
      >
        Start Quiz →
      </div>
    </motion.div>
  )
}
