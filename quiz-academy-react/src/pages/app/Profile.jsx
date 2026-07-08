import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Save, UserPlus, Send, Trophy, Search, UserCheck, UserX, Share2, Bell } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { getLevelInfo } from '../../data/levels'
import { fmtNum } from '../../utils/format'
import { authApi } from '../../api/auth'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import ProgressBar from '../../components/ui/ProgressBar'
import { SamsungConfirm } from '../../components/ui/SamsungPopup'

function FriendCard({ friend, onRemove, onSendQuiz, onSendAchievement }) {
  const lvl = getLevelInfo(friend.stats?.totalXP || 0)
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl transition-all"
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
      <Avatar src={friend.avatar} name={friend.name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-primary truncate">{friend.name}</div>
        <div className="text-xs text-muted">Lv.{lvl.level} · {fmtNum(friend.stats?.totalPoints || 0)} pts</div>
      </div>
      <div className="flex gap-1.5">
        <button onClick={() => onSendQuiz(friend)} title="Send Quiz"
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-muted hover:text-accent"
          style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
          <Send size={13} />
        </button>
        <button onClick={() => onSendAchievement(friend)} title="Share Achievement"
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-muted hover:text-gold"
          style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
          <Trophy size={13} />
        </button>
        <button onClick={() => onRemove(friend)} title="Remove Friend"
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-muted hover:text-red"
          style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
          <UserX size={13} />
        </button>
      </div>
    </div>
  )
}

