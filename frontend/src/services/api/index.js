/**
 * API Service Base Configuration
 * Axios instance with base URL and credentials
 */

import axios from 'axios'

// Backend base URL - development və production üçün
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8200'

// Axios instance yarat
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Session cookies üçün
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor - hər request-dən əvvəl
api.interceptors.request.use(
  (config) => {
    // FormData göndərəndə Content-Type header-ını sil
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - hər response-dan sonra
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 401 Unauthorized - logout et
    if (error.response?.status === 401) {
      // AuthContext-də logout çağırılacaq
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Export all API modules
export { authAPI } from './auth'
export { chatAPI } from './chat'
export { dashboardAPI } from './dashboard'
export { dreamVaultAPI } from './dreamVault'
export { expensesAPI } from './expenses'
export { profileAPI } from './profile'
export { rewardsAPI } from './rewards'
export { scanAPI } from './scan'
export { settingsAPI } from './settings'
export { voiceAPI } from './voice'
export { forecastAPI } from './forecast'
export { exportAPI } from './export'

// Export default olaraq da api instance
export default api
