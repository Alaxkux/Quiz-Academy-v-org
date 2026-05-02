export default function QuizProgress({ current, total, category }) {
  const pct = ((current + 1) / total) * 100
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted truncate max-w-[180px]">{category}</span>
        <span className="font-medium text-secondary flex-shrink-0">
          Q{current + 1} <span className="text-muted">/ {total}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg,var(--accent),var(--green))' }}
        />
      </div>
      {/* Dot trail */}
      <div className="flex gap-1 justify-center flex-wrap">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width:      i < current ? 6 : i === current ? 8 : 5,
              height:     i < current ? 6 : i === current ? 8 : 5,
              background: i < current ? 'var(--green)' : i === current ? 'var(--accent)' : 'var(--border)',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}
