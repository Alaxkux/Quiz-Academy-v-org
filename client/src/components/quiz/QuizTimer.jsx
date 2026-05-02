import { useEffect, useState, useRef } from 'react'

export default function QuizTimer({ seconds, onExpire, running = true }) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (!running || !seconds) return
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          onExpire?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, seconds])

  if (!seconds) return null

  const pct     = remaining / seconds
  const isWarn  = remaining <= 10
  const color   = isWarn ? 'var(--red)' : remaining <= seconds * 0.4 ? 'var(--gold)' : 'var(--accent)'
  const radius  = 16
  const circ    = 2 * Math.PI * radius
  const dash    = pct * circ

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <svg width="40" height="40" viewBox="0 0 40 40" className={isWarn ? 'animate-pulse' : ''}>
        <circle cx="20" cy="20" r={radius} fill="none" stroke="var(--border)" strokeWidth="3" />
        <circle
          cx="20" cy="20" r={radius} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 20 20)"
          style={{ transition: 'stroke-dasharray 1s linear' }}
        />
        <text
          x="20" y="20" textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fontWeight="700" fontFamily="Syne, sans-serif"
          fill={color}
        >
          {remaining}
        </text>
      </svg>
    </div>
  )
}

// Simple elapsed timer display (for overall quiz time)
export function ElapsedTimer({ elapsed }) {
  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  const isLong = elapsed > 120
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{
        background: isLong ? 'var(--red-dim)' : 'var(--gold-dim)',
        border:     `1px solid ${isLong ? 'rgba(255,107,138,.2)' : 'rgba(245,200,66,.2)'}`,
        color:      isLong ? 'var(--red)' : 'var(--gold)',
      }}
    >
      ⏱ {m}:{s < 10 ? '0' + s : s}
    </div>
  )
}
