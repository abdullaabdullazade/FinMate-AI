/**
 * Profile API
 */

import { api } from './index'

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

