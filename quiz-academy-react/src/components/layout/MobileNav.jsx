import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Play, Trophy, User } from 'lucide-react'

const TABS = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Home'    },
  { to: '/categories',  icon: BookOpen,         label: 'Courses' },
  { to: '/play',        icon: Play,             label: 'Play'    },
  { to: '/leaderboard', icon: Trophy,           label: 'Ranks'   },
  { to: '/profile',     icon: User,             label: 'Profile' },
]

export default function MobileNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden justify-center"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 14px)',
        paddingLeft: 16,
        paddingRight: 16,
        pointerEvents: 'none', // only the pill itself is interactive, not the full-width strip
      }}
    >
      <div
        className="flex items-center gap-1 pointer-events-auto"
        style={{
          background: 'rgba(20,22,30,0.7)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 9999,
          padding: '6px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}
      >
        {TABS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} title={label}
            className="relative flex items-center justify-center transition-all"
            style={({ isActive }) => ({
              width: 48, height: 48, borderRadius: 9999,
              background: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
            })}>
            {({ isActive }) => (
              <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
