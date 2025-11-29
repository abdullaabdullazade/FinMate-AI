/**
 * API Service Layer - Main Export
 * Centralized axios instance and base configuration
 */

import axios from 'axios'

// API base URL - development üçün
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Axios instance yaradırıq
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Session cookies üçün
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor - hər requestdən əvvəl işləyir
 */
api.interceptors.request.use(
  (config) => {
    // FormData göndərəndə Content-Type header-ını sil ki axios avtomatik set etsin
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    // Gələcəkdə auth token əlavə edə bilərik
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - hər responsdan sonra işləyir
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error handling
    if (!error.response) {
      // No response - network error
      if (!navigator.onLine) {
        console.error('❌ Network Error: İnternet bağlantısı yoxdur')
      } else {
        console.error('❌ Network Error: Server cavab vermir')
      }
    }
    
    // Error handling
    if (error.response?.status === 401) {
      // Unauthorized - login səhifəsinə yönləndir
      window.location.href = '/login'
    }
    
    if (error.response?.status === 404) {
      console.error('❌ 404 Error: Səhifə tapılmadı')
    }
    
    return Promise.reject(error)
  }
)

// Export all API modules
export { api, API_BASE_URL }
export { authAPI } from './auth'
export { dashboardAPI } from './dashboard'
export { chatAPI } from './chat'
export { scanAPI } from './scan'
export { expensesAPI } from './expenses'
export { profileAPI } from './profile'
export { settingsAPI } from './settings'
export { dreamVaultAPI } from './dreamVault'
export { voiceAPI } from './voice'
export { forecastAPI } from './forecast'
export { rewardsAPI } from './rewards'
export { exportAPI } from './export'

export default api

