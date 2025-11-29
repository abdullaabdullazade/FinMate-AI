/**
 * Dashboard API
 */

import { api } from './index'

export const dashboardAPI = {
  // Dashboard data
  getDashboardData: async (date = null) => {
    const params = date ? { date } : {}
    return api.get('/api/dashboard-data', { params })
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

