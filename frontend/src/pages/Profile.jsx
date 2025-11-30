/**
 * Profile Page Component
 */

import React, { useState, useEffect } from 'react'
import { profileAPI } from '../services/api'
import { useTheme } from '../contexts/ThemeContext'
import FinancialPersonalityCard from '../components/profile/FinancialPersonalityCard'
import LevelCard from '../components/profile/LevelCard'
import StatsGrid from '../components/profile/StatsGrid'
import XPBreakdownChart from '../components/profile/XPBreakdownChart'
import RecentXPHistory from '../components/profile/RecentXPHistory'
import ExportButtons from '../components/profile/ExportButtons'
import BudgetSettings from '../components/profile/BudgetSettings'
import Subscriptions from '../components/profile/Subscriptions'
import AppInfo from '../components/profile/AppInfo'
import '../styles/pages/profile.css'

const Profile = () => {
  const { premiumTheme } = useTheme() // Theme context-dən premium theme alırıq
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await profileAPI.getProfileData()
        setProfileData(response.data)
      } catch (error) {
        console.error('Profile data fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-white/70">Məlumat yüklənə bilmədi</p>
      </div>
    )
  }

  // Theme name-i alırıq (gold, midnight, ocean, etc.)
  const themeName = premiumTheme || 'default'

  return (
    <div className="px-2 sm:px-4">
      {/* Financial Personality Card - profile.html-dəki struktur */}
      <FinancialPersonalityCard personality={profileData.personality} />

      {/* Level Card - profile.html-dəki struktur */}
      <LevelCard
        levelInfo={profileData.level_info}
        nextLevel={profileData.next_level}
        userXP={profileData.user.xp_points}
      />

      {/* Stats Grid - profile.html-dəki struktur */}
      <StatsGrid
        totalExpenses={profileData.total_expenses}
        totalSpentAllTime={profileData.total_spent_all_time}
        currency={profileData.user.currency}
      />

      {/* XP Breakdown & History - profile.html-dəki struktur */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <XPBreakdownChart xpBreakdown={profileData.xp_breakdown} theme={themeName} />
        <RecentXPHistory xpLogs={profileData.xp_logs} />
      </div>

      {/* Export Button - profile.html-dəki struktur */}
      <ExportButtons />

      {/* Budget Settings - profile.html-dəki struktur */}
      <BudgetSettings monthlyBudget={profileData.user.monthly_budget} />

      {/* Subscriptions - profile.html-dəki struktur */}
      <Subscriptions subscriptions={profileData.subscriptions} />

      {/* App Info - profile.html-dəki struktur */}
      <AppInfo />
    </div>
  )
}

export default Profile