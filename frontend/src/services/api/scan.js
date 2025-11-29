/**
 * Scan API
 */

import { api } from './index'

// Helper function to get Azerbaijan time
const getAzTime = () => {
  try {
    const now = new Date()
    const utc = now.getTime() + now.getTimezoneOffset() * 60000
    return new Date(utc + 4 * 3600000).toISOString()
  } catch (e) {
    console.error('getAzTime error:', e)
    return new Date().toISOString()
  }
}

export const scanAPI = {
  // Scan receipt
  scanReceipt: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/scan-receipt', formData, {
      headers: {
        'X-Client-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        'X-Client-Date': getAzTime(),
        'Accept': 'application/json',
        'X-Client-Appended': 'true',
        // Content-Type will be set automatically by axios for FormData
      },
    })
  },

  // Confirm receipt
  confirmReceipt: async (receiptData) => {
    const formData = new FormData()
    Object.keys(receiptData).forEach((key) => {
      formData.append(key, receiptData[key])
    })
    return api.post('/api/confirm-receipt', formData, {
      headers: {
        'Accept': 'application/json',
      },
    })
  },
}

