import { motion } from 'framer-motion'

export default function QuizOption({
  index, text, selected, correct, wrong,
  disabled, onClick, revealMode
}) {
  const isCBT = revealMode === 'after'

  // Determine visual state
  let borderColor = 'var(--border)'
  let bgColor     = 'var(--bg2)'
  let textColor   = 'var(--t2)'
  let keyBg       = 'var(--border)'
  let keyColor    = 'var(--t3)'

  if (selected && !disabled) {
    // Actively selected — not yet answered (or CBT mode)
    borderColor = 'var(--accent)'
    bgColor     = 'var(--accent-dim)'
    textColor   = 'var(--accent)'
    keyBg       = 'var(--accent)'
    keyColor    = '#fff'
  }

  if (disabled) {
    if (correct) {
      borderColor = 'var(--green)'
      bgColor     = 'var(--green-dim)'
      textColor   = 'var(--green)'
      keyBg       = 'var(--green)'
      keyColor    = '#0a1a12'
    } else if (wrong) {
      borderColor = 'var(--red)'
      bgColor     = 'var(--red-dim)'
      textColor   = 'var(--red)'
      keyBg       = 'var(--red)'
      keyColor    = '#fff'
    } else if (selected && isCBT) {
      // CBT mode — selected but no colour coding
      borderColor = 'var(--accent)'
      bgColor     = 'var(--accent-dim)'
      textColor   = 'var(--accent)'
      keyBg       = 'var(--accent)'
      keyColor    = '#fff'
    }
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled && !isCBT}
      className="flex items-center gap-3 w-full rounded-xl text-left transition-none"
      style={{
        padding:     '10px 14px',
        background:  bgColor,
        border:      `1px solid ${borderColor}`,
        color:       textColor,
        cursor:      disabled && !isCBT ? 'default' : 'pointer',
        // Fixed border-box so border never causes layout shift
        boxSizing:   'border-box',
      }}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
    >
      {/* Key label — A B C D */}
      <span
        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors"
        style={{ background: keyBg, color: keyColor }}
      >
        {String.fromCharCode(65 + index)}
      </span>

      {/* Option text */}
      <span className="text-sm flex-1 leading-snug">{text}</span>

      {/* Indicator mark — only in live mode */}
      {disabled && !isCBT && correct && (
        <span className="text-sm font-bold flex-shrink-0">✓</span>
      )}
      {disabled && !isCBT && wrong && (
        <span className="text-sm font-bold flex-shrink-0">✗</span>
      )}
    </motion.button>
  )
}
