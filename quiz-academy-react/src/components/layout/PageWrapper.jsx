import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useQuizStore from '../../store/quizStore'

const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/categories':   'Categories',
  '/play':         'Play Quiz',
  '/quiz/config':  'Quiz Setup',
  '/quiz/active':  'Quiz',
  '/quiz/results': 'Results',
  '/quiz/review':  'Review',
  '/history':      'History',
  '/leaderboard':  'Leaderboard',
  '/achievements': 'Achievements & Levels',
  '/ai':           'AI Questions',
  '/builder':      'Course Builder',
  '/brainstorm':   'Brainstorming',
  '/profile':      'My Profile',
  '/settings':     'Settings',
  '/planner':      'Study Planner',
  '/users':          'Users',
  '/courses/manage': 'Course Manager',
  '/admin':          'Admin Dashboard',
}

export { PAGE_TITLES }

export default function PageWrapper({ children, title, className = '' }) {
  const location = useLocation()
  const pushNav  = useQuizStore(s => s.pushNav)
  const pageTitle = title || PAGE_TITLES[location.pathname] || 'Quiz Academy'

  // Track navigation history for back button
  useEffect(() => {
    return () => { pushNav(location.pathname) }
  }, [location.pathname])

  useEffect(() => {
    document.title = pageTitle + ' — Quiz Academy'
  }, [pageTitle])

  return (
    <motion.div
      className={'flex flex-col gap-4 pb-24 md:pb-6 ' + className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export function PageHeader({ title, subtitle, action, showBack = false, fallback = '/dashboard' }) {
  const navigate = useNavigate()
  const popNav   = useQuizStore(s => s.popNav)

  function goBack() {
    const prev = popNav()
    if (prev) navigate(prev)
    else navigate(fallback)
  }

  return (
    <div className="flex flex-col gap-1">
      {showBack && (
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors w-fit mb-1"
        >
          <ArrowLeft size={14} /> Back
        </button>
      )}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary">{title}</h1>
          {subtitle && <p className="text-secondary text-sm mt-1">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  )
}