import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const STATS_LEFT = [
  { emoji: '🔥', val: '12',  sub: 'day streak'  },
  { emoji: '⭐', val: '85%', sub: 'avg score'   },
  { emoji: '🏆', val: '#4',  sub: 'this week'   },
]

function AuthLeft({ quoteText, quoteAuthor }) {
  return (
    <div
      className="hidden md:flex flex-col justify-between relative overflow-hidden"
      style={{ width: '46%', flexShrink: 0, background: '#0C1018' }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(108,142,255,0.07) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />

      {/* Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: '#6C8EFF' }} />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: '#4DFFC3' }} />

      {/* Right border */}
      <div className="absolute right-0 top-0 bottom-0 w-px"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(108,142,255,0.3) 30%, rgba(108,142,255,0.3) 70%, transparent)' }} />

      {/* Brand */}
      <div className="relative flex items-center gap-3 p-10">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6C8EFF, #4DFFC3)' }}>Q</div>
        <div>
          <div className="font-bold text-base" style={{ color: '#EDF0FA' }}>Quiz Academy</div>
          <div className="text-xs" style={{ color: 'rgba(237,240,250,0.4)' }}>Learn. Level up. Lead.</div>
        </div>
      </div>

      {/* Centre content */}
      <div className="relative flex flex-col items-center justify-center flex-1 px-10 gap-5">
        <motion.div className="w-full max-w-xs"
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>

          {/* Daily challenge card */}
          <div className="rounded-2xl p-5 mb-4"
            style={{ background: 'rgba(7,9,14,0.9)', border: '1px solid rgba(108,142,255,0.2)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'rgba(108,142,255,0.1)', border: '1px solid rgba(108,142,255,0.2)' }}>🎯</div>
              <div>
                <div className="font-bold text-sm" style={{ color: '#EDF0FA' }}>Daily Challenge</div>
                <div className="text-xs" style={{ color: 'rgba(237,240,250,0.4)' }}>5 fresh questions every day</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #6C8EFF, #4DFFC3)' }}
                initial={{ width: 0 }} animate={{ width: '70%' }}
                transition={{ delay: 0.9, duration: 1.2, ease: 'easeOut' }} />
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'rgba(237,240,250,0.4)' }}>3/5 correct</span>
              <span style={{ color: '#4DFFC3', fontWeight: 600 }}>+150 XP</span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2.5">
            {STATS_LEFT.map(s => (
              <div key={s.sub} className="rounded-xl p-3 text-center"
                style={{ background: 'rgba(7,9,14,0.8)', border: '1px solid rgba(108,142,255,0.12)' }}>
                <div className="text-xl mb-1">{s.emoji}</div>
                <div className="font-black text-sm" style={{ color: '#EDF0FA' }}>{s.val}</div>
                <div style={{ color: 'rgba(237,240,250,0.35)', fontSize: 10 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Floating XP */}
          <motion.div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: 'linear-gradient(135deg,#4DFFC3,#6C8EFF)', color: '#07090E' }}
            animate={{ y: [0, -5, 0], rotate: [0, -1, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
            🎉 +250 XP earned this week
          </motion.div>
        </motion.div>
      </div>

      {/* Quote */}
      <div className="relative p-10">
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(7,9,14,0.8)', border: '1px solid rgba(108,142,255,0.15)', borderLeft: '3px solid #6C8EFF', backdropFilter: 'blur(10px)' }}>
          <p className="text-sm italic leading-relaxed mb-2" style={{ color: 'rgba(237,240,250,0.7)' }}>
            "{quoteText || 'The beautiful thing about learning is that no one can take it away from you.'}"
          </p>
          <p className="text-xs" style={{ color: 'rgba(237,240,250,0.35)' }}>— {quoteAuthor || 'B.B. King'}</p>
        </div>
      </div>
    </div>
  )
}

export default function AuthShell({ children, quote }) {
  return (
    <div className="flex min-h-screen" style={{ background: '#07090E' }}>
      <AuthLeft quoteText={quote?.text} quoteAuthor={quote?.author} />

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto relative"
        style={{ padding: 'clamp(1.5rem, 6vw, 5rem)' }}>

        {/* Subtle glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(ellipse, rgba(108,142,255,0.06) 0%, transparent 70%)' }} />
        </div>

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(108,142,255,0.04) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }} />

        <motion.div className="relative w-full" style={{ maxWidth: 440 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}>

          {/* Mobile brand */}
          <Link to="/" className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#6C8EFF,#4DFFC3)' }}>Q</div>
            <span className="font-bold text-base" style={{ color: '#EDF0FA' }}>Quiz Academy</span>
          </Link>

          {children}
        </motion.div>
      </div>
    </div>
  )
}
