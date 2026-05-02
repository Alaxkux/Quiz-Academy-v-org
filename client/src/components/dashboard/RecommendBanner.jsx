import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lightbulb, ArrowRight, X } from 'lucide-react'
import { useState } from 'react'
import { truncate } from '../../utils/format'

export default function RecommendBanner({ weakTopics = [] }) {
  const navigate   = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  if (!weakTopics.length || dismissed) return null

  const display = weakTopics.slice(0, 3)
  const extra   = weakTopics.length - 3

  return (
    <motion.div
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{
        background:  'var(--gold-dim)',
        border:      '1px solid rgba(245,200,66,0.25)',
        borderLeft:  '3px solid var(--gold)',
      }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0  }}
      exit={{   opacity: 0, y: -8  }}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--gold-dim)', border: '1px solid rgba(245,200,66,.3)' }}
      >
        <Lightbulb size={15} style={{ color: 'var(--gold)' }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--gold)' }}>
          Keep improving
        </div>
        <div className="text-xs text-secondary truncate">
          Below 60% in{' '}
          <span className="font-medium text-primary">
            {display.join(', ')}{extra > 0 ? ` +${extra} more` : ''}
          </span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate('/play')}
        className="flex items-center gap-1 text-xs font-semibold flex-shrink-0 transition-opacity hover:opacity-70"
        style={{ color: 'var(--gold)' }}
      >
        Practice <ArrowRight size={12} />
      </button>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 text-muted hover:text-primary transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}
