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

  // ── Friends / Social ──
  // NOTE: these were previously called from Profile.jsx (and now Users.jsx)
  // but were never actually defined here, so the Friends tab silently failed.
  async getFriends() {
    return client.get('/auth/friends')
  },

  async searchUsers(q) {
    return client.get(`/auth/users/search?q=${encodeURIComponent(q)}`)
  },

  async sendFriendRequest(targetUserId) {
    return client.post('/auth/friends/request', { targetUserId })
  },

  async respondFriendRequest(fromUserId, accept) {
    return client.post('/auth/friends/respond', { fromUserId, accept })
  },

  async removeFriend(friendId) {
    return client.delete(`/auth/friends/${friendId}`)
  },

  async sendToFriend(friendId, type, data) {
    return client.post('/auth/friends/send', { friendId, type, data })
  },

  async getPublicProfile(userId) {
    return client.get(`/auth/users/${userId}/public-profile`)
  },

  async getFriendsActivity() {
    return client.get('/auth/friends/activity')
  },

  async getLeaderboard(scope = 'all') {
    return client.get(`/auth/leaderboard?scope=${scope}`)
  },
}