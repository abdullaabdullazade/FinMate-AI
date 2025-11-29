/**
 * Dashboard API
 */

import { api } from './index'

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

