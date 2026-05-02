import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { getLevelInfo } from '../../data/levels'
import { ACHIEVEMENTS } from '../../data/achievements'
import { fmtNum } from '../../utils/format'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import AchievementCard from '../../components/achievements/AchievementCard'
import LevelTimeline from '../../components/achievements/LevelTimeline'
import ProgressBar from '../../components/ui/ProgressBar'

export default function Achievements() {
  const { user }      = useAuth()
  const [tab, setTab] = useState('achievements')

  const stats      = user?.stats || {}
  const unlocked   = user?.achievements || []
  const xpInfo     = getLevelInfo(stats.totalXP || 0)
  const unlockedCount = unlocked.length

  return (
    <PageWrapper>
      <PageHeader
        title="🏅 Achievements & Levels"
        subtitle={`${unlockedCount}/${ACHIEVEMENTS.length} achievements · Level ${xpInfo.current.level}`}
      />

      {/* XP progress card */}
      <motion.div
        className="rounded-2xl p-5"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <div className="font-display font-bold text-base text-primary">
              {xpInfo.current.emoji} Level {xpInfo.current.level} — {xpInfo.current.title}
            </div>
            <div className="text-xs text-muted mt-0.5">
              {fmtNum(stats.totalXP || 0)} XP total
            </div>
          </div>
          {xpInfo.next && (
            <div className="text-right">
              <div className="text-xs text-muted">{fmtNum(xpInfo.xpIntoLevel)} / {fmtNum(xpInfo.xpForNextLevel)} XP</div>
              <div className="text-xs text-secondary">→ Lv.{xpInfo.current.level + 1} {xpInfo.next.title}</div>
            </div>
          )}
        </div>
        <ProgressBar
          value={xpInfo.xpIntoLevel}
          max={xpInfo.xpForNextLevel}
          height={8}
          color="linear-gradient(90deg, var(--accent), var(--green))"
        />
        {!xpInfo.next && (
          <div className="text-xs font-bold text-center mt-2" style={{ color: 'var(--gold)' }}>
            👑 Maximum Level Reached — Transcendent!
          </div>
        )}
      </motion.div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {[
          { id: 'achievements', label: `🏅 Achievements (${unlockedCount}/${ACHIEVEMENTS.length})` },
          { id: 'levels',       label: '🎖️ Level Map' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: tab === t.id ? 'var(--bg1)'   : 'transparent',
              color:      tab === t.id ? 'var(--accent)' : 'var(--t3)',
              border:     tab === t.id ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Achievements grid */}
      {tab === 'achievements' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((ach, i) => (
            <AchievementCard
              key={ach.id}
              achievement={ach}
              unlocked={unlocked.includes(ach.id)}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Level timeline */}
      {tab === 'levels' && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
          <LevelTimeline
            currentLevel={xpInfo.current.level}
            totalXP={stats.totalXP || 0}
          />
        </div>
      )}
    </PageWrapper>
  )
}
