import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PanelLeft } from 'lucide-react'
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
  const mainRef = useRef(null)

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' })
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
            <motion.div
              className="fixed left-0 right-0 z-40 md:hidden"
              style={{ top: '56px', bottom: '57px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{   opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              className="fixed left-0 z-50 md:hidden overflow-y-auto"
              style={{ top: '56px', bottom: '57px', width: 'min(232px, 80vw)' }}
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

      {/* ── Main content area ── */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">

        {/* Topbar spacer */}
        <div className="h-14 flex-shrink-0" />

        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          onToggleCollapse={toggleCollapse}
          sidebarCollapsed={sidebarCollapsed}
          title={title}
        />

        {/* Page content */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6"
          style={{ scrollBehavior: 'auto', overscrollBehavior: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <Outlet />
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <MobileNav />
    </div>
  )
} 