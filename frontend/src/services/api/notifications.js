/**
 * Notifications API Service
 * Backend notifications.py ilə işləyir
 */

import { api } from './index'

export const notificationsAPI = {
  /**
   * Get user notifications from backend
   * @returns {Promise<{notifications: Array}>}
   */
  async getNotifications() {
    try {
      const response = await api.get('/api/notifications')
      return response.data
    } catch (error) {
      console.error('Notifications fetch error:', error)
      throw error
    }
  },
}

