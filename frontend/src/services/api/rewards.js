/**
 * Rewards API
 */

import { api } from './index'

export const rewardsAPI = {
  // Get rewards data
  getRewardsData: async () => {
    return api.get('/api/rewards-data')
  },

  // Claim reward - rewards.html-dəki kimi
  claimReward: async (rewardType) => {
    const formData = new FormData()
    formData.append('reward_type', rewardType)
    return api.post('/api/claim-reward', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },
}

