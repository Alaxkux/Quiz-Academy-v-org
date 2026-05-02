import { motion } from 'framer-motion'

export default function ConfigCard({ icon, label, children, delay = 0 }) {
  return (
    <motion.div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.22 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="font-display font-semibold text-sm text-primary">{label}</span>
      </div>
      {children}
    </motion.div>
  )
}

// Toggle option button — styled pill
export function ConfigOption({ label, sub, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start px-3 py-2 rounded-xl text-left transition-all"
      style={{
        background:   selected ? 'var(--accent-dim)' : 'var(--bg2)',
        border:       `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        color:        selected ? 'var(--accent)' : 'var(--t2)',
        fontWeight:   selected ? 600 : 400,
      }}
    >
      <span className="text-sm">{label}</span>
      {sub && (
        <span className="text-xs mt-0.5" style={{ color: selected ? 'var(--accent)' : 'var(--t3)', opacity: 0.8 }}>
          {sub}
        </span>
      )}
    </button>
  )
}
