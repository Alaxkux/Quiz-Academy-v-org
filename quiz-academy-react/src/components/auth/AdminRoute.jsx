import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// Nested inside ProtectedRoute, so we already know the user is authenticated
// and initialized by the time this renders — just check the isAdmin flag.
export default function AdminRoute() {
  const { user } = useAuth()

  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}