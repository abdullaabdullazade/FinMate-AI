/**
 * Dream Vault API
 */

import { api } from './index'

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

