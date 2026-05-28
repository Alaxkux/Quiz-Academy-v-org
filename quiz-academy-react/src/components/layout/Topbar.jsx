import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Sun, Moon, Maximize2, X, PanelLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { getStoredTheme } from '../../data/themes'
import Avatar from '../ui/Avatar'

function NotifDropdown({ open, notifications, onDismiss, onClearAll }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute right-0 top-full mt-2 w-72 rounded-2xl overflow-hidden z-50"
          style={{ background: 'var(--bg1)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{   opacity: 0, y: -8, scale: 0.96  }}
          transition={{ duration: 0.15 }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="font-display font-semibold text-sm text-primary">Notifications</span>
            {notifications.length > 0 && (
              <button onClick={onClearAll} className="text-xs text-muted hover:text-red transition-colors">Clear all</button>
            )}
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '360px' }}>
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted">No notifications yet</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="flex items-start gap-2.5 px-4 py-3 border-b hover:opacity-80 transition-opacity"
                  style={{ borderColor: 'var(--border)' }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs"
                    style={{ background: n.type === 'success' ? 'var(--green-dim)' : n.type === 'warning' ? 'var(--gold-dim)' : n.type === 'error' ? 'var(--red-dim)' : 'var(--accent-dim)' }}>
                    {n.type === 'success' ? '✓' : n.type === 'warning' ? '⚠' : n.type === 'error' ? '✗' : n.type === 'login' ? '👋' : n.type === 'xp' ? '⭐' : n.type === 'level' ? '🏆' : n.type === 'streak' ? '🔥' : n.type === 'achievement' ? '🎖️' : '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-primary leading-snug">{n.message}</p>
                    <p className="text-xs text-muted mt-0.5">{n.timestamp}</p>
                  </div>
                  <button onClick={() => onDismiss(n.id)} className="text-muted hover:text-red transition-colors flex-shrink-0 mt-0.5">
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ProfileDropdown({ open, user, onNavigate, onLogout }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute right-0 top-full mt-2 w-44 rounded-2xl overflow-hidden z-50"
          style={{ background: 'var(--bg1)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{   opacity: 0, y: -8, scale: 0.96  }}
          transition={{ duration: 0.15 }}
        >
          {[
            { label: '👤 Profile',  action: () => onNavigate('/profile')  },
            { label: '⚙️ Settings', action: () => onNavigate('/settings') },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              className="w-full text-left px-4 py-2.5 text-sm text-secondary hover:text-primary hover:bg-bg2 transition-colors">
              {item.label}
            </button>
          ))}
          <div className="h-px" style={{ background: 'var(--border)' }} />
          <button onClick={onLogout}
            className="w-full text-left px-4 py-2.5 text-sm transition-colors"
            style={{ color: 'var(--red)' }}>
            🚪 Logout
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Topbar({ onMenuClick, onToggleCollapse, sidebarCollapsed, title }) {
  const navigate  = useNavigate()
  const { user, notifications, dismissNotification, clearNotifications, logout } = useAuth()
  const { currentTheme, toggle } = useTheme()
  const [search,      setSearch]      = useState('')
  const [notifOpen,   setNotifOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef   = useRef(null)
  const profileRef = useRef(null)

  const lightThemes = ['snow', 'paper', 'rose']
  const isLight     = lightThemes.includes(getStoredTheme())

  useEffect(() => {
    function handle(e) {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/categories?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {})
    else document.exitFullscreen()
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const unreadCount = notifications.length

  return (
    <header
      className="flex items-center gap-2 px-4 h-14 flex-shrink-0 z-40"
      style={{
        background: 'var(--bg1)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="flex md:hidden w-8 h-8 items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-[var(--bg2)] transition-colors"
      >
        <PanelLeft size={16} />
      </button>

      {/* Desktop sidebar toggle — Claude-style */}
      <button
        onClick={onToggleCollapse}
        className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-[var(--bg2)] transition-colors"
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <motion.div
          animate={{ scaleX: sidebarCollapsed ? -1 : 1 }}
          transition={{ duration: 0.2 }}
          style={{ originX: 0.5 }}
        >
          <PanelLeft size={16} />
        </motion.div>
      </button>

      {/* Page title — mobile only */}
      <span className="font-display font-semibold text-base text-primary flex-1 truncate md:hidden">{title}</span>

      {/* Search — desktop */}
      <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl flex-1 max-w-xs transition-colors"
        style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <Search size={13} style={{ color: 'var(--t3)', flexShrink: 0 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="bg-transparent text-sm outline-none w-full"
          style={{ color: 'var(--t1)' }}
        />
      </form>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Fullscreen — desktop only */}
        <button onClick={toggleFullscreen}
          className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-[var(--bg2)] transition-colors">
          <Maximize2 size={14} />
        </button>

        {/* Theme toggle */}
        <button onClick={toggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-[var(--bg2)] transition-colors">
          {isLight ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(v => !v); setProfileOpen(false) }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-[var(--bg2)] transition-colors relative"
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center font-bold"
                style={{ background: 'var(--red)', color: '#fff', fontSize: 9, border: '2px solid var(--bg1)' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotifDropdown
            open={notifOpen}
            notifications={notifications}
            onDismiss={id => { dismissNotification(id) }}
            onClearAll={() => { clearNotifications(); setNotifOpen(false) }}
          />
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen(v => !v); setNotifOpen(false) }}
            className="w-8 h-8 flex items-center justify-center rounded-full overflow-hidden transition-opacity hover:opacity-80"
            style={{ border: '2px solid var(--border)' }}
          >
            <Avatar src={user?.avatar} name={user?.name || 'User'} size="sm" />
          </button>
          <ProfileDropdown
            open={profileOpen}
            user={user}
            onNavigate={path => { navigate(path); setProfileOpen(false) }}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>
  )
}