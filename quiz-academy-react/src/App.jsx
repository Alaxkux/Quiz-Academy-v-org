import React, { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { applyTheme, getStoredTheme } from './data/themes'
import AppShell from './components/layout/AppShell'
import Spinner from './components/ui/Spinner'

// ── Auth pages (small — load immediately) ──
import LandingPage  from './pages/auth/LandingPage'
import LoginPage    from './pages/auth/LoginPage'
import SignupPage   from './pages/auth/SignupPage'
import ForgotPage   from './pages/auth/ForgotPage'
import ResetPage    from './pages/auth/ResetPage'

// ── App pages (lazy loaded) ──
const Dashboard    = lazy(() => import('./pages/app/Dashboard'))
const Categories   = lazy(() => import('./pages/app/Categories'))
const Play         = lazy(() => import('./pages/app/Play'))
const QuizConfig   = lazy(() => import('./pages/app/QuizConfig'))
const QuizEngine   = lazy(() => import('./pages/app/QuizEngine'))
const Results      = lazy(() => import('./pages/app/Results'))
const Review       = lazy(() => import('./pages/app/Review'))
const History      = lazy(() => import('./pages/app/History'))
const Leaderboard  = lazy(() => import('./pages/app/Leaderboard'))
const Achievements = lazy(() => import('./pages/app/Achievements'))
const AIGenerator  = lazy(() => import('./pages/app/AIGenerator'))
const CourseBuilder = lazy(() => import('./pages/app/CourseBuilder'))
const Brainstorm   = lazy(() => import('./pages/app/Brainstorm'))
const Profile      = lazy(() => import('./pages/app/Profile'))
const Settings     = lazy(() => import('./pages/app/Settings'))
const StudyPlanner = lazy(() => import('./pages/app/StudyPlanner'))
const Users        = lazy(() => import('./pages/app/Users'))
const CourseManager  = lazy(() => import('./pages/app/CourseManager'))
const AdminDashboard = lazy(() => import('./pages/app/AdminDashboard'))

// ── Page loading fallback ──
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  )
}

// ── Auth guard ──
function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="flex items-center justify-center h-screen bg-bg0"><Spinner size="lg" /></div>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

// ── Admin guard (redirect non-admins to dashboard) ──
function RequireAdmin({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen bg-bg0"><Spinner size="lg" /></div>
  if (!user?.isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

// ── Guest guard (redirect logged-in users away from auth pages) ──
function GuestOnly({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { init, loading } = useAuth()

  useEffect(() => {
    // Apply stored theme immediately on mount (before API call resolves)
    applyTheme(getStoredTheme())
    // Initialize auth (fetches /me, sets user, sets loading:false)
    init()
  }, [])

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center h-screen gap-5"
        style={{ background: 'var(--bg0)' }}
      >
        {/* Loading screen */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-black text-2xl text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--green))' }}
        >
          Q
        </div>
        <div className="font-display font-bold text-xl text-primary">Quiz Academy</div>
        <div
          className="w-40 h-0.5 rounded overflow-hidden"
          style={{ background: 'var(--border)' }}
        >
          <div
            className="h-full rounded animate-[loadBar_1.8s_ease_forwards]"
            style={{ background: 'linear-gradient(90deg, var(--accent), var(--green))' }}
          />
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* ── Public / Auth routes ── */}
      <Route path="/" element={<GuestOnly><LandingPage /></GuestOnly>} />
      <Route path="/login"          element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/signup"         element={<GuestOnly><SignupPage /></GuestOnly>} />
      <Route path="/forgot-password" element={<GuestOnly><ForgotPage /></GuestOnly>} />
      <Route path="/reset-password" element={<ResetPage />} />

      {/* ── Protected app routes ── */}
      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route path="/dashboard"   element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="/categories"  element={<Suspense fallback={<PageLoader />}><Categories /></Suspense>} />
        <Route path="/play"        element={<Suspense fallback={<PageLoader />}><Play /></Suspense>} />
        <Route path="/quiz/config" element={<Suspense fallback={<PageLoader />}><QuizConfig /></Suspense>} />
        <Route path="/quiz/active" element={<Suspense fallback={<PageLoader />}><QuizEngine /></Suspense>} />
        <Route path="/quiz/results" element={<Suspense fallback={<PageLoader />}><Results /></Suspense>} />
        <Route path="/quiz/review" element={<Suspense fallback={<PageLoader />}><Review /></Suspense>} />
        <Route path="/history"     element={<Suspense fallback={<PageLoader />}><History /></Suspense>} />
        <Route path="/leaderboard" element={<Suspense fallback={<PageLoader />}><Leaderboard /></Suspense>} />
        <Route path="/achievements" element={<Suspense fallback={<PageLoader />}><Achievements /></Suspense>} />
        <Route path="/ai"          element={<Suspense fallback={<PageLoader />}><AIGenerator /></Suspense>} />
        <Route path="/builder"     element={<Suspense fallback={<PageLoader />}><CourseBuilder /></Suspense>} />
        <Route path="/brainstorm"  element={<Suspense fallback={<PageLoader />}><Brainstorm /></Suspense>} />
        <Route path="/profile"     element={<Suspense fallback={<PageLoader />}><Profile /></Suspense>} />
        <Route path="/settings"    element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
        <Route path="/planner"     element={<Suspense fallback={<PageLoader />}><StudyPlanner /></Suspense>} />
        <Route path="/users"          element={<Suspense fallback={<PageLoader />}><Users /></Suspense>} />
        <Route path="/courses/manage" element={<RequireAdmin><Suspense fallback={<PageLoader />}><CourseManager /></Suspense></RequireAdmin>} />
        <Route path="/admin" element={<RequireAdmin><Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense></RequireAdmin>} />
      </Route>

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}