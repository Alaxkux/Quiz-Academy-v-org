import client from './client'

export const authApi = {
  async login(email, password, rememberMe = false) {
    const data = await client.post('/auth/login', { email, password, rememberMe })
    if (data.token) localStorage.setItem('qa_token', data.token)
    return data
  },

  async signup(name, email, password) {
    const data = await client.post('/auth/signup', { name, email, password })
    if (data.token) localStorage.setItem('qa_token', data.token)
    return data
  },

  async googleLogin(credential) {
    const data = await client.post('/auth/google', { credential })
    if (data.token) localStorage.setItem('qa_token', data.token)
    return data
  },

  async logout() {
    await client.post('/auth/logout').catch(() => {})
    localStorage.removeItem('qa_token')
  },

  async me() {
    return client.get('/auth/me')
  },

  async updateProfile(data) {
    return client.put('/auth/me', data)
  },

  async sync(userData) {
    return client.post('/auth/sync', userData).catch(err => {
      console.warn('Sync failed:', err.message)
    })
  },

  async getLeaderboard() {
    return client.get('/auth/leaderboard')
  },

  async forgotPassword(email) {
    return client.post('/auth/forgot-password', { email })
  },

  async resetPassword(token, password) {
    return client.post('/auth/reset-password', { token, password })
  },

  async changePassword({ currentPassword, newPassword }) {
    return client.post('/auth/change-password', { currentPassword, newPassword })
  },

  async getConfig() {
    return client.get('/auth/config').catch(() => ({}))
  },
}