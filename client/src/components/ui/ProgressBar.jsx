export default function ProgressBar({ value = 0, max = 100, height = 4, color = 'var(--accent)', trackColor = 'var(--border)', className = '', animated = true }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={`rounded-full overflow-hidden ${className}`} style={{ height, background: trackColor }}>
      <div
        className="h-full rounded-full"
        style={{
          width:      `${pct}%`,
          background: color,
          transition: animated ? 'width 0.6s ease' : 'none',
        }}
      />
    </div>
  )
}
