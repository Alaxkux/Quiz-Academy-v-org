import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Bell, User, Database } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { THEMES } from '../../data/themes'
import PageWrapper, { PageHeader } from '../../components/layout/PageWrapper'
import Button from '../../components/ui/Button'
import { ConfirmModal } from '../../components/ui/Modal'

const TABS = [
  { id: 'appearance',    label: 'Appearance',    icon: Palette  },
  { id: 'notifications', label: 'Notifications', icon: Bell     },
  { id: 'account',       label: 'Account',       icon: User     },
  { id: 'data',          label: 'Data',          icon: Database },
]

function ThemePicker() {
  const { currentTheme, setTheme } = useTheme()
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {THEMES.map(t => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className="p-3 rounded-2xl flex flex-col items-center gap-2 transition-all"
          style={{
            background:   t.dots[0],
            border:       `2px solid ${currentTheme === t.id ? 'var(--accent)' : 'transparent'}`,
            boxShadow:    currentTheme === t.id ? '0 0 0 2px var(--accent-border)' : undefined,
          }}
        >
          <div className="flex gap-1.5">
            {t.dots.map((d, i) => (
              <div key={i} className="w-3 h-3 rounded-full" style={{ background: d }} />
            ))}
          </div>
          <span
            className="text-xs font-medium"
            style={{ color: t.scheme === 'dark' ? '#fff' : '#111' }}
          >
            {t.name}
          </span>
          {currentTheme === t.id && (
            <span className="text-xs font-bold" style={{ color: t.scheme === 'dark' ? 'var(--accent)' : 'var(--accent)' }}>
              ✓ Active
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

function NotificationsTab() {
  const { user, updateUser } = useAuth()
  const pushStatus = typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-medium text-sm text-primary">🔔 Streak Reminders</h4>
            <p className="text-xs text-secondary mt-0.5">
              Get notified at 8 PM if you haven't quizzed today
            </p>
          </div>
          {pushStatus === 'granted' ? (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(77,255,195,.2)' }}>
              ● Enabled
            </span>
          ) : pushStatus === 'denied' ? (
            <span className="text-xs text-muted">Blocked in browser</span>
          ) : (
            <Button variant="primary" size="xs"
              onClick={async () => {
                if (typeof Notification !== 'undefined') {
                  const p = await Notification.requestPermission()
                  if (p === 'granted') toast.success('Reminders enabled! 🔥')
                  else toast.error('Permission denied')
                }
              }}>
              Enable
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="font-medium text-sm text-primary">📧 Email Notifications</h4>
            <p className="text-xs text-secondary mt-0.5">Password reset and important account emails</p>
          </div>
          <span className="text-xs text-muted">Always on</span>
        </div>
      </div>
    </div>
  )
}

function AccountTab() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <h4 className="font-medium text-sm text-primary mb-0.5">Account Type</h4>
        <p className="text-xs text-secondary">
          {user?.isGoogleUser ? '🔗 Signed in with Google' : '📧 Email & Password account'}
        </p>
      </div>

      {!user?.isGoogleUser && (
        <div className="rounded-xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="font-medium text-sm text-primary">Password</h4>
              <p className="text-xs text-secondary mt-0.5">Change your account password</p>
            </div>
            <Button variant="ghost" size="xs" onClick={() => navigate('/forgot-password')}>
              Reset
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <h4 className="font-medium text-sm text-primary mb-0.5">Email</h4>
        <p className="text-xs text-secondary">{user?.email}</p>
      </div>
    </div>
  )
}

export default function Settings() {
  const [tab,           setTab]           = useState('appearance')
  const [resetOpen,     setResetOpen]     = useState(false)
  const { user, updateUser, logout }      = useAuth()
  const navigate = useNavigate()

  function handleResetData() {
    updateUser({
      history:      [],
      achievements: [],
      stats: {
        quizzesTaken: 0, totalPoints: 0, totalXP: 0, currentLevel: 1,
        streak: 0, lastQuizDate: null, dailyChallengesDone: 0,
        categoriesPlayed: [], weightedAvgScore: null,
      },
      notifications: [],
    })
    setResetOpen(false)
    toast.success('All data reset')
    navigate('/dashboard')
  }

  return (
    <PageWrapper>
      <PageHeader title="⚙️ Settings" subtitle="Customise your Quiz Academy experience" />

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto hide-scrollbar"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-w-fit"
            style={{
              background: tab === t.id ? 'var(--bg1)'   : 'transparent',
              color:      tab === t.id ? 'var(--accent)' : 'var(--t3)',
              border:     tab === t.id ? '1px solid var(--border)' : '1px solid transparent',
            }}>
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{   opacity: 0, y: 6 }} transition={{ duration: 0.18 }}>

          {tab === 'appearance' && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-display font-semibold text-sm text-primary mb-3">🎨 Theme</h3>
                <ThemePicker />
              </div>
            </div>
          )}

          {tab === 'notifications' && <NotificationsTab />}
          {tab === 'account'       && <AccountTab />}

          {tab === 'data' && (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-sm text-primary">Reset All Data</h4>
                    <p className="text-xs text-secondary mt-0.5">
                      Permanently delete all quiz history, achievements and progress. Cannot be undone.
                    </p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => setResetOpen(true)}>
                    Reset
                  </Button>
                </div>
              </div>

              <div className="rounded-xl p-4" style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-sm text-primary">Sign Out</h4>
                    <p className="text-xs text-secondary mt-0.5">Sign out of your account on this device</p>
                  </div>
                  <Button variant="secondary" size="sm"
                    onClick={async () => { await logout(); navigate('/login') }}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <ConfirmModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleResetData}
        title="Reset All Data"
        message="This will permanently delete all your quiz history, achievements, XP, and progress. This cannot be undone."
        icon="⚠️"
        confirmLabel="Reset Everything"
        danger={true}
      />
    </PageWrapper>
  )
}
