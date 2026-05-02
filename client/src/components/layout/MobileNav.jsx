import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Play, Trophy, User } from 'lucide-react'
import { motion } from 'framer-motion'

const TABS = [
  { to: '/dashboard',  label: 'Home',    icon: LayoutDashboard },
  { to: '/categories', label: 'Courses', icon: BookOpen },
  { to: '/play',       label: 'Play',    icon: Play },
  { to: '/leaderboard',label: 'Ranks',   icon: Trophy },
  { to: '/profile',    label: 'Profile', icon: User },
]

export default function MobileNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden"
      style={{
        background:   'var(--bg1)',
        borderTop:    '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
          style={({ isActive }) => ({
            color: isActive ? 'var(--accent)' : 'var(--t3)',
          })}
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <tab.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: 'var(--accent)' }}
                  />
                )}
              </div>
              <span className="text-xs" style={{ fontSize: 10 }}>{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
