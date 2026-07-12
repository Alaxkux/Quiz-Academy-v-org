import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, UserPlus, UserCheck, Clock, Users2, Bell, Compass, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { authApi } from '../../api/auth'
import { useScrollLock } from '../../components/ui/Modal'
import { getLevelInfo, calculateSmartAverage } from '../../data/levels'
import { fmtNum } from '../../utils/format'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import Avatar from '../../components/ui/Avatar'
import ProgressBar from '../../components/ui/ProgressBar'
import { SkeletonPage } from '../../components/ui/Skeleton'

const DECIDE_LATER_KEY = 'qa_decideLaterRequests' // sessionStorage — cleared on logout, same rule as the weak-topics banner

// ── Friend action button — reflects real relationship state ──
function FriendActionButton({ user, status, onAdd, onAccept, onRemove, onWave }) {
  if (status === 'friends') {
    return (
      <div className="flex gap-2 w-full">
        <button
          onClick={() => onWave(user)}
          title="Wave 👋"
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-transform hover:scale-105"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          👋
        </button>
        <button
          onClick={() => onRemove(user)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors"
          style={{ background: 'var(--green-dim)', border: '1px solid rgba(77,255,195,.25)', color: 'var(--green)' }}
        >
          <UserCheck size={13} /> Friends
        </button>
      </div>
    )
  }
  if (status === 'incoming') {
    return (
      <button
        onClick={() => onAccept(user)}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        <UserCheck size={13} /> Accept Request
      </button>
    )
  }
  if (status === 'pending') {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold opacity-70 cursor-default"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t3)' }}
      >
        <Clock size={13} /> Request Sent
      </button>
    )
  }
  return (
    <button
      onClick={() => onAdd(user)}
      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors"
      style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
    >
      <UserPlus size={13} /> Add Friend
    </button>
  )
}

