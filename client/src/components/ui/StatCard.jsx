export default function StatCard({ label, value, sub, emoji, color = 'var(--accent)', borderColor }) {
  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background:  'var(--bg1)',
        border:      '1px solid var(--border)',
        borderTop:   `2px solid ${borderColor || color}`,
      }}
    >
      {emoji && <div className="text-2xl mb-2">{emoji}</div>}
      <div className="font-display font-black text-2xl mb-0.5" style={{ color }}>{value}</div>
      <div className="text-xs font-medium text-primary">{label}</div>
      {sub && <div className="text-xs text-muted mt-0.5">{sub}</div>}
    </div>
  )
}
