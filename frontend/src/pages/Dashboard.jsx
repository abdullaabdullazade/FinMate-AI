/**
 * Dashboard Page Component
 * HTML/CSS-dən tam köçürülmüş - Bütün komponentlər səliqəli şəkildə bölünmüşdür
 * Deep Purple Glassmorphism dizaynı
 */

import React, { useState, useEffect } from 'react'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

// Dashboard Components
import BudgetWarning from '../components/dashboard/BudgetWarning'
import WelcomeBanner from '../components/dashboard/WelcomeBanner'
import SalaryIncrease from '../components/dashboard/SalaryIncrease'
import XPProgress from '../components/dashboard/XPProgress'
import DailyLimitAlert from '../components/dashboard/DailyLimitAlert'
import BudgetOverview from '../components/dashboard/BudgetOverview'
import TimeMachine from '../components/dashboard/TimeMachine'
import EcoImpact from '../components/dashboard/EcoImpact'
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown'
import LocalGems from '../components/dashboard/LocalGems'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import FinancialPet from '../components/dashboard/FinancialPet'
import EditTransactionModal from '../components/dashboard/EditTransactionModal'
import IncomeModal from '../components/dashboard/IncomeModal'
import FraudAlertModal from '../components/dashboard/FraudAlertModal'

const Dashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [incognitoMode, setIncognitoMode] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [incomeModalOpen, setIncomeModalOpen] = useState(false)
  const [fraudModalOpen, setFraudModalOpen] = useState(false)

  /**
   * Dashboard məlumatlarını yüklə
   */
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

  useEffect(() => {
    fetchDashboardData()

    // Event listeners for refresh
    const handleExpenseUpdate = () => {
      console.log('🔄 Expense updated, refreshing dashboard...')
      fetchDashboardData()
    }

    const handleIncomeUpdate = () => {
      console.log('💰 Income updated, refreshing dashboard...')
      fetchDashboardData()
    }

    const handleScanComplete = () => {
      console.log('📸 Scan completed, refreshing dashboard...')
      fetchDashboardData()
    }

    // Listen for custom events
    window.addEventListener('expenseUpdated', handleExpenseUpdate)
    window.addEventListener('incomeUpdated', handleIncomeUpdate)
    window.addEventListener('scanCompleted', handleScanComplete)
    window.addEventListener('expensesUpdated', handleExpenseUpdate) // For HTMX compatibility

    return () => {
      window.removeEventListener('expenseUpdated', handleExpenseUpdate)
      window.removeEventListener('incomeUpdated', handleIncomeUpdate)
      window.removeEventListener('scanCompleted', handleScanComplete)
      window.removeEventListener('expensesUpdated', handleExpenseUpdate)
    }
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

  // Get current month name - "11 noyabr 2025" formatında
  const getCurrentMonth = () => {
    const now = new Date()
    const day = now.getDate()
    const month = now.toLocaleDateString('az-AZ', { month: 'long' })
    const year = now.getFullYear()
    return `${day} ${month} ${year}`
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
    setEditingExpense(expense)
    setEditModalOpen(true)
  }

  // Handle edit save
  const handleEditSave = async () => {
    // Refresh data after edit
    await fetchDashboardData()
  }

  // Handle delete transaction
  const handleDelete = async (expenseId) => {
    if (window.confirm('Bu əməliyyatı silmək istədiyinizə əminsiniz?')) {
      try {
        const response = await fetch(`/api/expenses/${expenseId}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        })

        if (response.ok) {
          toast.success('Əməliyyat silindi')
          // Refresh data
          await fetchDashboardData()
        } else {
          toast.error('Xəta baş verdi')
        }
      } catch (err) {
        console.error('Delete error:', err)
        toast.error('Xəta baş verdi')
      }
    }
  }

  // Handle income modal
  const handleIncomeClick = () => {
    setIncomeModalOpen(true)
  }

  // Handle income success
  const handleIncomeSuccess = async () => {
    // Refresh data after income added
    await fetchDashboardData()
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('incomeUpdated'))
  }

  // Handle fraud alert
  const handleFraudClick = () => {
    setFraudModalOpen(true)
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
        onSpeak={async () => {
          try {
            // Convert numbers to Azerbaijani words (manat/qəpik format)
            let totalSpendingText = totalSpending.toFixed(2) + ' ' + currency
            let monthlyBudgetText = monthlyBudget.toFixed(2) + ' ' + currency
            let remainingBudgetText = remainingBudget.toFixed(2) + ' ' + currency
            
            if (typeof window.numberToAzerbaijani === 'function') {
              totalSpendingText = window.numberToAzerbaijani(totalSpending)
              monthlyBudgetText = window.numberToAzerbaijani(monthlyBudget)
              remainingBudgetText = window.numberToAzerbaijani(remainingBudget)
            }
            
            const message = `Bu ay ${totalSpendingText} xərclədiniz. Aylıq büdcəniz ${monthlyBudgetText}. Qalıq ${remainingBudgetText}. Büdcə istifadəsi ${budgetPercentage.toFixed(1)} faiz.`
            
            if (typeof window.queueVoiceNotification === 'function') {
              window.queueVoiceNotification(message, 1, 'az')
            } else {
              // Fallback: use TTS API directly
              const { voiceAPI } = await import('../services/api')
              await voiceAPI.textToSpeech(message, 'az')
            }
          } catch (error) {
            console.error('Speak error:', error)
            toast.error('Səsləndirmə xətası')
          }
        }}
      />

      {/* Financial Time Machine */}
      <TimeMachine
        currentBalance={totalAvailable}
        monthlySavings={monthlySavings}
        currency={currency}
        incognitoMode={incognitoMode}
      />

      {/* Eco Impact Score */}
      <EcoImpact
        ecoScore={ecoScore}
        ecoBreakdown={ecoBreakdown}
        ecoTip={ecoTip}
        incognitoMode={incognitoMode}
      />

      {/* Category Breakdown */}
      <CategoryBreakdown
        categoryData={categoryData}
        totalSpending={totalSpending}
        currency={currency}
      />

      {/* Local Gems Discovery */}
      <LocalGems
        localGems={localGems}
        currency={currency}
        incognitoMode={incognitoMode}
      />

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={recents}
        currency={currency}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Financial Pet Widget */}
      {budgetPercentage > 0 && (
        <FinancialPet budgetPercentage={budgetPercentage} />
      )}

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setEditingExpense(null)
        }}
        expense={editingExpense}
        onSave={handleEditSave}
        currency={currency}
      />

      {/* Income Modal */}
      <IncomeModal
        isOpen={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        currency={currency}
        onSuccess={handleIncomeSuccess}
      />

      {/* Fraud Alert Modal */}
      <FraudAlertModal
        isOpen={fraudModalOpen}
        onClose={() => setFraudModalOpen(false)}
        onConfirm={() => {
          setFraudModalOpen(false)
        }}
        onBlock={() => {
          // Fraud blocked - could trigger additional actions
        }}
      />
    </div>
  )
}

export default Dashboard
