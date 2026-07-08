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
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden"
      style={{
        background: 'var(--bg1)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        // Always visible — no transform tricks that could hide it
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      {TABS.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
          style={({ isActive }) => ({
            color: isActive ? 'var(--accent)' : 'var(--t3)',
            minHeight: 56,
          })}>
          {({ isActive }) => (
            <>
              <div className="relative flex items-center justify-center w-10 h-7 rounded-2xl transition-all"
                style={{ background: isActive ? 'var(--accent-dim)' : 'transparent' }}>
                <Icon size={18} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: 'var(--accent)' }} />
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
