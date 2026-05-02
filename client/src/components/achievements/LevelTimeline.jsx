import { motion } from 'framer-motion'
import { LEVELS } from '../../data/levels'
import { fmtNum } from '../../utils/format'

export default function LevelTimeline({ currentLevel = 1, totalXP = 0 }) {
  return (
    <div className="flex flex-col gap-0">
      {LEVELS.map((lv, i) => {
        const isReached = currentLevel >= lv.level
        const isCurrent = currentLevel === lv.level
        const isNext    = lv.level === currentLevel + 1

        return (
          <motion.div
            key={lv.level}
            className="flex items-start gap-3 relative"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0  }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
          >
            {/* Vertical line */}
            {i < LEVELS.length - 1 && (
              <div
                className="absolute left-[19px] top-10 w-0.5 h-6"
                style={{ background: isReached ? 'var(--accent)' : 'var(--border)' }}
              />
            )}

            {/* Node */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0 relative z-10 transition-all"
              style={{
                background: isCurrent
                  ? 'linear-gradient(135deg,var(--accent),var(--green))'
                  : isReached
                    ? 'var(--green-dim)'
                    : 'var(--bg2)',
                border: isCurrent
                  ? '2px solid var(--accent)'
                  : isReached
                    ? '2px solid var(--green)'
                    : '2px solid var(--border)',
                boxShadow: isCurrent ? '0 0 16px var(--accent-border)' : undefined,
              }}
            >
              {lv.emoji}
            </div>

            {/* Info */}
            <div
              className="flex-1 py-2 mb-4 px-3 rounded-xl"
              style={{
                background: isCurrent ? 'var(--accent-dim)' : 'transparent',
                border:     isCurrent ? '1px solid var(--accent-border)' : '1px solid transparent',
                opacity:    !isReached && !isNext ? 0.45 : 1,
              }}
            >
              <div className="flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm text-primary">
                    Lv.{lv.level} — {lv.title}
                  </span>
                  {isCurrent && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--accent)', color: '#fff', fontSize: 9 }}
                    >
                      Current
                    </span>
                  )}
                  {isReached && !isCurrent && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(77,255,195,.2)', fontSize: 9 }}
                    >
                      ✓ Reached
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted">{fmtNum(lv.xpRequired)} XP</span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
