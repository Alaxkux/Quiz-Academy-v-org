import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import MobileNav from './MobileNav'
import { PAGE_TITLES } from './PageWrapper'

export default function AppShell() {
  const location   = useLocation()
  const [sidebarOpen,      setSidebarOpen]      = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('qa_sb_collapsed') === 'true'
  )

  const title = PAGE_TITLES[location.pathname] || 'Quiz Academy'

  // Persist collapse state
  function toggleCollapse() {
    const next = !sidebarCollapsed
    setSidebarCollapsed(next)
    localStorage.setItem('qa_sb_collapsed', String(next))
  }

  // Close mobile sidebar on route change
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  // Close mobile sidebar on Escape
  useEffect(() => {
    const handle = e => { if (e.key === 'Escape') setSidebarOpen(false) }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg0)' }}>

      {/* ── Desktop sidebar ── */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleCollapse}
          isMobile={false}
        />
      </div>

      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop — click to close */}
            <motion.div
              className="fixed inset-0 z-30 md:hidden"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{   opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sidebar panel */}
            <motion.div
              className="fixed top-0 left-0 bottom-0 z-40 md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{   x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            >
              <Sidebar
                collapsed={false}
                isMobile={true}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content area ── */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Topbar
  onMenuClick={() => setSidebarOpen(true)}
  title={title}
/>

{/* Page content — scrollable */}
<main className="flex-1 overflow-y-auto p-4 md:p-6 pt-20">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <MobileNav />
    </div>
  )
}
