import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function AuthLeft({ quoteText, quoteAuthor }) {
  return (
    <div
      className="hidden md:flex flex-col justify-between relative overflow-hidden"
      style={{
        width: '48%',
        flexShrink: 0,
        background: 'linear-gradient(160deg, var(--bg1) 0%, var(--bg2) 100%)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--accent)' }} />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full blur-3xl opacity-15"
          style={{ background: 'var(--green)' }} />
      </div>

      {/* Brand */}
      <div className="relative flex items-center gap-3 p-10">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-display font-black text-lg text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--green))' }}>Q</div>
        <div>
          <div className="font-display font-bold text-base text-primary">Quiz Academy</div>
          <div className="text-xs text-muted">Learn. Level up. Lead.</div>
        </div>
      </div>

      {/* Centre illustration */}
      <div className="relative flex flex-col items-center justify-center flex-1 px-10">
        <motion.div className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>

          {/* Daily challenge card */}
          <div className="rounded-2xl p-5 mb-4 shadow-lg"
            style={{ background: 'var(--bg0)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>🎯</div>
              <div>
                <div className="font-display font-bold text-sm text-primary">Daily Challenge</div>
                <div className="text-xs text-muted">5 fresh questions every day</div>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: 'var(--border)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--accent), var(--green))' }}
                initial={{ width: 0 }} animate={{ width: '70%' }}
                transition={{ delay: 0.8, duration: 1.2 }} />
            </div>
            <div className="flex justify-between text-xs" style={{ color: 'var(--t3)' }}>
              <span>3/5 correct</span>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>+150 XP</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { emoji: '🔥', val: '12',  sub: 'day streak' },
              { emoji: '⭐', val: '85%', sub: 'avg score'  },
              { emoji: '🏆', val: '#4',  sub: 'this week'  },
            ].map(s => (
              <div key={s.sub} className="rounded-xl p-3 text-center shadow"
                style={{ background: 'var(--bg0)', border: '1px solid var(--border)' }}>
                <div className="text-xl mb-1">{s.emoji}</div>
                <div className="font-display font-bold text-sm text-primary">{s.val}</div>
                <div className="text-muted" style={{ fontSize: 10 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Floating XP badge */}
          <motion.div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold shadow"
            style={{ background: 'var(--green)', color: '#0a1a12' }}
            animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}>
            🎉 +250 XP this week
          </motion.div>
        </motion.div>
      </div>

      {/* Quote */}
      <div className="relative p-10">
        <div className="rounded-2xl p-5"
          style={{ background: 'var(--bg0)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)' }}>
          <p className="text-sm italic leading-relaxed mb-2" style={{ color: 'var(--t2)' }}>
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
    <div className="flex min-h-screen" style={{ background: 'var(--bg0)' }}>
      <AuthLeft quoteText={quote?.text} quoteAuthor={quote?.author} />

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto relative"
        style={{ padding: 'clamp(1.5rem, 5vw, 4rem)' }}>

        {/* Subtle background glow on right too */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-5"
            style={{ background: 'var(--accent)' }} />
        </div>

        <motion.div className="relative w-full"
          style={{ maxWidth: 440 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}>

          {/* Mobile brand */}
          <Link to="/" className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-sm text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--green))' }}>Q</div>
            <span className="font-display font-bold text-base text-primary">Quiz Academy</span>
          </Link>

          {children}
        </motion.div>
      </div>
    </div>
  )
}