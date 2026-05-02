export default function Card({ children, className = '', hover = false, onClick, style }) {
  const base = 'rounded-2xl border transition-all'
  const hoverClass = hover ? 'cursor-pointer hover:-translate-y-0.5 hover:border-[var(--border2)]' : ''
  return (
    <div
      className={`${base} ${hoverClass} ${className}`}
      style={{ background: 'var(--bg1)', borderColor: 'var(--border)', ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
