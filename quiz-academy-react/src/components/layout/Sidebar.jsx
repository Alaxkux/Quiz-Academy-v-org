import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Play, Brain, Hammer,
  Trophy, History, Award, Users, User, Settings, LogOut,
  Sparkles, X, Calendar, Shield
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getLevelInfo } from '../../data/levels'
import { authApi } from '../../api/auth'
import Avatar from '../ui/Avatar'
import ProgressBar from '../ui/ProgressBar'
import { SamsungConfirm } from '../ui/SamsungPopup'

const NAV = [
  {
    section: 'Main',
    items: [
      { to: '/dashboard',  label: 'Dashboard',     icon: LayoutDashboard },
      { to: '/categories', label: 'Categories',    icon: BookOpen },
      { to: '/play',       label: 'Play Quiz',      icon: Play,      hot: true },
      { to: '/ai',         label: 'AI Questions',   icon: Sparkles,  badge: 'New' },
    ]
  },
  {
    section: 'Study',
    items: [
      { to: '/brainstorm', label: 'Brainstorming',  icon: Brain },
      { to: '/planner',    label: 'Study Planner',  icon: Calendar, wide: true },
      { to: '/builder',    label: 'Course Builder', icon: Hammer },
    ]
  },
  {
    section: 'Stats',
    items: [
      { to: '/leaderboard',  label: 'Leaderboard',  icon: Trophy },
      { to: '/history',      label: 'History',      icon: History },
      { to: '/achievements', label: 'Achievements', icon: Award },
      { to: '/users',        label: 'Users',        icon: Users },
    ]
  },
]

