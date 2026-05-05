import axios from 'axios'
import useAuthStore from '../store/authStore'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 15000,
})

// Attach JWT token to every request
client.interceptors.request.use(config => {
  const token = localStorage.getItem('qa_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — clear token and reset store (no hard page reload)
client.interceptors.response.use(
  res => res.data,
  err => {
    const status  = err.response?.status
    const message = err.response?.data?.error || err.message || 'Request failed'
    if (status === 401) {
      localStorage.removeItem('qa_token')
      // Reset auth state via store — triggers React Router redirect, no hard reload
      useAuthStore.setState({ user: null, notifications: [], loading: false, initialized: true })
    }
    return Promise.reject(new Error(message))
  }
)

export default client
