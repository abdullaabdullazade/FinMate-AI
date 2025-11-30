/**
 * User Stats Component
 * user_stats.html-dən bir-bir köçürülmüşdür
 * XP və Coins badge-ləri - Coin-i düzgün göstərir
 */

import React, { useState, useEffect } from 'react'
import { profileAPI, rewardsAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const UserStats = ({ user: userProp }) => {
  const { user: authUser } = useAuth()
  const [stats, setStats] = useState(null)
  
  // Use prop user or auth context user
  const user = userProp || authUser

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Try multiple endpoints to get user stats
        const [statsResponse, settingsResponse, rewardsResponse] = await Promise.allSettled([
          profileAPI.getUserStats(),
          fetch('/api/settings', { credentials: 'include' }).then(r => r.ok ? r.json() : null),
          rewardsAPI.getRewardsData().catch(() => null) // Optional - don't fail if rewards API fails
        ])
        
        let newStats = null
        
        // Get stats from stats API
        if (statsResponse.status === 'fulfilled' && statsResponse.value?.data?.user) {
          newStats = statsResponse.value.data.user
        }
        
        // Also try to get from settings API
        if (settingsResponse.status === 'fulfilled' && settingsResponse.value?.user) {
          newStats = {
            ...newStats,
            ...settingsResponse.value.user,
            coins: settingsResponse.value.user.coins ?? newStats?.coins ?? user?.coins ?? 0,
            xp_points: settingsResponse.value.user.xp_points ?? settingsResponse.value.user.xp ?? newStats?.xp_points ?? newStats?.xp ?? user?.xp_points ?? 0
          }
        }
        
        // Get coins from rewards API (most accurate source for coins)
        if (rewardsResponse.status === 'fulfilled' && rewardsResponse.value?.data?.success && rewardsResponse.value?.data?.user?.coins !== undefined) {
          if (newStats) {
            newStats.coins = rewardsResponse.value.data.user.coins
          } else {
            newStats = {
              coins: rewardsResponse.value.data.user.coins,
              xp_points: user?.xp_points ?? user?.xp ?? 0,
              level_title: user?.level_title
            }
          }
        }
        
        if (newStats) {
          setStats(newStats)
        } else if (user) {
          // If no stats from API, use user from context/prop
          setStats({
            coins: user.coins ?? 0,
            xp_points: user.xp_points ?? user.xp ?? 0,
            level_title: user.level_title
          })
        }
      } catch (error) {
        console.error('Stats fetch error:', error)
        // Fallback to user from context/prop
        if (user) {
          setStats({
            coins: user.coins ?? 0,
            xp_points: user.xp_points ?? user.xp ?? 0,
            level_title: user.level_title
          })
        }
      }
    }

    // Always fetch stats, even if user is not available yet
    fetchStats()
    // Refresh stats periodically
    const interval = setInterval(fetchStats, 30000) // Every 30 seconds
    
    // Listen for coin updates
    const handleCoinUpdate = () => {
      fetchStats()
    }
    window.addEventListener('coinUpdated', handleCoinUpdate)
    window.addEventListener('scanCompleted', handleCoinUpdate)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('coinUpdated', handleCoinUpdate)
      window.removeEventListener('scanCompleted', handleCoinUpdate)
    }
  }, [user])

  // Level emoji - user_stats.html-dən
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

  // Coin dəyərini tap - stats.coins, user.coins və ya 0 (prioritet: stats > user)
  const coins = stats?.coins !== undefined && stats?.coins !== null
    ? Number(stats.coins)
    : (user?.coins !== undefined && user?.coins !== null ? Number(user.coins) : 0)
  
  // XP dəyərini tap - stats.xp_points, user.xp_points və ya 0 (prioritet: stats > user)
  const xpPoints = stats?.xp_points !== undefined && stats?.xp_points !== null
    ? Number(stats.xp_points)
    : (stats?.xp !== undefined && stats?.xp !== null
      ? Number(stats.xp)
      : (user?.xp_points !== undefined && user?.xp_points !== null ? Number(user.xp_points) : 0))
  
  const levelTitle = stats?.level_title || user?.level_title

  // Always show in hamburger menu, hide on desktop header unless explicitly shown
  // Use a prop to control visibility
  const alwaysShow = false // Can be passed as prop if needed

  // Always render if we have any data (user or stats)
  // Don't hide completely, just show 0 if no data
  return (
    <div className={`${alwaysShow ? 'flex' : 'flex'} items-center gap-0.5 sm:gap-1`} id="user-stats-container">
      {/* XP Badge - user_stats.html sətir 6-11 - Mobile compact */}
      <div className="flex items-center gap-0.5 sm:gap-1 glass-card px-1 sm:px-1.5 py-0.5 rounded-full no-hover-effect">
        <span className="text-xs sm:text-sm leading-none">{getLevelEmoji(levelTitle)}</span>
        <span className="text-[9px] sm:text-[10px] font-bold text-white/80 leading-none">{xpPoints}</span>
      </div>
      {/* Coin Badge - user_stats.html sətir 12-16 - Mobile compact */}
      <div className="flex items-center gap-0.5 sm:gap-1 glass-card px-1 sm:px-1.5 py-0.5 rounded-full no-hover-effect">
        <span className="text-xs sm:text-sm leading-none">🪙</span>
        <span className="text-[9px] sm:text-[10px] font-bold text-yellow-400 leading-none">{coins}</span>
      </div>
    </div>
  )
}

export default UserStats