export default function Sidebar({ collapsed, onToggleCollapse, onClose, isMobile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const xpInfo   = user ? getLevelInfo(user.stats?.totalXP || 0) : null

  const [logoutOpen, setLogoutOpen] = useState(false)
  const [pendingRequests, setPendingRequests] = useState(0)

  useEffect(() => {
    if (!user) return
    authApi.getFriends()
      .then(d => setPendingRequests(d?.requests?.length || 0))
      .catch(() => {})
  }, [user])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <aside
      className="flex flex-col h-full overflow-hidden"
      style={{
        width:      collapsed ? 64 : 232,
        minWidth:   collapsed ? 64 : 232,
        background: 'var(--bg1)',
        borderRight: '1px solid var(--border)',
        transition: 'width 0.25s ease, min-width 0.25s ease',
      }}
    >
      {/* ── Brand — same height as topbar (h-14) ── */}
      <div
        className="flex items-center h-14 flex-shrink-0 border-b px-4"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-sm text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--green))' }}
        >
          Q
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              className="flex-1 min-w-0 ml-2.5"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{   opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="font-display font-bold text-sm text-primary truncate">Quiz Academy</div>
              <div className="text-xs text-muted">v4.0</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile close btn — removed, tap backdrop to close instead */}
      </div>

      {/* ── Profile card — user chip + XP bar merged into one unified card ── */}
      {user && (
        <div
          className="mx-3 mt-4 rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <div
            className="flex items-center"
            style={{
              padding: collapsed ? '14px 0' : '14px',
              gap: collapsed ? 0 : 12,
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <Avatar src={user.avatar} name={user.name} size={collapsed ? 'sm' : 'md'} />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{   opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="text-sm font-semibold text-primary truncate leading-snug">{user.name}</div>
                  <div className="text-xs text-green truncate mt-0.5">{(user.stats?.totalPoints || 0).toLocaleString()} pts</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* XP Bar — same card, separated by a hairline instead of a second box */}
          {xpInfo && !collapsed && (
            <div
              className="px-3.5 pb-3.5 pt-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}
                >
                  Lv.{xpInfo.current.level} {xpInfo.current.title}
                </span>
                <span className="text-xs text-muted">{xpInfo.xpIntoLevel}/{xpInfo.xpForNextLevel}</span>
              </div>
              <ProgressBar
                value={xpInfo.xpIntoLevel}
                max={xpInfo.xpForNextLevel}
                height={3}
                color="linear-gradient(90deg, var(--accent), var(--green))"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-2 hide-scrollbar">
        {NAV.map(group => (
          <div key={group.section}>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  className="px-4 pt-3 pb-1 text-xs font-medium uppercase tracking-widest text-muted"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                  {group.section}
                </motion.div>
              )}
            </AnimatePresence>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={isMobile ? onClose : undefined}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center py-2.5 text-sm transition-all relative border-l-2
                   ${collapsed ? 'justify-center px-0' : 'gap-2.5 px-4'}
                   ${item.wide && !collapsed ? 'col-span-2' : ''}
                   ${isActive ? 'font-medium' : 'border-transparent hover:opacity-80'}`
                }
                style={({ isActive }) => isActive
                  ? { color: 'var(--accent)', background: 'var(--accent-dim)', borderLeftColor: 'var(--accent)' }
                  : { color: 'var(--t2)' }
                }
              >
                <item.icon size={16} className="flex-shrink-0" />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      className="flex-1 truncate"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && item.badge && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: 'var(--red)', color: '#fff', fontSize: 9 }}>
                    {item.badge}
                  </span>
                )}
                {item.to === '/users' && pendingRequests > 0 && (
                  <span
                    className="flex items-center justify-center text-xs font-bold rounded-full flex-shrink-0"
                    style={{ background: 'var(--red)', color: '#fff', fontSize: 9, minWidth: 16, height: 16, padding: '0 4px' }}
                  >
                    {pendingRequests > 9 ? '9+' : pendingRequests}
                  </span>
                )}
                {!collapsed && item.hot && (
                  <span className="text-xs text-gold">🔥</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="border-t py-2" style={{ borderColor: 'var(--border)' }}>
        {user?.isAdmin && (
          <NavLink
            to="/admin"
            onClick={isMobile ? onClose : undefined}
            title={collapsed ? 'Admin' : undefined}
            className={({ isActive }) =>
              `flex items-center py-2 text-sm transition-colors
               ${collapsed ? 'justify-center px-0' : 'gap-2.5 px-4'}
               ${isActive ? 'text-accent' : 'text-muted hover:text-primary'}`
            }
          >
            <Shield size={15} className="flex-shrink-0" />
            {!collapsed && <span>Admin</span>}
          </NavLink>
        )}
        <NavLink
          to="/profile"
          onClick={isMobile ? onClose : undefined}
          title={collapsed ? 'Profile' : undefined}
          className={({ isActive }) =>
            `flex items-center py-2 text-sm transition-colors
             ${collapsed ? 'justify-center px-0' : 'gap-2.5 px-4'}
             ${isActive ? 'text-accent' : 'text-muted hover:text-primary'}`
          }
        >
          <User size={15} className="flex-shrink-0" />
          {!collapsed && <span>Profile</span>}
        </NavLink>
        <NavLink
          to="/settings"
          onClick={isMobile ? onClose : undefined}
          title={collapsed ? 'Settings' : undefined}
          className={({ isActive }) =>
            `flex items-center py-2 text-sm transition-colors
             ${collapsed ? 'justify-center px-0' : 'gap-2.5 px-4'}
             ${isActive ? 'text-accent' : 'text-muted hover:text-primary'}`
          }
        >
          <Settings size={15} className="flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <button
          onClick={() => setLogoutOpen(true)}
          title={collapsed ? 'Sign out' : undefined}
          className={`w-full flex items-center py-2 text-sm transition-colors text-muted hover:text-red
            ${collapsed ? 'justify-center px-0' : 'gap-2.5 px-4'}`}
        >
          <LogOut size={15} className="flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>

      <SamsungConfirm
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out?"
        message="Are you sure you want to sign out of Quiz Academy?"
        icon="🚪"
        confirmLabel="Sign Out"
        cancelLabel="Stay"
        danger
      />
      </div>
    </aside>
  )
}