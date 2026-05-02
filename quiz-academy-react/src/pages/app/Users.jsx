import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { authApi } from '../../api/auth'
import { getLevelInfo, calculateSmartAverage } from '../../data/levels'
import { fmtNum } from '../../utils/format'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import Avatar from '../../components/ui/Avatar'
import { SkeletonPage } from '../../components/ui/Skeleton'

function UserCard({ user, isMe, index }) {
  const xpInfo = getLevelInfo(user.stats?.totalXP || 0)
  const avg    = user.history?.length ? calculateSmartAverage(user.history) : 0

  return (
    <motion.div
      className="flex items-center gap-3 p-4 rounded-2xl"
      style={{
        background: isMe ? 'var(--accent-dim)' : 'var(--bg1)',
        border:     `1px solid ${isMe ? 'var(--accent-border)' : 'var(--border)'}`,
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
    >
      <Avatar src={user.avatar} name={user.name} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display font-semibold text-sm text-primary truncate">
            {user.name}
          </span>
          {isMe && (
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'var(--accent)', color: '#fff', fontSize: 9 }}
            >
              You
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: 'var(--accent-dim)',
              border:     '1px solid var(--accent-border)',
              color:      'var(--accent)',
            }}
          >
            Lv.{xpInfo.current.level} {xpInfo.current.title} {xpInfo.current.emoji}
          </span>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="font-display font-bold text-sm text-primary">
          {fmtNum(user.stats?.totalPoints || 0)}
        </div>
        <div className="text-xs text-muted">{user.stats?.quizzesTaken || 0} quizzes</div>
        {avg > 0 && (
          <div className="text-xs text-muted">{avg}% avg</div>
        )}
      </div>
    </motion.div>
  )
}

export default function Users() {
  const { user: me }       = useAuth()
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    authApi.getLeaderboard()
      .then(data => setUsers(data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageWrapper><SkeletonPage /></PageWrapper>

  const filtered = users.filter(u =>
    !search.trim() ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  // Sort: me first, then by points
  const sorted = [...filtered].sort((a, b) => {
    if (a.email === me?.email) return -1
    if (b.email === me?.email) return 1
    return (b.stats?.totalPoints || 0) - (a.stats?.totalPoints || 0)
  })

  return (
    <PageWrapper>
      <PageHeader
        title="👥 Users"
        subtitle={`${users.length} learner${users.length !== 1 ? 's' : ''} registered`}
      />

      {/* Search */}
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
      >
        <Search size={14} style={{ color: 'var(--t3)', flexShrink: 0 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users by name..."
          className="bg-transparent text-sm outline-none flex-1"
          style={{ color: 'var(--t1)', fontFamily: 'DM Sans, sans-serif' }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-muted hover:text-primary transition-colors">
            Clear
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'var(--bg1)', border: '1px dashed var(--border)' }}
        >
          <div className="text-5xl mb-3">👤</div>
          <h3 className="font-display font-bold text-base text-primary mb-2">
            {search ? 'No users found' : 'No other users yet'}
          </h3>
          <p className="text-sm text-secondary">
            {search ? `No users match "${search}"` : 'Invite friends to join Quiz Academy!'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((u, i) => (
            <UserCard
              key={u._id || u.email}
              user={u}
              isMe={u.email === me?.email}
              index={i}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
