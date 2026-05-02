import useAuthStore from '../store/authStore'

// Each selector is separate so components only re-render when their
// specific slice changes — not on every store update.
export function useAuth() {
  const user                = useAuthStore(s => s.user)
  const notifications       = useAuthStore(s => s.notifications)
  const loading             = useAuthStore(s => s.loading)
  const initialized         = useAuthStore(s => s.initialized)
  const init                = useAuthStore(s => s.init)
  const login               = useAuthStore(s => s.login)
  const signup              = useAuthStore(s => s.signup)
  const googleLogin         = useAuthStore(s => s.googleLogin)
  const logout              = useAuthStore(s => s.logout)
  const updateUser          = useAuthStore(s => s.updateUser)
  const addNotification     = useAuthStore(s => s.addNotification)
  const dismissNotification = useAuthStore(s => s.dismissNotification)
  const clearNotifications  = useAuthStore(s => s.clearNotifications)
  const setTheme            = useAuthStore(s => s.setTheme)

  const isAuthenticated = !!user

  return {
    user,
    notifications,
    loading,
    initialized,
    isAuthenticated,
    init,
    login,
    signup,
    googleLogin,
    logout,
    updateUser,
    addNotification,
    dismissNotification,
    clearNotifications,
    setTheme,
  }
}
