import { motion } from 'framer-motion'
import { getLevelInfo, calculateSmartAverage } from '../../data/levels'
import Avatar from '../ui/Avatar'
import { fmtNum } from '../../utils/format'

const MEDALS = ['🥇','🥈','🥉']

export default function LeaderRow({ user, rank, points, isMe, index = 0 }) {
  const xpInfo = getLevelInfo(user.stats?.totalXP || 0)
  const avg    = user.history?.length ? calculateSmartAverage(user.history) : 0
  const medal  = rank <= 3 ? MEDALS[rank - 1] : null

  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
      style={{
        background:  isMe ? 'var(--accent-dim)' : 'var(--bg1)',
        border:      `1px solid ${isMe ? 'var(--accent-border)' : 'var(--border)'}`,
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
    >
      {/* Rank */}
      <div
        className="w-8 text-center font-display font-bold flex-shrink-0"
        style={{ fontSize: medal ? 20 : 13, color: medal ? undefined : 'var(--t3)' }}
      >
        {medal || rank}
      </div>

      {/* Avatar */}
      <Avatar src={user.avatar} name={user.name} size="sm" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-display font-semibold text-sm text-primary truncate">{user.name}</span>
          {isMe && (
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'var(--accent)', color: '#fff', fontSize: 9 }}
            >
              You
            </span>
          )}
        </div>
        <div className="text-xs text-muted">
          Lv.{xpInfo.current.level} {xpInfo.current.title} · {user.stats?.quizzesTaken || 0} quizzes · {avg}% avg
        </div>
      </div>

      {/* Points */}
      <div className="text-right flex-shrink-0">
        <div className="font-display font-bold text-sm text-primary">{fmtNum(points)}</div>
        <div className="text-xs text-muted">pts</div>
      </div>
    </motion.div>
  )
}
