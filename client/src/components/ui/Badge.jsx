const variants = {
  accent:  { background: 'var(--accent-dim)',  border: '1px solid var(--accent-border)', color: 'var(--accent)' },
  green:   { background: 'var(--green-dim)',   border: '1px solid rgba(77,255,195,.2)',   color: 'var(--green)' },
  gold:    { background: 'var(--gold-dim)',    border: '1px solid rgba(245,200,66,.2)',   color: 'var(--gold)' },
  red:     { background: 'var(--red-dim)',     border: '1px solid rgba(255,107,138,.2)',  color: 'var(--red)' },
  muted:   { background: 'var(--bg2)',         border: '1px solid var(--border)',         color: 'var(--t3)' },
}

export default function Badge({ variant = 'accent', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={variants[variant] || variants.accent}
    >
      {children}
    </span>
  )
}
