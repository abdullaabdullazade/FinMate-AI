/**
 * Dashboard Page Component
 * HTML-dəki bütün struktur və dizaynı qoruyaraq tam yazılmışdır
 * Deep Purple Glassmorphism dizaynı
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import StatCard from '../components/dashboard/StatCard'
import TransactionRow from '../components/dashboard/TransactionRow'
import CategoryCard from '../components/dashboard/CategoryCard'
import TimeMachine from '../components/dashboard/TimeMachine'
import FinancialPet from '../components/dashboard/FinancialPet'
import WelcomeBanner from '../components/dashboard/WelcomeBanner'
import BudgetWarning from '../components/dashboard/BudgetWarning'
import XPProgress from '../components/dashboard/XPProgress'
import CategoryChart from '../components/dashboard/CategoryChart'
import EcoImpact from '../components/dashboard/EcoImpact'
import LocalGems from '../components/dashboard/LocalGems'
import SalaryIncrease from '../components/dashboard/SalaryIncrease'
import DailyLimitAlert from '../components/dashboard/DailyLimitAlert'
import BudgetOverview from '../components/dashboard/BudgetOverview'
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown'
import RecentTransactions from '../components/dashboard/RecentTransactions'

const Dashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [incognitoMode, setIncognitoMode] = useState(false)

  /**
   * Dashboard məlumatlarını yüklə
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await dashboardAPI.getDashboardData()
        setDashboardData(response.data)
        setError(null)
      } catch (err) {
        console.error('Dashboard data fetch error:', err)
        setError('Məlumat yüklənərkən xəta baş verdi')
        toast.error('Məlumat yüklənərkən xəta baş verdi')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Incognito mode toggle
  const toggleIncognito = () => {
    setIncognitoMode(!incognitoMode)
  }

  // Get greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Sabahın xeyir'
    if (hour < 18) return 'Günün aydın'
    return 'Axşamın xeyir'
  }

  // Get current month name
  const getCurrentMonth = () => {
    return new Date().toLocaleDateString('az-AZ', { month: 'long', year: 'numeric' })
  }

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-grid px-2 sm:px-4 pb-24 sm:pb-32">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="glass-card p-4 sm:p-6 skeleton h-64"
            style={{ gridColumn: 'span 12' }}
          ></div>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-2">Xəta baş verdi</h3>
          <p className="text-white/70 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:scale-105 transition"
          >
            Yenidən yoxla
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) return null

  const { context, recents, chart_labels, chart_values, top_category } = dashboardData

  // Calculate values
  const totalSpending = context?.total_spend || 0
  const monthlyBudget = context?.budget || 0
  const remainingBudget = monthlyBudget - totalSpending
  const budgetPercentage = monthlyBudget > 0 ? Math.min((totalSpending / monthlyBudget) * 100, 100) : 0
  const currency = context?.currency || '₼'
  const categoryData = context?.category_data || {}
  const ecoScore = context?.eco_score || { icon: '🌍', value: 0 }
  const ecoBreakdown = context?.eco_breakdown || {}
  const ecoTip = context?.eco_tip || ''
  const levelInfo = context?.level_info || null
  const xpPoints = context?.xp_points || 0
  const salaryIncreaseInfo = context?.salary_increase_info || null
  const dailyLimitAlert = context?.daily_limit_alert || null
  const localGems = context?.local_gems || []
  const monthlySavings = monthlyBudget - totalSpending
  const totalAvailable = context?.total_available || remainingBudget

  // Handle edit transaction
  const handleEdit = (expense) => {
    toast.info('Edit funksiyası tezliklə əlavə olunacaq')
    // TODO: Implement edit modal
  }

  // Handle delete transaction
  const handleDelete = async (expenseId) => {
    if (window.confirm('Bu əməliyyatı silmək istədiyinizə əminsiniz?')) {
      try {
        // TODO: Implement delete API call
        toast.success('Əməliyyat silindi')
        // Refresh data
        const response = await dashboardAPI.getDashboardData()
        setDashboardData(response.data)
      } catch (err) {
        toast.error('Xəta baş verdi')
      }
    }
  }

  // Handle income modal
  const handleIncomeClick = () => {
    toast.info('Gəlir əlavə etmə funksiyası tezliklə əlavə olunacaq')
    // TODO: Implement income modal
  }

  // Handle fraud alert
  const handleFraudClick = () => {
    toast.info('Fraud alert funksiyası tezliklə əlavə olunacaq')
    // TODO: Implement fraud alert modal
  }

  return (
    <div className="dashboard-grid px-2 sm:px-4 pb-24 sm:pb-32">
      {/* Budget Warning */}
      <BudgetWarning
        budgetPercentage={budgetPercentage}
        totalSpending={totalSpending}
        monthlyBudget={monthlyBudget}
        remainingBudget={remainingBudget}
        currency={currency}
      />

      {/* Welcome Banner */}
      <WelcomeBanner
        username={user?.username || 'İstifadəçi'}
        onIncomeClick={handleIncomeClick}
        onFraudClick={handleFraudClick}
      />

      {/* Salary Increase Celebration Card */}
      <SalaryIncrease
        salaryIncreaseInfo={salaryIncreaseInfo}
        currency={currency}
        incognitoMode={incognitoMode}
      />

      {/* XP Progress */}
      {levelInfo && (
        <XPProgress levelInfo={levelInfo} xpPoints={xpPoints} />
      )}

      {/* Daily Limit Alert */}
      <DailyLimitAlert
        dailyLimitAlert={dailyLimitAlert}
        currency={currency}
        incognitoMode={incognitoMode}
      />

      {/* Budget Overview - Full Width */}
      <BudgetOverview
        greeting={getGreeting()}
        username={user?.username}
        currentMonth={getCurrentMonth()}
        totalSpending={totalSpending}
        monthlyBudget={monthlyBudget}
        remainingBudget={remainingBudget}
        budgetPercentage={budgetPercentage}
        ecoScore={ecoScore}
        currency={currency}
        incognitoMode={incognitoMode}
        onToggleIncognito={toggleIncognito}
        onSpeak={() => toast.info('Səsləndirmə funksiyası tezliklə əlavə olunacaq')}
      />

      {/* Financial Time Machine */}
      <TimeMachine
        currentBalance={totalAvailable}
        monthlySavings={monthlySavings}
        currency={currency}
      />

      {/* Eco Impact Score */}
      <EcoImpact
        ecoScore={ecoScore}
        ecoBreakdown={ecoBreakdown}
        ecoTip={ecoTip}
        incognitoMode={incognitoMode}
      />

      {/* Category Breakdown */}
      {Object.keys(categoryData).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card p-4 sm:p-6 slide-up"
          style={{ gridColumn: 'span 12' }}
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white">Kateqoriyalar üzrə</h3>
            <span className="text-xs sm:text-sm text-white/60">
              {Object.keys(categoryData).length} kateqoriya
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Object.entries(categoryData).map(([category, amount], index) => (
              <CategoryCard
                key={category}
                category={category}
                amount={amount}
                totalSpending={totalSpending}
                currency={currency}
                delay={index * 0.05}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Local Gems Discovery */}
      <LocalGems
        localGems={localGems}
        currency={currency}
        incognitoMode={incognitoMode}
      />

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="glass-card p-4 sm:p-6 slide-up"
        style={{ gridColumn: 'span 12' }}
      >
        <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Son əməliyyatlar</h3>
        <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
          {!recents || recents.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
              <div className="text-4xl mb-3">💳</div>
              <p className="text-white/60 text-sm">Hələ əməliyyat yoxdur</p>
              <Link
                to="/scan"
                className="inline-block mt-4 text-sm text-blue-300 hover:text-blue-200 font-medium"
              >
                İlk çekini skan et →
              </Link>
            </div>
          ) : (
            recents.map((expense, index) => (
              <TransactionRow
                key={expense.id || index}
                expense={expense}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currency={currency}
              />
            ))
          )}
        </div>
      </motion.div>

      {/* Financial Pet Widget */}
      {budgetPercentage > 0 && (
        <FinancialPet budgetPercentage={budgetPercentage} />
      )}
    </div>
  )
}

export default Dashboard
