import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Play, Brain, Clock, Hammer,
  Trophy, History, Award, Users, User, Settings, LogOut,
  Sparkles, ChevronLeft, X, Calendar
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getLevelInfo } from '../../data/levels'
import Avatar from '../ui/Avatar'
import ProgressBar from '../ui/ProgressBar'

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
      { to: '/planner',    label: 'Study Planner',  icon: Calendar },
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

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <aside
      className="flex flex-col h-full overflow-hidden transition-all duration-250"
      style={{
        width:      collapsed ? 64 : 232,
        minWidth:   collapsed ? 64 : 232,
        background: 'var(--bg1)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* ── Brand ── */}
      <div className="flex items-center gap-2.5 p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center font-display font-black text-sm text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--green))' }}
        >
          Q
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              className="flex-1 min-w-0"
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

        {/* Desktop collapse btn / Mobile close btn */}
        {isMobile ? (
          <button onClick={onClose} className="ml-auto p-1 rounded-lg text-muted hover:text-primary transition-colors">
            <X size={16} />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="ml-auto p-1 rounded-lg text-muted hover:text-primary transition-colors"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronLeft size={14} />
            </motion.div>
          </button>
        )}
      </div>

      {/* ── User chip ── */}
      {user && (
        <div
          className="mx-3 mt-3 p-2.5 rounded-xl flex items-center gap-2.5 overflow-hidden"
          style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
        >
          <Avatar src={user.avatar} name={user.name} size="sm" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                className="flex-1 min-w-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{   opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="text-xs font-medium text-primary truncate">{user.name}</div>
                <div className="text-xs text-green truncate">{(user.stats?.totalPoints || 0).toLocaleString()} pts</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── XP Bar ── */}
      {user && xpInfo && !collapsed && (
        <div className="mx-3 mt-2 px-1">
          <div className="flex items-center justify-between mb-1">
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
                  `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all relative
                   ${isActive
                     ? 'font-medium border-l-2'
                     : 'border-l-2 border-transparent hover:opacity-80'}`
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
        <NavLink
          to="/profile"
          onClick={isMobile ? onClose : undefined}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-4 py-2 text-sm transition-colors
             ${isActive ? 'text-accent' : 'text-muted hover:text-primary'}`
          }
        >
          <User size={15} className="flex-shrink-0" />
          {!collapsed && <span>Profile</span>}
        </NavLink>
        <NavLink
          to="/settings"
          onClick={isMobile ? onClose : undefined}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-4 py-2 text-sm transition-colors
             ${isActive ? 'text-accent' : 'text-muted hover:text-primary'}`
          }
        >
          <Settings size={15} className="flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors text-muted hover:text-red"
          style={{ '--tw-text-opacity': 1 }}
        >
          <LogOut size={15} className="flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}
