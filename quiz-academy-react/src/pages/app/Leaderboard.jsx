import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { authApi } from '../../api/auth'
import { weeklyPoints } from '../../utils/format'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import PodiumTop3 from '../../components/leaderboard/PodiumTop3'
import LeaderRow from '../../components/leaderboard/LeaderRow'
import { SkeletonPage } from '../../components/ui/Skeleton'
import Button from '../../components/ui/Button'

export default function Leaderboard() {
  const { user }       = useAuth()
  const [allUsers, setAllUsers] = useState([])
  const [tab,      setTab]      = useState('alltime')
  const [scope,    setScope]    = useState('all') // 'all' | 'friends'
  const [loading,  setLoading]  = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchLeaderboard = useCallback(async (s = scope) => {
    try {
      const data = await authApi.getLeaderboard(s)
      setAllUsers(data.users || [])
    } catch {
      setAllUsers([])
    }
  }, [scope])

  useEffect(() => {
    setLoading(true)
    fetchLeaderboard(scope).finally(() => setLoading(false))
  }, [scope])

  async function handleRefresh() {
    setRefreshing(true)
    await fetchLeaderboard(scope)
    setRefreshing(false)
  }

  if (loading) return <PageWrapper><SkeletonPage /></PageWrapper>

  const sorted = [...allUsers].sort((a, b) =>
    tab === 'alltime'
      ? (b.stats?.totalPoints || 0) - (a.stats?.totalPoints || 0)
      : (b.stats?.totalPoints || 0) - (a.stats?.totalPoints || 0) // weekly fallback (history stripped server-side)
  )

  const pointsFn = u => u.stats?.totalPoints || 0
  const myRank   = sorted.findIndex(u => u.email === user?.email) + 1

  return (
    <PageWrapper>
      <PageHeader
        title="🏆 Leaderboard"
        subtitle={`${allUsers.length} learner${allUsers.length !== 1 ? 's' : ''} competing`}
        action={
          <Button variant="ghost" size="sm" onClick={handleRefresh} loading={refreshing}>
            <RefreshCw size={14} /> Refresh
          </Button>
        }
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

      {/* Scope — everyone vs friends only */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {[{ id:'all', label:'🌍 Everyone' },{ id:'friends', label:'🤝 Friends' }].map(s => (
          <button key={s.id} onClick={() => setScope(s.id)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: scope === s.id ? 'var(--bg1)'    : 'transparent',
              color:      scope === s.id ? 'var(--accent)'  : 'var(--t3)',
              border:     scope === s.id ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
          <div className="text-5xl mb-3">🏆</div>
          <h3 className="font-display font-bold text-base text-primary mb-2">
            {scope === 'friends' ? 'No friends on the board yet' : 'No rankings yet'}
          </h3>
          <p className="text-sm text-secondary">
            {scope === 'friends' ? 'Add some friends to compare scores here.' : 'Complete a quiz to appear on the leaderboard!'}
          </p>
        </div>
      ) : (
        <>
          {sorted.length >= 2 && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
              <PodiumTop3 users={sorted} pointsFn={pointsFn} />
            </div>
          )}

          {sorted.length > 3 && (
            <div className="flex flex-col gap-2">
              {sorted.slice(3).map((u, i) => (
                <LeaderRow key={u._id || u.email} user={u} rank={i+4}
                  points={pointsFn(u)} isMe={u.email === user?.email} index={i} />
              ))}
            </div>
          )}

          {sorted.length <= 3 && (
            <div className="flex flex-col gap-2">
              {sorted.map((u, i) => (
                <LeaderRow key={u._id || u.email} user={u} rank={i+1}
                  points={pointsFn(u)} isMe={u.email === user?.email} index={i} />
              ))}
            </div>
          )}

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
