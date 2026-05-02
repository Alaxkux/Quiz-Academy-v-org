import client from './client'

export const quizApi = {
  async generateAI(topic, difficulty, count) {
    return client.post('/ai/generate', { topic, difficulty, count })
  },

  async generateFromPdf(formData) {
    return client.post('/ai/from-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
}

export const historyApi = {
  async getPage(page = 1, limit = 10) {
    return client.get(`/history?page=${page}&limit=${limit}`)
  },

  async getEntry(index) {
    return client.get(`/history/${index}`)
  },

  async deleteEntry(index) {
    return client.delete(`/history/${index}`)
  },

  async clearAll() {
    return client.delete('/history')
  },
}

export const pushApi = {
  async getVapidKey() {
    return client.get('/push/vapid-public-key').catch(() => null)
  },

  async subscribe(subscription) {
    return client.post('/push/subscribe', { subscription })
  },

  async unsubscribe(endpoint) {
    return client.post('/push/unsubscribe', { endpoint })
  },

  async test() {
    return client.post('/push/test')
  },
}