function RequestCard({ req, onAccept, onDecline }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl"
      style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
      <Avatar src={req.avatar} name={req.name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-primary truncate">{req.name}</div>
        <div className="text-xs text-muted">Wants to be friends</div>
      </div>
      <div className="flex gap-1.5">
        <button onClick={() => onAccept(req)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
          style={{ background: 'var(--green)' }}>Accept</button>
        <button onClick={() => onDecline(req)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t3)' }}>Decline</button>
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, updateUser, addNotification } = useAuth()
  const fileRef = useRef(null)
  const [tab, setTab] = useState('profile') // 'profile' | 'friends' | 'activity'
  const [name,   setName]   = useState(user?.name || '')
  const [bio,    setBio]    = useState(user?.bio  || '')
  const [saving, setSaving] = useState(false)
  const [pendingAvatar, setPendingAvatar] = useState(null)
  const [showAvatarConfirm, setShowAvatarConfirm] = useState(false)
  const [friends, setFriends]   = useState([])
  const [requests, setRequests] = useState([])
  const [searchQ,  setSearchQ]  = useState('')
  const [searchRes, setSearchRes] = useState([])
  const [searching, setSearching] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(null)

  const stats  = user?.stats || {}
  const xpInfo = getLevelInfo(stats.totalXP || 0)

  useEffect(() => {
    authApi.getFriends?.().then(d => {
      setFriends(d?.friends || [])
      setRequests(d?.requests || [])
    }).catch(() => {})
  }, [])

  async function searchUsers(q) {
    if (!q || q.length < 2) { setSearchRes([]); return }
    setSearching(true)
    try {
      const d = await authApi.searchUsers(q)
      setSearchRes(d?.users || [])
    } finally { setSearching(false) }
  }

  async function sendFriendRequest(targetId) {
    try {
      await authApi.sendFriendRequest(targetId)
      toast.success('Friend request sent!')
      addNotification('👋 Friend request sent', 'info')
      setSearchRes(prev => prev.filter(u => u._id !== targetId))
    } catch (err) { toast.error(err.message) }
  }

  async function respondToRequest(req, accept) {
    try {
      await authApi.respondFriendRequest(req.from, accept)
      setRequests(prev => prev.filter(r => r.from !== req.from))
      if (accept) {
        toast.success(`You and ${req.name} are now friends!`)
        authApi.getFriends?.().then(d => setFriends(d?.friends || []))
      }
    } catch (err) { toast.error(err.message) }
  }

  async function removeFriend(friend) {
    try {
      await authApi.removeFriend(friend._id)
      setFriends(prev => prev.filter(f => f._id !== friend._id))
      toast.success('Friend removed')
      setConfirmRemove(null)
    } catch (err) { toast.error(err.message) }
  }

  async function sendToFriend(friend, type) {
    try {
      const recentHistory = (user?.history || []).slice(-1)[0]
      await authApi.sendToFriend(friend._id, type, {
        score:    recentHistory?.percentage,
        category: recentHistory?.category,
        points:   recentHistory?.points,
      })
      toast.success(`Sent to ${friend.name}!`)
      addNotification(`📤 Sent ${type} to ${friend.name}`, 'success')
    } catch (err) { toast.error(err.message) }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image too large (max 5MB)'); return }
    const reader = new FileReader()
    reader.onload = ev => setPendingAvatar(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function confirmSaveAvatar() {
    updateUser({ avatar: pendingAvatar })
    setPendingAvatar(null)
    setShowAvatarConfirm(false)
    toast.success('Profile picture updated ✓')
    addNotification('🖼️ Profile picture updated', 'success')
  }

  function handleSaveProfile() {
    if (name.trim().length < 2) { toast.error('Name too short'); return }
    setSaving(true)
    updateUser({ name: name.trim(), bio: bio.trim() })
    setTimeout(() => {
      setSaving(false)
      toast.success('Profile saved ✓')
      addNotification('👤 Profile saved', 'success')
    }, 600)
  }

  const TABS = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'friends', label: `👥 Friends${friends.length ? ` (${friends.length})` : ''}` },
    { id: 'activity', label: '📊 Activity' },
  ]

  return (
    <PageWrapper>
      <PageHeader title="My Profile" subtitle={`@${user?.name?.toLowerCase().replace(/\s+/g,'') || 'user'}`} />

      {/* Profile card */}
      <motion.div className="rounded-3xl overflow-hidden"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

        {/* Banner */}
        <div className="h-24 w-full" style={{ background: 'linear-gradient(135deg,var(--accent),var(--green))' }} />

        <div className="px-6 pb-6">
          {/* Avatar — centered, overlapping the banner seam */}
          <div className="flex flex-col items-center -mt-12 mb-5">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl overflow-hidden ring-4" style={{ '--tw-ring-color': 'var(--bg1)' }}>
                <Avatar src={pendingAvatar || user?.avatar} name={user?.name || 'User'} size="xl" />
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--accent)', border: '2px solid var(--bg1)' }}>
                <Camera size={13} color="#fff" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
            {pendingAvatar && (
              <Button variant="primary" size="sm" onClick={() => setShowAvatarConfirm(true)} className="mt-3">
                <Save size={12} /> Save Photo
              </Button>
            )}
          </div>

          {/* Everything below the avatar shares one consistent vertical rhythm */}
          <div className="flex flex-col items-center text-center gap-5">
            <div>
              <h2 className="font-display font-black text-xl text-primary">{user?.name}</h2>
              <p className="text-sm text-muted mt-1">{user?.email}</p>
              {user?.bio && <p className="text-sm text-secondary mt-2 max-w-xs mx-auto">{user.bio}</p>}
            </div>

            {/* Level badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full"
              style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
              <span>{xpInfo.current.emoji}</span>
              <span className="font-display font-bold text-sm" style={{ color: 'var(--accent)' }}>
                Level {xpInfo.current.level} — {xpInfo.current.title}
              </span>
            </div>

            {/* XP bar */}
            <div className="w-full">
              <div className="flex justify-between text-xs text-muted mb-1.5">
                <span>{fmtNum(xpInfo.xpIntoLevel)} XP</span>
                <span>{xpInfo.next ? `${fmtNum(xpInfo.xpForNextLevel)} to next` : 'MAX LEVEL'}</span>
              </div>
              <ProgressBar value={xpInfo.xpIntoLevel} max={xpInfo.xpForNextLevel} height={6}
                color="linear-gradient(90deg,var(--accent),var(--green))" />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2.5 w-full">
              {[
                { label: 'Quizzes',  value: stats.quizzesTaken   || 0 },
                { label: 'Points',   value: fmtNum(stats.totalPoints || 0) },
                { label: 'Streak',   value: `${stats.streak || 0}🔥` },
                { label: 'Friends',  value: friends.length },
              ].map(s => (
                <div key={s.label} className="rounded-2xl py-3.5 text-center"
                  style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                  <div className="font-display font-black text-lg text-primary">{s.value}</div>
                  <div className="text-xs text-muted mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted">
              Member since {new Date(user?.joinDate || user?.createdAt || Date.now()).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === t.id ? 'var(--bg1)' : 'transparent',
              color:      tab === t.id ? 'var(--accent)' : 'var(--t3)',
              border:     tab === t.id ? '1px solid var(--border)' : '1px solid transparent',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Profile edit */}
      <AnimatePresence mode="wait">
        {tab === 'profile' && (
          <motion.div key="profile" className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="rounded-2xl p-5 flex flex-col gap-4"
              style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
              <h3 className="font-display font-bold text-base text-primary">Edit Profile</h3>
              {[
                { label: 'Full Name', val: name, set: setName, ph: 'Your name', max: 60 },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} maxLength={f.max} placeholder={f.ph}
                    className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all"
                    style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)', fontSize: 16 }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              ))}
              <div>
                <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">Email (read only)</label>
                <input value={user?.email || ''} disabled className="w-full px-4 py-3 rounded-xl text-base opacity-40"
                  style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)', fontSize: 16 }} />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={300} rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-3 rounded-xl text-base outline-none resize-none transition-all"
                  style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)', fontSize: 16, fontFamily: 'DM Sans' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <div className="text-xs text-muted text-right mt-0.5">{bio.length}/300</div>
              </div>
              <Button variant="primary" size="lg" loading={saving} onClick={handleSaveProfile} className="w-full">
                Save Changes
              </Button>
            </div>
          </motion.div>
        )}

        {/* Tab: Friends */}
        {tab === 'friends' && (
          <motion.div key="friends" className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Friend requests */}
            {requests.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="font-display font-semibold text-sm text-primary flex items-center gap-2">
                  <Bell size={14} style={{ color: 'var(--accent)' }} /> Requests ({requests.length})
                </h3>
                {requests.map(r => (
                  <RequestCard key={r.from} req={r}
                    onAccept={() => respondToRequest(r, true)}
                    onDecline={() => respondToRequest(r, false)} />
                ))}
              </div>
            )}

            {/* Search */}
            <div className="rounded-2xl p-4 flex flex-col gap-3"
              style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
              <h3 className="font-display font-semibold text-sm text-primary">Find Friends</h3>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--t3)' }} />
                <input value={searchQ}
                  onChange={e => { setSearchQ(e.target.value); searchUsers(e.target.value) }}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)', fontSize: 16 }} />
              </div>
              {searchRes.length > 0 && (
                <div className="flex flex-col gap-2">
                  {searchRes.map(u => (
                    <div key={u._id} className="flex items-center gap-3 p-2.5 rounded-xl"
                      style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                      <Avatar src={u.avatar} name={u.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-primary truncate">{u.name}</div>
                        <div className="text-xs text-muted">{fmtNum(u.stats?.totalPoints || 0)} pts</div>
                      </div>
                      <button onClick={() => sendFriendRequest(u._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                        style={{ background: 'var(--accent)' }}>
                        <UserPlus size={12} /> Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Friends list */}
            {friends.length > 0 ? (
              <div className="flex flex-col gap-2">
                <h3 className="font-display font-semibold text-sm text-primary">Friends ({friends.length})</h3>
                {friends.map(f => (
                  <FriendCard key={f._id} friend={f}
                    onRemove={fr => setConfirmRemove(fr)}
                    onSendQuiz={fr => sendToFriend(fr, 'quiz')}
                    onSendAchievement={fr => sendToFriend(fr, 'achievement')} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl py-10 text-center"
                style={{ background: 'var(--bg1)', border: '1px dashed var(--border)' }}>
                <div className="text-4xl mb-2">👥</div>
                <p className="text-sm text-muted">No friends yet — search above to add some!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Tab: Activity */}
        {tab === 'activity' && (
          <motion.div key="activity" className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h3 className="font-display font-semibold text-sm text-primary">Recent Activity</h3>
            {(user?.history || []).slice().reverse().slice(0, 10).length === 0 ? (
              <div className="rounded-2xl py-10 text-center"
                style={{ background: 'var(--bg1)', border: '1px dashed var(--border)' }}>
                <div className="text-4xl mb-2">📋</div>
                <p className="text-sm text-muted">No quiz activity yet</p>
              </div>
            ) : (
              (user?.history || []).slice().reverse().slice(0, 10).map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: 'var(--bg2)' }}>
                    {h.percentage >= 80 ? '🎉' : h.percentage >= 60 ? '👍' : '📚'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-primary truncate">
                      {h.categoryName || h.category}
                    </div>
                    <div className="text-xs text-muted">{new Date(h.date).toLocaleDateString()}</div>
                  </div>
                  <div className="font-display font-black text-lg"
                    style={{ color: h.percentage >= 80 ? 'var(--green)' : h.percentage >= 60 ? 'var(--gold)' : 'var(--red)' }}>
                    {h.percentage}%
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm remove friend */}
      <SamsungConfirm
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => removeFriend(confirmRemove)}
        title="Remove Friend"
        message={`Remove ${confirmRemove?.name} from your friends?`}
        icon="👥"
        confirmLabel="Remove"
        danger />

      {/* Avatar confirm */}
      <SamsungConfirm
        open={showAvatarConfirm}
        onClose={() => setShowAvatarConfirm(false)}
        onConfirm={confirmSaveAvatar}
        title="Update Photo"
        message="Save this as your new profile picture?"
        icon="📷"
        confirmLabel="Save"
        danger={false} />
    </PageWrapper>
  )
}
