/**
 * Chat API
 */

import { api } from './index'

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

  // Get chat history
  getChatHistory: async () => {
    return api.get('/api/chat-history')
  },
}

