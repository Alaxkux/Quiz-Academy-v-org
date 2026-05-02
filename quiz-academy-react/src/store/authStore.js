import { create } from 'zustand'
import { authApi } from '../api/auth'
import { calculateSmartAverage } from '../data/levels'
import { applyTheme, getStoredTheme } from '../data/themes'

const useAuthStore = create((set, get) => ({
  user:          null,
  notifications: [],
  loading:       true,   // true during initial auth check
  initialized:   false,

  // ── INIT — call once on app mount ──
  async init() {
    try {
      const data = await authApi.me()
      const user = data.user
      // Apply user's saved theme (or fallback to localStorage)
      applyTheme(user.settings?.theme || getStoredTheme())
      set({
        user,
        notifications: user.notifications || [],
        loading:       false,
        initialized:   true,
      })
    } catch {
      set({ user: null, loading: false, initialized: true })
    }
  },

  // ── LOGIN ──
  async login(email, password, rememberMe) {
    const data = await authApi.login(email, password, rememberMe)
    applyTheme(data.user.settings?.theme || getStoredTheme())
    set({ user: data.user, notifications: data.user.notifications || [] })
    return data.user
  },

  // ── SIGNUP ──
  async signup(name, email, password) {
    const data = await authApi.signup(name, email, password)
    set({ user: data.user, notifications: [] })
    return data.user
  },

  // ── GOOGLE LOGIN ──
  async googleLogin(credential) {
    const data = await authApi.googleLogin(credential)
    applyTheme(data.user.settings?.theme || getStoredTheme())
    set({ user: data.user, notifications: data.user.notifications || [] })
    return data.user
  },

  // ── LOGOUT ──
  async logout() {
    await authApi.logout()
    set({ user: null, notifications: [] })
  },

  // ── UPDATE USER (local + sync to server) ──
  updateUser(updates) {
    const current = get().user
    if (!current) return
    const updated = { ...current, ...updates }
    // Recalculate weighted avg if history changed
    if (updates.history) {
      updated.stats = {
        ...updated.stats,
        weightedAvgScore: calculateSmartAverage(updates.history),
      }
    }
    set({ user: updated })
    // Sync to MongoDB async
    authApi.sync({
      stats:              updated.stats,
      history:            updated.history,
      achievements:       updated.achievements,
      notifications:      (updated.notifications || []).slice(0, 50),
      settings:           updated.settings,
      lastDailyChallenge: updated.lastDailyChallenge,
      bio:                updated.bio,
      avatar:             updated.avatar,
      name:               updated.name,
      isNewUser:          updated.isNewUser,
    }).catch(err => console.warn('Sync failed:', err.message))
  },

  // ── NOTIFICATIONS ──
  addNotification(message, type = 'info') {
    const n = {
      id:        Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date:      new Date().toLocaleDateString(),
    }
    const { user, notifications } = get()
    const updated = [n, ...notifications].slice(0, 50)
    set({ notifications: updated })
    if (user) {
      get().updateUser({ notifications: updated })
    }
  },

  dismissNotification(id) {
    const updated = get().notifications.filter(n => n.id !== id)
    set({ notifications: updated })
    get().updateUser({ notifications: updated })
  },

  clearNotifications() {
    set({ notifications: [] })
    get().updateUser({ notifications: [] })
  },

  // ── THEME ──
  setTheme(themeId) {
    applyTheme(themeId)
    const { user } = get()
    if (user) {
      get().updateUser({ settings: { ...user.settings, theme: themeId } })
    }
  },
}))

export default useAuthStore
