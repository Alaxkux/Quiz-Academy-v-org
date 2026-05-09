import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Trash2, Users, BookOpen, Lock, KeyRound, Eye, EyeOff, RefreshCw, Crown } from 'lucide-react'
import { adminApi } from '../../api/admin'
import { useAuth } from '../../hooks/useAuth'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'

// ─────────────────────────────────────────────
// SET PIN FORM — first time setup only
// ─────────────────────────────────────────────
function SetPinForm({ onDone }) {
  const [newPin,  setNewPin]  = useState('')
  const [confirm, setConfirm] = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSet() {
    setError('')
    if (!/^\d{4,8}$/.test(newPin))  return setError('PIN must be 4–8 digits')
    if (newPin !== confirm)           return setError('PINs do not match')
    setLoading(true)
    try {
      await adminApi.setPin(newPin)
      onDone()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="text-left flex flex-col gap-3">
      <div>
        <label className="text-xs text-muted mb-1 block">New PIN (4–8 digits)</label>
        <input
          type="password" inputMode="numeric" maxLength={8}
          value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
          placeholder="e.g. 1234"
          className="w-full text-sm rounded-xl px-3 py-2.5"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)' }}
          autoFocus
        />
      </div>
      <div>
        <label className="text-xs text-muted mb-1 block">Confirm PIN</label>
        <input
          type="password" inputMode="numeric" maxLength={8}
          value={confirm} onChange={e => setConfirm(e.target.value.replace(/\D/g, ''))}
          placeholder="Repeat PIN"
          className="w-full text-sm rounded-xl px-3 py-2.5"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)' }}
          onKeyDown={e => e.key === 'Enter' && handleSet()}
        />
      </div>
      {error && (
        <p className="text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>
          {error}
        </p>
      )}
      <Button onClick={handleSet} loading={loading} className="w-full mt-1">
        <Lock size={14} /> Create PIN & Enter
      </Button>
    </div>
  )
}

