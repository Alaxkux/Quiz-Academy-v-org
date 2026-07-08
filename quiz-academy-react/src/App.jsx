import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ScrollToTop from './components/layout/ScrollToTop'
import AutoLogout from './components/layout/AutoLogout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import AppShell from './components/layout/AppShell'
import OfflineIndicator from './components/ui/OfflineIndicator'
import { useAuth } from './hooks/useAuth'

// ── Eagerly loaded (auth + landing — needed immediately) ──
import LandingPage  from './pages/auth/LandingPage'
import LoginPage    from './pages/auth/LoginPage'
import SignupPage   from './pages/auth/SignupPage'

// ── Lazy loaded (only when navigated to) ──
const Dashboard      = lazy(() => import('./pages/app/Dashboard'))
const Categories     = lazy(() => import('./pages/app/Categories'))
const Play           = lazy(() => import('./pages/app/Play'))
const QuizConfig     = lazy(() => import('./pages/app/QuizConfig'))
const QuizEngine     = lazy(() => import('./pages/app/QuizEngine'))
const Results        = lazy(() => import('./pages/app/Results'))
const Review         = lazy(() => import('./pages/app/Review'))
const History        = lazy(() => import('./pages/app/History'))
const Leaderboard    = lazy(() => import('./pages/app/Leaderboard'))
const Achievements   = lazy(() => import('./pages/app/Achievements'))
const Profile        = lazy(() => import('./pages/app/Profile'))
const Settings       = lazy(() => import('./pages/app/Settings'))
const StudyPlanner   = lazy(() => import('./pages/app/StudyPlanner'))
const CourseBuilder  = lazy(() => import('./pages/app/CourseBuilder'))
const CourseManager  = lazy(() => import('./pages/app/CourseManager'))
const AIGenerator    = lazy(() => import('./pages/app/AIGenerator'))
const Brainstorm     = lazy(() => import('./pages/app/Brainstorm'))
const AdminDashboard = lazy(() => import('./pages/app/AdminDashboard'))
const Users          = lazy(() => import('./pages/app/Users'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPage'))
const ResetPassword  = lazy(() => import('./pages/auth/ResetPage'))
const SharedQuiz     = lazy(() => import('./pages/app/SharedQuiz'))

// ── Skeleton fallback ──
function PageSkeleton() {
  return (
    <div className="flex-1 p-5 flex flex-col gap-4 animate-pulse">
      <div className="h-8 w-48 rounded-2xl" style={{ background: 'var(--bg2)' }} />
      <div className="h-4 w-64 rounded-xl" style={{ background: 'var(--bg2)' }} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl" style={{ background: 'var(--bg2)' }} />
        ))}
      </div>
      <div className="h-40 rounded-2xl mt-2" style={{ background: 'var(--bg2)' }} />
    </div>
  )
}

export default function App() {
  const { init } = useAuth()

  // Run the initial auth check once, on app mount — this hits /auth/me
  // and sets initialized:true, which ProtectedRoute waits for.
  useEffect(() => {
    init()
  }, [init])

  return (
    <>
      <ScrollToTop />
    <OfflineIndicator />
      <AutoLogout />
      <Routes>
        {/* ── Public ── */}
        <Route path="/"              element={<LandingPage />} />
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/signup"        element={<SignupPage />} />
        <Route path="/forgot-password" element={<Suspense fallback={null}><ForgotPassword /></Suspense>} />
        <Route path="/reset-password"  element={<Suspense fallback={null}><ResetPassword /></Suspense>} />

        {/* ── Public shared quiz ── */}
        <Route path="/quiz/shared/:token" element={<Suspense fallback={<PageSkeleton />}><SharedQuiz /></Suspense>} />

        {/* ── Protected app routes ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard"    element={<Suspense fallback={<PageSkeleton />}><Dashboard /></Suspense>} />
            <Route path="/categories"   element={<Suspense fallback={<PageSkeleton />}><Categories /></Suspense>} />
            <Route path="/play"         element={<Suspense fallback={<PageSkeleton />}><Play /></Suspense>} />
            <Route path="/quiz/config"  element={<Suspense fallback={<PageSkeleton />}><QuizConfig /></Suspense>} />
            <Route path="/quiz/active"  element={<Suspense fallback={<PageSkeleton />}><QuizEngine /></Suspense>} />
            <Route path="/quiz/results" element={<Suspense fallback={<PageSkeleton />}><Results /></Suspense>} />
            <Route path="/quiz/review"  element={<Suspense fallback={<PageSkeleton />}><Review /></Suspense>} />
            <Route path="/history"      element={<Suspense fallback={<PageSkeleton />}><History /></Suspense>} />
            <Route path="/leaderboard"  element={<Suspense fallback={<PageSkeleton />}><Leaderboard /></Suspense>} />
            <Route path="/achievements" element={<Suspense fallback={<PageSkeleton />}><Achievements /></Suspense>} />
            <Route path="/profile"      element={<Suspense fallback={<PageSkeleton />}><Profile /></Suspense>} />
            <Route path="/settings"     element={<Suspense fallback={<PageSkeleton />}><Settings /></Suspense>} />
            <Route path="/planner"      element={<Suspense fallback={<PageSkeleton />}><StudyPlanner /></Suspense>} />
            <Route path="/builder"      element={<Suspense fallback={<PageSkeleton />}><CourseBuilder /></Suspense>} />
            <Route path="/courses/manage" element={<Suspense fallback={<PageSkeleton />}><CourseManager /></Suspense>} />
            <Route path="/ai"           element={<Suspense fallback={<PageSkeleton />}><AIGenerator /></Suspense>} />
            <Route path="/brainstorm"   element={<Suspense fallback={<PageSkeleton />}><Brainstorm /></Suspense>} />
            <Route path="/users"        element={<Suspense fallback={<PageSkeleton />}><Users /></Suspense>} />
            {/* ── Admin ── */}
            <Route element={<AdminRoute />}>
              <Route path="/admin"        element={<Suspense fallback={<PageSkeleton />}><AdminDashboard /></Suspense>} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}