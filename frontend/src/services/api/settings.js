/**
 * Settings API
 */

import { api } from './index'

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