// ── User profile popup — now with social context (mutual friends, shared courses) ──
function UserProfileModal({ user, isMe, status, onClose, onAdd, onAccept, onRemove, onWave }) {
  useScrollLock(!!user)
  const [social, setSocial] = useState(null) // { mutualFriendsCount, mutualFriendsPreview, sharedCourses }

  useEffect(() => {
    if (!user || isMe) return
    authApi.getPublicProfile(user._id).then(setSocial).catch(() => {})
  }, [user?._id])

  if (!user) return null
  const xpInfo = getLevelInfo(user.stats?.totalXP || 0)
  const avg    = user.history?.length ? calculateSmartAverage(user.history) : 0

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg1)', border: '1px solid var(--border)', maxHeight: '88vh', overflowY: 'auto' }}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{   opacity: 0, y: 40, scale: 0.96  }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="font-display font-bold text-sm text-primary">
              {isMe ? 'Your Profile' : 'User Profile'}
            </span>
            <button onClick={onClose} className="p-1 rounded-lg text-muted hover:text-primary transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Profile card */}
          <div className="p-5 flex flex-col items-center gap-3 text-center">
            <Avatar src={user.avatar} name={user.name} size="xl" />

            <div>
              <h2 className="font-display font-bold text-lg text-primary flex items-center gap-2 justify-center">
                {user.name}
                {isMe && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'var(--accent)', color: '#fff', fontSize: 9 }}>
                    You
                  </span>
                )}
              </h2>
              {user.bio && (
                <p className="text-sm text-secondary mt-1 max-w-xs">{user.bio}</p>
              )}
            </div>

            {/* Social proof — mutual friends + shared courses */}
            {!isMe && social && (social.mutualFriendsCount > 0 || social.sharedCourses?.length > 0) && (
              <div className="w-full flex flex-col gap-1.5">
                {social.mutualFriendsCount > 0 && (
                  <div className="flex items-center justify-center gap-2 text-xs text-secondary">
                    <div className="flex -space-x-2">
                      {social.mutualFriendsPreview.map(f => (
                        <div key={f._id} className="rounded-full ring-2" style={{ '--tw-ring-color': 'var(--bg1)' }}>
                          <Avatar src={f.avatar} name={f.name} size="xs" />
                        </div>
                      ))}
                    </div>
                    <span>{social.mutualFriendsCount} mutual friend{social.mutualFriendsCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {social.sharedCourses?.length > 0 && (
                  <div className="text-xs text-secondary">
                    Also studying <span className="text-primary font-medium">{social.sharedCourses.slice(0, 2).join(', ')}</span>
                    {social.sharedCourses.length > 2 && ` +${social.sharedCourses.length - 2} more`}
                  </div>
                )}
              </div>
            )}

            {/* Level badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
              <span>{xpInfo.current.emoji}</span>
              <span className="font-display font-bold text-sm" style={{ color: 'var(--accent)' }}>
                Level {xpInfo.current.level} — {xpInfo.current.title}
              </span>
            </div>

            {/* XP bar */}
            <div className="w-full">
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>{fmtNum(xpInfo.xpIntoLevel)} XP</span>
                <span>{xpInfo.next ? fmtNum(xpInfo.xpForNextLevel) + ' to next' : 'MAX'}</span>
              </div>
              <ProgressBar
                value={xpInfo.xpIntoLevel}
                max={xpInfo.xpForNextLevel}
                height={4}
                color="linear-gradient(90deg, var(--accent), var(--green))"
              />
            </div>

            {/* Public stats only */}
            <div className="grid grid-cols-3 gap-2 w-full">
              {[
                { label: 'Quizzes',  value: user.stats?.quizzesTaken || 0 },
                { label: 'Points',   value: fmtNum(user.stats?.totalPoints || 0) },
                { label: 'Avg Score', value: avg > 0 ? `${avg}%` : '—' },
              ].map(s => (
                <div key={s.label} className="rounded-xl py-2.5 text-center"
                  style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                  <div className="font-display font-bold text-base text-primary">{s.value}</div>
                  <div className="text-xs text-muted">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Join date — public info */}
            <p className="text-xs text-muted">
              Joined {new Date(user.joinDate || user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </p>

            {/* Friend action */}
            {!isMe && (
              <div className="w-full pt-1">
                <FriendActionButton user={user} status={status} onAdd={onAdd} onAccept={onAccept} onRemove={onRemove} onWave={onWave} />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

// ── Compact circular avatar for the top "close friends" row ──
function FriendAvatarChip({ friend, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{ width: 64 }}>
      <Avatar src={friend.avatar} name={friend.name} size="lg" />
      <span className="text-xs text-secondary truncate w-full text-center">{friend.name.split(' ')[0]}</span>
    </button>
  )
}

// ── Friend request card — Accept / Decide Later, matching the reference concept ──
function RequestCard({ request, onAccept, onDecideLater, index }) {
  return (
    <motion.div
      className="flex items-center gap-3 p-3.5 rounded-2xl"
      style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Avatar src={request.avatar} name={request.name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-primary truncate">{request.name}</div>
        <div className="text-xs text-muted">Wants to be friends</div>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button onClick={() => onAccept(request)}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-colors"
          style={{ background: 'var(--accent)' }}>
          Accept
        </button>
        <button onClick={() => onDecideLater(request)}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t2)' }}>
          Decide Later
        </button>
      </div>
    </motion.div>
  )
}

// ── Activity feed item ──
function ActivityItem({ event, index }) {
  const timeAgo = t => {
    const diff = Date.now() - new Date(t).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <motion.div
      className="flex items-center gap-3 py-2.5"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Avatar src={event.avatar} name={event.name} size="sm" />
      <div className="flex-1 min-w-0 text-sm">
        {event.type === 'quiz' ? (
          <span className="text-secondary">
            <span className="text-primary font-medium">{event.name}</span> scored {event.percentage}% on {event.category}
          </span>
        ) : (
          <span className="text-secondary">
            <span className="text-primary font-medium">{event.name}</span> hit a {event.streak}-day streak 🔥
          </span>
        )}
      </div>
      <span className="text-xs text-muted flex-shrink-0">{timeAgo(event.date)}</span>
    </motion.div>
  )
}

function UserCard({ user, isMe, status, index, onClick }) {
  const xpInfo = getLevelInfo(user.stats?.totalXP || 0)
  const avg    = user.history?.length ? calculateSmartAverage(user.history) : 0

  return (
    <motion.div
      className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer active:scale-[0.98] transition-transform"
      style={{
        background: isMe ? 'var(--accent-dim)' : 'var(--bg1)',
        border:     `1px solid ${isMe ? 'var(--accent-border)' : 'var(--border)'}`,
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
      onClick={onClick}
    >
      <Avatar src={user.avatar} name={user.name} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display font-semibold text-sm text-primary truncate">{user.name}</span>
          {isMe && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: 'var(--accent)', color: '#fff', fontSize: 9 }}>
              You
            </span>
          )}
          {!isMe && status === 'friends' && (
            <UserCheck size={12} style={{ color: 'var(--green)' }} />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}>
            Lv.{xpInfo.current.level} {xpInfo.current.title} {xpInfo.current.emoji}
          </span>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <div className="font-display font-bold text-sm text-primary">{fmtNum(user.stats?.totalPoints || 0)}</div>
        <div className="text-xs text-muted">{user.stats?.quizzesTaken || 0} quizzes</div>
        {avg > 0 && <div className="text-xs text-muted">{avg}% avg</div>}
      </div>
    </motion.div>
  )
}

export default function Users() {
  const { user: me }              = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [users,    setUsers]      = useState([])
  const [loading,  setLoading]    = useState(true)
  const [search,   setSearch]     = useState('')
  const [selected, setSelected]   = useState(null)
  const [tab,      setTab]        = useState('friends') // 'friends' | 'requests' | 'discover'
  const [activity, setActivity]   = useState([])

  // ── Friend relationship state ──
  const [friendIds, setFriendIds]     = useState(new Set())
  const [incomingIds, setIncomingIds] = useState(new Set())
  const [pendingIds, setPendingIds]   = useState(new Set())
  const [requestFrom, setRequestFrom] = useState({})
  const [requestList, setRequestList] = useState([]) // raw request objects for the Requests tab
  const [decidedLater, setDecidedLater] = useState(() => {
    try { return new Set(JSON.parse(sessionStorage.getItem(DECIDE_LATER_KEY) || '[]')) }
    catch { return new Set() }
  })

  function loadFriends() {
    authApi.getFriends()
      .then(d => {
        setFriendIds(new Set((d?.friends || []).map(f => f._id)))
        const incoming = d?.requests || []
        setIncomingIds(new Set(incoming.map(r => r.from)))
        setRequestFrom(Object.fromEntries(incoming.map(r => [r.from, r])))
        setRequestList(incoming)
      })
      .catch(() => {})
  }

  useEffect(() => {
    authApi.getLeaderboard()
      .then(data => setUsers(data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
    loadFriends()
    authApi.getFriendsActivity().then(d => setActivity(d?.events || [])).catch(() => {})
  }, [])

  // Deep-link support — clicking a friend notification lands here with
  // ?openProfile=<userId>, so open that person's card automatically.
  useEffect(() => {
    const openId = searchParams.get('openProfile')
    if (!openId || users.length === 0) return
    const target = users.find(u => u._id === openId)
    if (target) {
      setSelected(target)
      setSearchParams(prev => { prev.delete('openProfile'); return prev }, { replace: true })
    }
  }, [searchParams, users])

  function getStatus(u) {
    if (u.email === me?.email) return 'me'
    if (friendIds.has(u._id)) return 'friends'
    if (incomingIds.has(u._id)) return 'incoming'
    if (pendingIds.has(u._id)) return 'pending'
    return 'none'
  }

  async function handleAdd(u) {
    try {
      await authApi.sendFriendRequest(u._id)
      setPendingIds(prev => new Set(prev).add(u._id))
      toast.success(`Friend request sent to ${u.name}`)
    } catch (err) { toast.error(err.message) }
  }

  async function handleAccept(u) {
    const req = requestFrom[u._id] || u // RequestCard passes the raw request object directly
    try {
      await authApi.respondFriendRequest(req?.from || u._id, true)
      toast.success(`You and ${u.name || req.name} are now friends!`)
      loadFriends()
    } catch (err) { toast.error(err.message) }
  }

  function handleDecideLater(request) {
    const next = new Set(decidedLater).add(request.from)
    setDecidedLater(next)
    sessionStorage.setItem(DECIDE_LATER_KEY, JSON.stringify([...next]))
  }

  async function handleRemove(u) {
    try {
      await authApi.removeFriend(u._id)
      toast.success(`Removed ${u.name} from friends`)
      loadFriends()
    } catch (err) { toast.error(err.message) }
  }

  const waveCooldowns = useRef({})
  async function handleWave(u) {
    const last = waveCooldowns.current[u._id] || 0
    if (Date.now() - last < 60_000) {
      toast(`Already waved — try again in a bit`, { icon: '⏱️' })
      return
    }
    waveCooldowns.current[u._id] = Date.now()
    try {
      await authApi.sendToFriend(u._id, 'wave', {})
      toast.success(`👋 Waved at ${u.name}`)
    } catch (err) { toast.error(err.message) }
  }

  if (loading) return <PageWrapper><SkeletonPage /></PageWrapper>

  const myFriends = users.filter(u => friendIds.has(u._id))
  const visibleRequests = requestList.filter(r => !decidedLater.has(r.from))
  const discoverList = users.filter(u =>
    u.email !== me?.email &&
    (!search.trim() || u.name.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => (b.stats?.totalPoints || 0) - (a.stats?.totalPoints || 0))

  const TABS = [
    { id: 'friends',  label: 'Friends',  icon: Users2,  count: null },
    { id: 'requests', label: 'Requests', icon: Bell,    count: visibleRequests.length },
    { id: 'discover', label: 'Discover', icon: Compass, count: null },
  ]

  return (
    <PageWrapper>
      <PageHeader
        title="👥 Friends"
        subtitle={`${myFriends.length} friend${myFriends.length !== 1 ? 's' : ''} · ${users.length} learner${users.length !== 1 ? 's' : ''} on Quiz Academy`}
      />

      {/* ── Close-friends row — quick access, always visible ── */}
      {myFriends.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {myFriends.map(f => (
            <FriendAvatarChip key={f._id} friend={f} onClick={() => setSelected(f)} />
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1.5 p-1 rounded-2xl" style={{ background: 'var(--bg2)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all relative"
            style={{
              background: tab === t.id ? 'var(--bg1)' : 'transparent',
              color: tab === t.id ? 'var(--accent)' : 'var(--t3)',
              border: tab === t.id ? '1px solid var(--border)' : '1px solid transparent',
            }}>
            <t.icon size={14} />
            {t.label}
            {t.count > 0 && (
              <span className="flex items-center justify-center text-xs font-bold rounded-full flex-shrink-0"
                style={{ background: 'var(--red)', color: '#fff', minWidth: 16, height: 16, fontSize: 9, padding: '0 4px' }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── FRIENDS TAB ── */}
      {tab === 'friends' && (
        <div className="flex flex-col gap-4">
          {activity.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-muted">
                <Sparkles size={12} /> RECENT ACTIVITY
              </div>
              <div className="flex flex-col divide-y" style={{ '--tw-divide-opacity': 1, borderColor: 'var(--border)' }}>
                {activity.slice(0, 6).map((ev, i) => (
                  <ActivityItem key={i} event={ev} index={i} />
                ))}
              </div>
            </div>
          )}

          {myFriends.length === 0 ? (
            <div className="rounded-2xl p-12 text-center"
              style={{ background: 'var(--bg1)', border: '1px dashed var(--border)' }}>
              <div className="text-5xl mb-3">🤝</div>
              <h3 className="font-display font-bold text-base text-primary mb-2">No friends yet</h3>
              <p className="text-sm text-secondary mb-4">Head to Discover to find people to add.</p>
              <button onClick={() => setTab('discover')}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'var(--accent)' }}>
                Discover People
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {myFriends.map((u, i) => (
                <UserCard key={u._id} user={u} isMe={false} status="friends" index={i} onClick={() => setSelected(u)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── REQUESTS TAB ── */}
      {tab === 'requests' && (
        <div className="flex flex-col gap-2">
          {visibleRequests.length === 0 ? (
            <div className="rounded-2xl p-12 text-center"
              style={{ background: 'var(--bg1)', border: '1px dashed var(--border)' }}>
              <div className="text-5xl mb-3">📭</div>
              <h3 className="font-display font-bold text-base text-primary mb-2">No pending requests</h3>
              <p className="text-sm text-secondary">You're all caught up.</p>
            </div>
          ) : (
            visibleRequests.map((r, i) => (
              <RequestCard key={r.from} request={r} index={i}
                onAccept={handleAccept} onDecideLater={handleDecideLater} />
            ))
          )}
        </div>
      )}

      {/* ── DISCOVER TAB ── */}
      {tab === 'discover' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
            style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
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

          {discoverList.length === 0 ? (
            <div className="rounded-2xl p-12 text-center"
              style={{ background: 'var(--bg1)', border: '1px dashed var(--border)' }}>
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
              {discoverList.map((u, i) => (
                <UserCard key={u._id} user={u} isMe={false} status={getStatus(u)} index={i} onClick={() => setSelected(u)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile popup */}
      {selected && (
        <UserProfileModal
          user={selected}
          isMe={selected.email === me?.email}
          status={getStatus(selected)}
          onClose={() => setSelected(null)}
          onAdd={handleAdd}
          onAccept={handleAccept}
          onRemove={handleRemove}
          onWave={handleWave}
        />
      )}
    </PageWrapper>
  )
}
