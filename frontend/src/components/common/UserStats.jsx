/**
 * User Stats Component
 * user_stats.html-dən köçürülmüşdür
 * XP və Coins badge-ləri
 */

import React, { useState, useEffect } from 'react'
import { profileAPI } from '../../services/api'

const UserStats = ({ user }) => {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await profileAPI.getUserStats()
        if (response.data?.user) {
          setStats(response.data.user)
        }
      } catch (error) {
        console.error('Stats fetch error:', error)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  if (!user || !stats) return null

  // Level emoji
  const getLevelEmoji = (levelTitle) => {
    const emojiMap = {
      'Rookie': '🌱',
      'Saver': '💰',
      'Analyst': '📊',
      'Manager': '🎯',
      'CFO': '👑',
    }
    return emojiMap[levelTitle] || '⭐'
  }

  return (
    <div className="hidden sm:flex items-center gap-2" id="user-stats-container">
      {/* XP Badge */}
      <div className="flex items-center gap-1.5 glass-card px-2.5 py-1 rounded-full">
        <span className="text-base">{getLevelEmoji(user.level_title)}</span>
        <span className="text-xs font-bold text-white/80">{user.xp_points || stats.xp || 0}</span>
      </div>
      {/* Coin Badge */}
      <div className="flex items-center gap-1.5 glass-card px-2.5 py-1 rounded-full">
        <span className="text-base">🪙</span>
        <span className="text-xs font-bold text-yellow-400">{user.coins || 0}</span>
      </div>
    </div>
  )
}

export default UserStats
