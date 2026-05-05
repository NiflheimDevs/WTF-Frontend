import axios from 'axios'

// Base instance — all API calls go through this
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
})

// ── Request interceptor ────────────────────────────────────────────
// Automatically attaches the JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dispatcher_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ───────────────────────────────────────────
// Handles token expiry and redirects to login automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear session and redirect
      localStorage.removeItem('dispatcher_token')
      localStorage.removeItem('dispatcher_user')
      window.location.href = '/dispatcher/login'
    }
    return Promise.reject(error)
  }
)

export default api