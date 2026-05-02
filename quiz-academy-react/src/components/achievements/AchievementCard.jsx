import { motion } from 'framer-motion'

export default function AchievementCard({ achievement, unlocked, index = 0 }) {
  return (
    <motion.div
      className="flex flex-col items-center text-center p-4 rounded-2xl gap-2.5 transition-all"
      style={{
        background: unlocked ? 'var(--gold-dim)' : 'var(--bg1)',
        border:     `1px solid ${unlocked ? 'rgba(245,200,66,.3)' : 'var(--border)'}`,
        opacity:    unlocked ? 1 : 0.45,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: unlocked ? 1 : 0.45, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.22 }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
        style={{
          background: unlocked ? 'var(--gold-dim)' : 'var(--bg2)',
          border:     `1px solid ${unlocked ? 'rgba(245,200,66,.3)' : 'var(--border)'}`,
          boxShadow:  unlocked ? '0 0 16px rgba(245,200,66,.2)' : undefined,
        }}
      >
        {achievement.icon}
      </div>

      <div className="font-display font-semibold text-xs text-primary leading-tight">
        {achievement.name}
      </div>

      <div className="text-xs text-secondary leading-snug">
        {achievement.desc}
      </div>

      <div
        className="text-xs px-2 py-0.5 rounded-full"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t3)' }}
      >
        {achievement.req}
      </div>

      {unlocked && (
        <div
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid rgba(245,200,66,.3)' }}
        >
          ✓ Unlocked
        </div>
      )}
    </motion.div>
  )
}
