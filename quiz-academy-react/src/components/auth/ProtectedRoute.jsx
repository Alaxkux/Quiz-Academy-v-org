import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Spinner from '../ui/Spinner'

// Guards all /dashboard, /play, /profile, etc. routes.
// Waits for the initial auth check (init()) to finish before deciding,
// so a logged-in user never gets flashed to /login on page refresh.
export default function ProtectedRoute() {
  const { isAuthenticated, initialized } = useAuth()

  if (!initialized) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}