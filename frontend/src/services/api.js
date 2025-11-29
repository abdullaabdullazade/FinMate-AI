/**
 * API Service Layer
 * Backend API ilə əlaqə üçün mərkəzləşdirilmiş service
 * Bütün API çağırışları buradan keçir
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
    // Error handling
    if (error.response?.status === 401) {
      // Unauthorized - login səhifəsinə yönləndir
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/**
 * Authentication API
 */
export const authAPI = {
  // Login
  login: async (username, password) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    return api.post('/api/login', formData)
  },

  // Signup
  signup: async (username, password, email) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    formData.append('email', email || '')
    return api.post('/api/signup', formData)
  },

  // Logout
  logout: async () => {
    return api.get('/logout')
  },
}

/**
 * Dashboard API
 */
export const dashboardAPI = {
  // Dashboard data
  getDashboardData: async () => {
    return api.get('/api/dashboard-data')
  },

  // Dashboard stats
  getDashboardStats: async () => {
    return api.get('/api/dashboard-stats')
  },

  // Dashboard updates
  getDashboardUpdates: async () => {
    return api.get('/api/dashboard-updates')
  },
}

/**
 * Chat API
 */
export const chatAPI = {
  // Send message
  sendMessage: async (message) => {
    const formData = new FormData()
    formData.append('message', message)
    // FormData göndərəndə Content-Type silinir - axios avtomatik set edir
    return api.post('/api/chat', formData, {
      headers: {
        'Accept': 'application/json',
        'X-Client-Appended': 'true',
        // Content-Type header-ı silinir - axios FormData üçün avtomatik set edir
      },
    })
  },
}

/**
 * Scan API
 */
export const scanAPI = {
  // Scan receipt
  scanReceipt: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/scan-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Confirm receipt
  confirmReceipt: async (receiptData) => {
    return api.post('/api/confirm-receipt', receiptData)
  },
}

/**
 * Expenses API
 */
export const expensesAPI = {
  // Add expense
  addExpense: async (expenseData) => {
    const formData = new FormData()
    Object.keys(expenseData).forEach((key) => {
      formData.append(key, expenseData[key])
    })
    return api.post('/api/expense', formData)
  },

  // Update expense
  updateExpense: async (expenseId, expenseData) => {
    return api.put(`/api/expenses/${expenseId}`, expenseData)
  },

  // Delete expense
  deleteExpense: async (expenseId) => {
    return api.delete(`/api/expenses/${expenseId}`)
  },
}

/**
 * Profile API
 */
export const profileAPI = {
  // Get user stats
  getUserStats: async () => {
    return api.get('/api/stats')
  },

  // Get profile data - personality, level, xp breakdown, subscriptions
  getProfileData: async () => {
    return api.get('/api/profile-data')
  },
}

/**
 * Settings API
 */
export const settingsAPI = {
  // Get settings
  getSettings: async () => {
    return api.get('/api/settings')
  },

  // Update settings - accepts FormData
  updateSettings: async (settings) => {
    // settings can be FormData or object
    if (settings instanceof FormData) {
      return api.post('/api/settings', settings, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    }
    // If object, convert to FormData
    const formData = new FormData()
    Object.keys(settings).forEach((key) => {
      if (settings[key] !== null && settings[key] !== undefined) {
        formData.append(key, settings[key])
      }
    })
    return api.post('/api/settings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Set budget
  setBudget: async (budget) => {
    const formData = new FormData()
    formData.append('budget', budget)
    return api.post('/api/set-budget', formData)
  },
}

/**
 * Dream Vault API
 */
export const dreamVaultAPI = {
  // Get dreams - JSON endpoint
  getDreams: async () => {
    return api.get('/api/dreams', {
      headers: {
        'Accept': 'application/json',
      },
    })
  },

  // Create dream
  createDream: async (dreamData) => {
    // dreamData can be FormData or object
    if (dreamData instanceof FormData) {
      return api.post('/api/dreams', dreamData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    }
    // If object, convert to FormData
    const formData = new FormData()
    Object.keys(dreamData).forEach((key) => {
      if (dreamData[key] !== null && dreamData[key] !== undefined && dreamData[key] !== '') {
        formData.append(key, dreamData[key])
      }
    })
    return api.post('/api/dreams', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Update dream
  updateDream: async (dreamId, dreamData) => {
    // dreamData can be FormData or object
    if (dreamData instanceof FormData) {
      return api.put(`/api/dreams/${dreamId}`, dreamData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    }
    return api.put(`/api/dreams/${dreamId}`, dreamData)
  },

  // Delete dream
  deleteDream: async (dreamId) => {
    return api.delete(`/api/dreams/${dreamId}`, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
  },

  // Add savings to dream
  addSavings: async (dreamId, amount) => {
    const formData = new FormData()
    formData.append('amount', amount)
    return api.post(`/api/dreams/${dreamId}/add-savings`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Get dream stats
  getDreamStats: async () => {
    return api.get('/api/dream-stats', {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
  },
}

/**
 * Voice API
 */
export const voiceAPI = {
  // Voice command
  sendVoiceCommand: async (audioFile) => {
    const formData = new FormData()
    formData.append('audio', audioFile)
    return api.post('/api/voice-command', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Confirm voice
  confirmVoice: async (voiceData) => {
    return api.post('/api/confirm-voice', voiceData)
  },

  // Text to speech
  textToSpeech: async (text, language = 'az') => {
    const formData = new FormData()
    formData.append('text', text)
    formData.append('language', language)
    return api.post('/api/tts', formData)
  },
}

/**
 * Forecast API
 */
export const forecastAPI = {
  // Get forecast
  getForecast: async () => {
    return api.get('/api/forecast')
  },

  // Get forecast chart
  getForecastChart: async () => {
    return api.get('/api/forecast-chart')
  },
}

/**
 * Rewards API
 */
export const rewardsAPI = {
  // Get rewards data
  getRewardsData: async () => {
    return api.get('/api/rewards-data')
  },

  // Claim reward - rewards.html-dəki kimi
  claimReward: async (rewardType) => {
    const formData = new FormData()
    formData.append('reward_type', rewardType)
    return api.post('/api/claim-reward', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },
}

/**
 * Export API
 */
export const exportAPI = {
  // Export to Excel
  exportToExcel: async () => {
    return api.get('/api/export-xlsx', {
      responseType: 'blob',
    })
  },

  // Export to PDF
  exportToPDF: async () => {
    return api.get('/api/export-pdf', {
      responseType: 'blob',
    })
  },
}

export default api

