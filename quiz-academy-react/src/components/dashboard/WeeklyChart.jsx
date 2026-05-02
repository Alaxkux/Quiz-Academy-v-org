import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { last7DaysData } from '../../utils/format'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs"
      style={{ background: 'var(--bg1)', border: '1px solid var(--border)', color: 'var(--t1)' }}
    >
      <div className="font-display font-bold mb-1">{label}</div>
      <div style={{ color: 'var(--accent)' }}>Score: {payload[0]?.value}%</div>
      <div style={{ color: 'var(--t3)' }}>Quizzes: {payload[0]?.payload?.quizzes}</div>
    </div>
  )
}

export default function WeeklyChart({ history = [] }) {
  const data = last7DaysData(history)
  const hasData = data.some(d => d.quizzes > 0)

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-sm text-primary">Weekly Performance</h3>
          <p className="text-xs text-muted">Average score per day this week</p>
        </div>
        {!hasData && (
          <span className="text-xs text-muted px-2 py-1 rounded-lg" style={{ background: 'var(--bg2)' }}>
            No data yet
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--accent)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: 'var(--t3)', fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: 'var(--t3)', fontFamily: 'DM Sans' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#scoreGrad)"
            dot={{ fill: 'var(--accent)', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: 'var(--accent)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
