import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// Left panel — branding + animated illustration
function AuthLeft({ title, subtitle, quoteText, quoteAuthor }) {
  return (
    <div
      className="hidden md:flex flex-col justify-between p-10 relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, var(--bg1) 0%, var(--bg2) 100%)',
        borderRight: '1px solid var(--border)',
        width: '42%',
        flexShrink: 0,
      }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, var(--accent-dim) 0%, transparent 70%)',
        }}
      />

      {/* Brand */}
      <div className="relative flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center font-display font-black text-lg text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--green))' }}
        >
          Q
        </div>
        <div>
          <div className="font-display font-bold text-base text-primary">Quiz Academy</div>
          <div className="text-xs text-muted">Learn. Level up. Lead.</div>
        </div>
      </div>

      {/* Centre illustration */}
      <div className="relative flex flex-col items-center justify-center gap-6 flex-1 py-10">
        {/* Animated stat cards */}
        <motion.div
          className="w-full max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Mini level card */}
          <div
            className="rounded-2xl p-4 mb-3"
            style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}
              >
                🎯
              </div>
              <div>
                <div className="font-display font-bold text-sm text-primary">Daily Challenge</div>
                <div className="text-xs text-muted">5 fresh questions every day</div>
              </div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--accent), var(--green))' }}
                initial={{ width: 0 }}
                animate={{ width: '70%' }}
                transition={{ delay: 0.8, duration: 1 }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted">
              <span>3/5 correct</span>
              <span>+150 XP</span>
            </div>
          </div>

          {/* Floating stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { emoji: '🔥', val: '12',   sub: 'day streak' },
              { emoji: '⭐', val: '85%',  sub: 'avg score'  },
              { emoji: '🏆', val: '#4',   sub: 'this week'  },
            ].map(s => (
              <div
                key={s.sub}
                className="rounded-xl p-3 text-center"
                style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
              >
                <div className="text-lg">{s.emoji}</div>
                <div className="font-display font-bold text-sm text-primary">{s.val}</div>
                <div className="text-xs text-muted" style={{ fontSize: 9 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quote */}
      <div className="relative">
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'var(--bg1)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--accent)',
          }}
        >
          <p className="text-sm italic leading-relaxed text-secondary mb-2">
            "{quoteText || 'The beautiful thing about learning is that no one can take it away from you.'}"
          </p>
          <p className="text-xs text-muted">— {quoteAuthor || 'B.B. King'}</p>
        </div>
      </div>
    </div>
  )
}

export default function AuthShell({ children, quote }) {
  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--bg0)' }}
    >
      <AuthLeft
        quoteText={quote?.text}
        quoteAuthor={quote?.author}
      />

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {/* Mobile brand */}
          <Link to="/" className="flex items-center gap-2 mb-8 md:hidden">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-sm text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--green))' }}
            >
              Q
            </div>
            <span className="font-display font-bold text-base text-primary">Quiz Academy</span>
          </Link>

          {children}
        </motion.div>
      </div>
    </div>
  )
}
