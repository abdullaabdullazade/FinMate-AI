/**
 * Dashboard API
 */

import { api } from './index'

export const dashboardAPI = {
  // Dashboard data
  getDashboardData: async (filterValue = null, filterType = null, rangeStart = null, rangeEnd = null) => {
    const params = {}
    if (filterValue && filterType) {
      if (filterType === 'day') {
        params.date = filterValue
      } else if (filterType === 'month') {
        params.month = filterValue
      } else if (filterType === 'year') {
        params.year = filterValue
      }
    }
    // Range filter
    if (filterType === 'range' && rangeStart && rangeEnd) {
      params.start_date = rangeStart
      params.end_date = rangeEnd
    }
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

