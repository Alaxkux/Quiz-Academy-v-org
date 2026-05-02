import { motion } from 'framer-motion'
import { getLevelInfo } from '../../data/levels'
import Avatar from '../ui/Avatar'
import { fmtNum } from '../../utils/format'

const MEDALS  = ['🥇','🥈','🥉']
const HEIGHTS = [96, 64, 80]
const ORDERS  = [1, 0, 2] // display: 2nd, 1st, 3rd

export default function PodiumTop3({ users = [], pointsFn }) {
  if (!users.length) return null
  const top3 = users.slice(0, 3)

  return (
    <div className="flex items-end justify-center gap-4 pt-4 pb-2">
      {ORDERS.map(rank => {
        const user = top3[rank]
        if (!user) return <div key={rank} className="w-24" />
        const xpInfo  = getLevelInfo(user.stats?.totalXP || 0)
        const pts     = pointsFn ? pointsFn(user) : (user.stats?.totalPoints || 0)
        const isFirst = rank === 0

        return (
          <motion.div
            key={rank}
            className="flex flex-col items-center gap-2"
            style={{ width: 88 }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: rank * 0.12, type: 'spring', stiffness: 280 }}
          >
            <span className="text-2xl">{MEDALS[rank]}</span>

            <div className="relative">
              <Avatar src={user.avatar} name={user.name} size={isFirst ? 'lg' : 'md'} />
              {isFirst && (
                <motion.span
                  className="absolute -top-2 -right-1 text-base"
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                >
                  👑
                </motion.span>
              )}
            </div>

            <div className="text-center max-w-[88px]">
              <div className="font-display font-semibold text-xs text-primary truncate">{user.name}</div>
              <div className="text-xs text-muted" style={{ fontSize: 10 }}>{xpInfo.current.title}</div>
            </div>

            <div
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
            >
              {fmtNum(pts)}
            </div>

            {/* Podium block */}
            <div
              className="w-full rounded-t-xl flex items-center justify-center font-display font-black text-lg"
              style={{
                height:     HEIGHTS[rank],
                color:      '#fff',
                background: rank === 0
                  ? 'linear-gradient(135deg,#F5C842,#D4A017)'
                  : rank === 1
                    ? 'linear-gradient(135deg,#A0B0C0,#7890A8)'
                    : 'linear-gradient(135deg,#C87941,#9A5A28)',
                boxShadow: rank === 0 ? '0 4px 24px rgba(245,200,66,.35)' : undefined,
              }}
            >
              {rank + 1}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
