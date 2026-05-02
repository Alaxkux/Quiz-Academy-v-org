import useAuthStore from '../store/authStore'

export function useAuth() {
  const {
    user, notifications, loading, initialized,
    init, login, signup, googleLogin, logout,
    updateUser, addNotification, dismissNotification,
    clearNotifications, setTheme,
  } = useAuthStore()

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