// ─────────────────────────────────────────────
// PIN GATE — verify only if set, create if not
// ─────────────────────────────────────────────
function PinGate({ onUnlock, pinSet, onPinCreated }) {
  const [digits, setDigits]   = useState(['', '', '', ''])
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPin, setShowPin] = useState(false)

  async function handleVerify() {
    const pin = digits.join('')
    if (pin.length < 4) return setError('Enter your PIN')
    setLoading(true)
    setError('')
    try {
      await adminApi.verifyPin(pin)
      onUnlock()
    } catch (e) {
      setError(e.message)
      setDigits(['', '', '', ''])
    } finally {
      setLoading(false)
    }
  }

  function handleDigit(i, val) {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < 3) document.getElementById(`pin-${i + 1}`)?.focus()
  }

  function handleKey(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      document.getElementById(`pin-${i - 1}`)?.focus()
    }
    if (e.key === 'Enter') handleVerify()
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
            <Shield size={28} style={{ color: 'var(--accent)' }} />
          </div>

          <h2 className="font-display font-bold text-xl text-primary mb-1">Admin Access</h2>
          <p className="text-sm text-muted mb-6">
            {pinSet ? 'Enter your admin PIN to continue' : 'Create a PIN to secure your admin dashboard'}
          </p>

          {pinSet ? (
            <>
              <div className="flex gap-3 justify-center mb-4">
                {digits.map((d, i) => (
                  <input
                    key={i}
                    id={`pin-${i}`}
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all"
                    style={{
                      background: 'var(--bg2)',
                      border: `2px solid ${d ? 'var(--accent)' : 'var(--border)'}`,
                      color: 'var(--t1)',
                    }}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <button
                onClick={() => setShowPin(s => !s)}
                className="flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors mx-auto mb-4"
              >
                {showPin ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPin ? 'Hide' : 'Show'} PIN
              </button>

              {error && (
                <p className="text-xs mb-4 px-3 py-2 rounded-lg" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>
                  {error}
                </p>
              )}

              <Button onClick={handleVerify} loading={loading} className="w-full">
                <KeyRound size={15} /> Unlock Dashboard
              </Button>
            </>
          ) : (
            <SetPinForm onDone={onPinCreated} />
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────
// CHANGE PIN MODAL
// ─────────────────────────────────────────────
function ChangePinModal({ onClose }) {
  const [currentPin, setCurrentPin] = useState('')
  const [newPin,     setNewPin]     = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')
  const [loading,    setLoading]    = useState(false)

  async function handleSet() {
    setError('')
    if (!/^\d{4,8}$/.test(newPin))   return setError('PIN must be 4–8 digits')
    if (newPin !== confirm)           return setError('PINs do not match')
    if (!currentPin)                  return setError('Enter your current PIN')
    setLoading(true)
    try {
      await adminApi.setPin(newPin, currentPin)
      setSuccess('PIN changed successfully!')
      setTimeout(onClose, 1500)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Lock size={18} style={{ color: 'var(--accent)' }} />
          <h3 className="font-display font-bold text-lg text-primary">Change Admin PIN</h3>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-muted mb-1 block">Current PIN</label>
            <input
              type="password" inputMode="numeric" maxLength={8}
              value={currentPin} onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Current PIN"
              className="w-full text-sm rounded-xl px-3 py-2.5"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)' }}
            />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">New PIN (4–8 digits)</label>
            <input
              type="password" inputMode="numeric" maxLength={8}
              value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="New PIN"
              className="w-full text-sm rounded-xl px-3 py-2.5"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)' }}
            />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Confirm New PIN</label>
            <input
              type="password" inputMode="numeric" maxLength={8}
              value={confirm} onChange={e => setConfirm(e.target.value.replace(/\D/g, ''))}
              placeholder="Confirm PIN"
              className="w-full text-sm rounded-xl px-3 py-2.5"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)' }}
            />
          </div>
        </div>

        {error && (
          <p className="text-xs mt-3 px-3 py-2 rounded-lg" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>
            {error}
          </p>
        )}
        {success && (
          <p className="text-xs mt-3 px-3 py-2 rounded-lg" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
            {success}
          </p>
        )}

        <div className="flex gap-2 mt-5">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSet} loading={loading} className="flex-1">
            <Lock size={14} /> Change PIN
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────
// USER ROW
// ─────────────────────────────────────────────
function UserRow({ user, onDelete, isMe }) {
  const [confirming, setConfirming] = useState(false)
  const [deleteType, setDeleteType] = useState(null) // 'permanent' | 'temporary'

  function startDelete(type) {
    setDeleteType(type)
    setConfirming(true)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
    >
      <Avatar src={user.avatar} name={user.name} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary truncate">{user.name}</span>
          {user.isAdmin && (
            <span className="text-xs px-1.5 py-0.5 rounded-md font-bold flex-shrink-0"
              style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
              Admin
            </span>
          )}
          {isMe && (
            <span className="text-xs px-1.5 py-0.5 rounded-md flex-shrink-0"
              style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
              You
            </span>
          )}
        </div>
        <div className="text-xs text-muted truncate">{user.email}</div>
        <div className="text-xs text-muted mt-0.5">
          {user.stats?.totalPoints?.toLocaleString() || 0} pts · {user.stats?.quizzesTaken || 0} quizzes
        </div>
      </div>

      {!isMe && !user.isAdmin && (
        confirming ? (
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className="text-xs text-muted">
              {deleteType === 'permanent' ? '⚠️ Delete permanently?' : '🕐 Suspend temporarily?'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onDelete(user._id, user.name, deleteType)}
                className="text-xs font-bold px-2 py-1 rounded-lg"
                style={{ background: 'var(--red-dim)', color: 'var(--red)' }}
              >Confirm</button>
              <button
                onClick={() => { setConfirming(false); setDeleteType(null) }}
                className="text-xs text-muted hover:text-primary transition-colors px-1"
              >Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => startDelete('temporary')}
              className="p-1.5 rounded-lg text-xs text-muted hover:text-gold transition-colors"
              title="Suspend temporarily"
              style={{ border: '1px solid var(--border)' }}
            >
              🕐
            </button>
            <button
              onClick={() => startDelete('permanent')}
              className="p-1.5 rounded-lg text-muted hover:text-red transition-colors"
              title="Delete permanently"
              style={{ border: '1px solid var(--border)' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// MAIN ADMIN DASHBOARD
// ─────────────────────────────────────────────
export default function AdminDashboard() {
  const { user: me }            = useAuth()
  const navigate                = useNavigate()
  const [unlocked, setUnlocked] = useState(false)
  const [pinSet,   setPinSet]   = useState(false)
  const [pinLoading, setPinLoading] = useState(true)
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(false)
  const [msg,      setMsg]      = useState(null)  // { text, undoFn } | null
  const [pinModal, setPinModal] = useState(false)

  // Check PIN status from MongoDB on mount
  useEffect(() => {
    adminApi.getPinStatus()
      .then(d => setPinSet(d.pinSet))
      .catch(() => {})
      .finally(() => setPinLoading(false))
  }, [])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.getUsers()
      setUsers(data.users || [])
    } catch (e) {
      notify('❌ ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (unlocked) loadUsers()
  }, [unlocked, loadUsers])

  const [undoStack, setUndoStack] = useState([]) // { id, name, type, timer }

  function notify(text, undoFn = null) {
    setMsg({ text, undoFn })
    setTimeout(() => setMsg(null), 5000)
  }

  async function handleDelete(id, name, type) {
    // Optimistically remove from UI
    const removed = users.find(u => u._id === id)
    setUsers(u => u.filter(x => x._id !== id))

    if (type === 'temporary') {
      // Just hide from UI — show undo for 5s, then do nothing (no actual DB delete)
      notify(`🕐 "${name}" suspended`, () => {
        setUsers(u => [...u, removed].sort((a, b) => a.name.localeCompare(b.name)))
      })
      return
    }

    // Permanent — delete from DB but allow undo within 5s
    let undone = false
    const timer = setTimeout(async () => {
      if (!undone) {
        try { await adminApi.deleteUser(id) } catch (e) { console.warn(e.message) }
      }
    }, 5000)

    notify(`🗑 "${name}" deleted`, () => {
      undone = true
      clearTimeout(timer)
      setUsers(u => [...u, removed].sort((a, b) => a.name.localeCompare(b.name)))
    })
  }

  // Show loading while checking PIN status
  if (pinLoading) {
    return (
      <PageWrapper>
        <PageHeader title="🛡️ Admin Dashboard" subtitle="Restricted access" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-sm text-muted">Checking access...</div>
        </div>
      </PageWrapper>
    )
  }

  // PIN gate — verify if set, create if not
  if (!unlocked) {
    return (
      <PageWrapper>
        <PageHeader title="🛡️ Admin Dashboard" subtitle="Restricted access" />
        <PinGate
          pinSet={pinSet}
          onUnlock={() => setUnlocked(true)}
          onPinCreated={() => { setPinSet(true); setUnlocked(true) }}
        />
      </PageWrapper>
    )
  }

  const totalPts     = users.reduce((s, u) => s + (u.stats?.totalPoints || 0), 0)
  const totalQuizzes = users.reduce((s, u) => s + (u.stats?.quizzesTaken || 0), 0)

  return (
    <PageWrapper>
      <PageHeader
        title="🛡️ Admin Dashboard"
        subtitle={`${users.length} users · Logged in as ${me?.name}`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPinModal(true)}>
              <Lock size={14} /> Change PIN
            </Button>
            <Button variant="icon" size="sm" onClick={loadUsers} title="Refresh">
              <RefreshCw size={14} />
            </Button>
          </div>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users,    label: 'Total Users',  value: users.length },
          { icon: Crown,    label: 'Total Points', value: totalPts.toLocaleString() },
          { icon: BookOpen, label: 'Total Quizzes', value: totalQuizzes },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl p-3 text-center"
            style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}>
            <Icon size={16} className="mx-auto mb-1" style={{ color: 'var(--accent)' }} />
            <div className="font-display font-bold text-lg text-primary">{value}</div>
            <div className="text-xs text-muted">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => navigate('/courses/manage')}>
          <BookOpen size={14} /> Manage Courses
        </Button>
      </div>

      {/* Notification with undo */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center justify-between text-sm px-4 py-3 rounded-xl"
            style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
          >
            <span>{msg.text}</span>
            {msg.undoFn && (
              <button
                onClick={() => { msg.undoFn(); setMsg(null) }}
                className="text-xs font-bold ml-4 px-2 py-1 rounded-lg flex-shrink-0"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
              >
                Undo
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* User list */}
      <div>
        <h2 className="font-display font-semibold text-sm text-primary mb-3 flex items-center gap-2">
          <Users size={15} /> All Users
        </h2>
        {loading ? (
          <div className="text-center text-muted text-sm py-10">Loading users...</div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {users.map(u => (
                <UserRow key={u._id} user={u} isMe={u.email === me?.email} onDelete={handleDelete} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Change PIN modal */}
      <AnimatePresence>
        {pinModal && (
          <ChangePinModal onClose={() => setPinModal(false)} />
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}