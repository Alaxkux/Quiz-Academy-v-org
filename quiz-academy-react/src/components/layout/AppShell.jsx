import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PanelLeft } from 'lucide-react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'
import { PAGE_TITLES } from './PageWrapper'

export default function AppShell() {
  const location = useLocation()
  const [sidebarOpen,      setSidebarOpen]      = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('qa_sb_collapsed') === 'true'
  )
  const mainRef = useRef(null)
  const title   = PAGE_TITLES[location.pathname] || 'Quiz Academy'

  // Instant scroll to top on every route change — no animation lag
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0
    }
  }, [location.pathname])

  function toggleCollapse() {
    const next = !sidebarCollapsed
    setSidebarCollapsed(next)
    localStorage.setItem('qa_sb_collapsed', String(next))
  }

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  useEffect(() => {
    const handle = e => { if (e.key === 'Escape') setSidebarOpen(false) }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg0)' }}>

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleCollapse}
          isMobile={false}
        />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{   opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
              style={{ width: 'min(232px, 80vw)' }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{   x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            >
              <Sidebar collapsed={false} isMobile={true} onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-h-0 min-w-0">

        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          onToggleCollapse={toggleCollapse}
          sidebarCollapsed={sidebarCollapsed}
          title={title}
        />

        {/* Scrollable page area — full height minus topbar */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:p-6 md:pb-6"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'auto',
            overscrollBehavior: 'none',
            minHeight: 0,
            paddingBottom: 'max(5.5rem, calc(57px + env(safe-area-inset-bottom) + 1rem))',
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}