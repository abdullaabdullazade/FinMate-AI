/**
 * Scan API
 */

import { api } from './index'

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

