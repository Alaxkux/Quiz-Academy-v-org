import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { authApi } from '../../api/auth'
import { weeklyPoints } from '../../utils/format'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import PodiumTop3 from '../../components/leaderboard/PodiumTop3'
import LeaderRow from '../../components/leaderboard/LeaderRow'
import { SkeletonPage } from '../../components/ui/Skeleton'

export default function Leaderboard() {
  const { user }       = useAuth()
  const [allUsers, setAllUsers] = useState([])
  const [tab,      setTab]      = useState('alltime')
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    authApi.getLeaderboard()
      .then(data => setAllUsers(data.users || []))
      .catch(() => setAllUsers([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageWrapper><SkeletonPage /></PageWrapper>

  const sorted = [...allUsers].sort((a, b) =>
    tab === 'alltime'
      ? (b.stats?.totalPoints || 0) - (a.stats?.totalPoints || 0)
      : weeklyPoints(b.history || []) - weeklyPoints(a.history || [])
  )

  const pointsFn = tab === 'alltime'
    ? u => u.stats?.totalPoints  || 0
    : u => weeklyPoints(u.history || [])

  const myRank = sorted.findIndex(u => u.email === user?.email) + 1

  return (
    <PageWrapper>
      <PageHeader
        title="🏆 Leaderboard"
        subtitle={`${allUsers.length} learner${allUsers.length !== 1 ? 's' : ''} competing`}
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {[{ id:'alltime', label:'All Time' },{ id:'weekly', label:'This Week' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t.id ? 'var(--bg1)'    : 'transparent',
              color:      tab === t.id ? 'var(--accent)'  : 'var(--t3)',
              border:     tab === t.id ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="font-display font-bold text-base text-primary mb-2">No rankings yet</h3>
          <p className="text-sm text-secondary">Complete a quiz to appear on the leaderboard!</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {sorted.length >= 2 && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
              <PodiumTop3 users={sorted} pointsFn={pointsFn} />
            </div>
          )}

          {/* Rows for 4th+ */}
          {sorted.length > 3 && (
            <div className="flex flex-col gap-2">
              {sorted.slice(3).map((u, i) => (
                <LeaderRow key={u._id || u.email} user={u} rank={i+4}
                  points={pointsFn(u)} isMe={u.email === user?.email} index={i} />
              ))}
            </div>
          )}

          {/* If only 1-3 users, show rows instead of podium rows */}
          {sorted.length <= 3 && (
            <div className="flex flex-col gap-2">
              {sorted.map((u, i) => (
                <LeaderRow key={u._id || u.email} user={u} rank={i+1}
                  points={pointsFn(u)} isMe={u.email === user?.email} index={i} />
              ))}
            </div>
          )}

          {/* Pinned my rank if outside top 10 */}
          {myRank > 10 && (
            <motion.div className="rounded-2xl p-3"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-xs text-center text-secondary mb-2">Your ranking</p>
              <LeaderRow user={user} rank={myRank} points={pointsFn(user)} isMe={true} />
            </motion.div>
          )}
        </>
      )}
    </PageWrapper>
  )
}
