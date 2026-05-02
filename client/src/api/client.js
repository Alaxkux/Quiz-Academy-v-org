import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15000,
})

// Attach JWT token to every request
client.interceptors.request.use(config => {
  const token = localStorage.getItem('qa_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — clear token and redirect to login
client.interceptors.response.use(
  res => res.data,
  err => {
    const status = err.response?.status
    const message = err.response?.data?.error || err.message || 'Request failed'
    if (status === 401) {
      localStorage.removeItem('qa_token')
      window.location.href = '/login'
    }
    return Promise.reject(new Error(message))
  }
)

export default client
