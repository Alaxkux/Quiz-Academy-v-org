import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { getLevelInfo } from '../../data/levels'
import { fmtNum } from '../../utils/format'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import ProgressBar from '../../components/ui/ProgressBar'
import { ConfirmModal } from '../../components/ui/Modal'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const fileRef = useRef(null)

  const [name,    setName]    = useState(user?.name || '')
  const [bio,     setBio]     = useState(user?.bio  || '')
  const [saving,  setSaving]  = useState(false)

  // Avatar state
  const [pendingAvatar, setPendingAvatar] = useState(null)  // base64 preview
  const [showAvatarConfirm, setShowAvatarConfirm] = useState(false)

  const stats  = user?.stats || {}
  const xpInfo = getLevelInfo(stats.totalXP || 0)

  // Pick image → set preview, then show confirm on Save
  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    const reader = new FileReader()
    reader.onload = ev => setPendingAvatar(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Save avatar only when user clicks Save Photo (shows confirm first)
  function confirmSaveAvatar() {
    if (!pendingAvatar) return
    updateUser({ avatar: pendingAvatar })
    setPendingAvatar(null)
    setShowAvatarConfirm(false)
    toast.success('Profile picture updated ✓')
  }

  function handleSaveProfile() {
    if (name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return }
    setSaving(true)
    updateUser({ name: name.trim(), bio: bio.trim() })
    setTimeout(() => {
      setSaving(false)
      toast.success('Profile saved ✓')
    }, 600)
  }

  return (
    <PageWrapper>
      <PageHeader title="👤 My Profile" subtitle="Manage your account and progress" />

      {/* Profile card */}
      <motion.div
        className="rounded-2xl p-6 flex flex-col items-center gap-4 text-center"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      >
        {/* Avatar with change button */}
        <div className="relative">
          <Avatar
            src={pendingAvatar || user?.avatar}
            name={user?.name || 'User'}
            size="xl"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ background: 'var(--accent)', border: '2px solid var(--bg1)' }}
          >
            <Camera size={13} color="#fff" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Pending avatar save button — only visible after picking */}
        {pendingAvatar && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => setShowAvatarConfirm(true)}>
              <Save size={13} /> Save Photo
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setPendingAvatar(null)}>
              Cancel
            </Button>
          </motion.div>
        )}

        <div>
          <h2 className="font-display font-bold text-lg text-primary">{user?.name}</h2>
          <p className="text-secondary text-sm">{user?.email}</p>
        </div>

        {/* Level badge */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}
        >
          <span>{xpInfo.current.emoji}</span>
          <span className="font-display font-bold text-sm" style={{ color: 'var(--accent)' }}>
            Level {xpInfo.current.level} — {xpInfo.current.title}
          </span>
        </div>

        {/* XP bar */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>{fmtNum(xpInfo.xpIntoLevel)} XP</span>
            <span>{xpInfo.next ? fmtNum(xpInfo.xpForNextLevel) + ' to next' : 'MAX'}</span>
          </div>
          <ProgressBar
            value={xpInfo.xpIntoLevel}
            max={xpInfo.xpForNextLevel}
            height={6}
            color="linear-gradient(90deg,var(--accent),var(--green))"
          />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
          {[
            { label: 'Quizzes',  value: stats.quizzesTaken || 0 },
            { label: 'Points',   value: fmtNum(stats.totalPoints || 0) },
            { label: 'Streak',   value: `${stats.streak || 0}🔥` },
          ].map(s => (
            <div key={s.label} className="rounded-xl py-2 text-center"
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
              <div className="font-display font-bold text-base text-primary">{s.value}</div>
              <div className="text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted">
          Member since {new Date(user?.joinDate || user?.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* Edit form */}
      <motion.div
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{ background: 'var(--bg1)', border: '1px solid var(--border)' }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      >
        <h3 className="font-display font-semibold text-sm text-primary">Edit Profile</h3>

        <div>
          <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">Full Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={60}
            placeholder="Your name"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div>
          <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">Email (cannot change)</label>
          <input value={user?.email || ''} disabled
            className="w-full px-3.5 py-2.5 rounded-xl text-sm opacity-50"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)' }} />
        </div>

        <div>
          <label className="text-xs text-muted uppercase tracking-wider block mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Tell us a bit about yourself..."
            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{ background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t1)', fontFamily: 'DM Sans' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
          <div className="text-xs text-muted text-right mt-0.5">{bio.length}/300</div>
        </div>

        <Button variant="primary" size="lg" loading={saving} onClick={handleSaveProfile} className="w-full">
          Save Changes
        </Button>
      </motion.div>

      {/* Avatar save confirmation modal */}
      <ConfirmModal
        open={showAvatarConfirm}
        onClose={() => setShowAvatarConfirm(false)}
        onConfirm={confirmSaveAvatar}
        title="Update Profile Picture"
        message="Save this image as your new profile picture?"
        icon="📷"
        confirmLabel="Save Photo"
        danger={false}
      />
    </PageWrapper>
  )
}
