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
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown'
import CategoryPieChart from '../components/dashboard/CategoryPieChart'
import LocalGems from '../components/dashboard/LocalGems'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import FinancialPet from '../components/dashboard/FinancialPet'
import EditTransactionModal from '../components/dashboard/EditTransactionModal'
import IncomeModal from '../components/dashboard/IncomeModal'
import FraudAlertModal from '../components/dashboard/FraudAlertModal'
import OnboardingTour from '../components/dashboard/OnboardingTour'

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
  const [filterType, setFilterType] = useState('none') // 'none', 'day', 'month', 'year', 'range'
  const [dateFilter, setDateFilter] = useState(null) // Format: 'YYYY-MM-DD' for day
  const [monthFilter, setMonthFilter] = useState(null) // Format: 'YYYY-MM' for month
  const [yearFilter, setYearFilter] = useState(null) // Format: 'YYYY' for year
  const [startDateFilter, setStartDateFilter] = useState(null) // Format: 'YYYY-MM-DD' for range start
  const [endDateFilter, setEndDateFilter] = useState(null) // Format: 'YYYY-MM-DD' for range end
  const [onboardingOpen, setOnboardingOpen] = useState(false)

  /**
   * Dashboard məlumatlarını yüklə
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if online
      if (!navigator.onLine) {
        throw new Error('İnternet bağlantısı yoxdur. Zəhmət olmasa internet bağlantınızı yoxlayın.')
      }
      
      // Build filter params based on filter type
      let filterParam = null
      let rangeStart = null
      let rangeEnd = null
      
      if (filterType === 'day' && dateFilter) {
        filterParam = dateFilter
      } else if (filterType === 'month' && monthFilter) {
        filterParam = monthFilter
      } else if (filterType === 'year' && yearFilter) {
        filterParam = yearFilter
      } else if (filterType === 'range' && startDateFilter && endDateFilter) {
        rangeStart = startDateFilter
        rangeEnd = endDateFilter
      }
      
      const response = await dashboardAPI.getDashboardData(filterParam, filterType, rangeStart, rangeEnd)
      
      if (response && response.data) {
      setDashboardData(response.data)
      setError(null)
      } else {
        throw new Error('Serverdən məlumat alına bilmədi')
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err)
      
      let errorMessage = 'Məlumat yüklənərkən xəta baş verdi'
      
      if (err.message) {
        errorMessage = err.message
      } else if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.error || err.response.statusText || errorMessage
      } else if (err.request) {
        // Request made but no response (network error)
        errorMessage = 'Serverlə əlaqə qurula bilmədi. İnternet bağlantınızı yoxlayın.'
      }
      
      setError(errorMessage)
      toast.error(errorMessage, { autoClose: 5000 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [filterType, dateFilter, monthFilter, yearFilter, startDateFilter, endDateFilter]) // Re-fetch when any filter changes

  // Show onboarding tour - yalnız bir dəfə, hesabdan çıxıb girəndə yenidən göstər
  useEffect(() => {
    if (!loading && dashboardData && user) {
      // İstifadəçi adı ilə onboarding completed key yarat
      const onboardingKey = `onboarding_completed_${user.username}`
      const onboardingCompleted = localStorage.getItem(onboardingKey)
      
      // Əgər onboarding tamamlanmayıbsa, göstər
      if (!onboardingCompleted) {
        // Notification-lar göstərildikdən sonra onboarding tour göstər
        // Delay to let notifications show first
        setTimeout(() => {
          setOnboardingOpen(true)
        }, 3000) // 3 saniyə gözlə ki, notification-lar görünsün
      }
    }
  }, [loading, dashboardData, user])

  useEffect(() => {
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

    // Onboarding tour bitdikdən sonra notification-ları göstər
    const handleOnboardingCompleted = () => {
      console.log('✅ Onboarding completed, showing notifications...')
      // Notification-lar artıq useEffect-də avtomatik göstəriləcək
    }

    // Listen for custom events
    window.addEventListener('expenseUpdated', handleExpenseUpdate)
    window.addEventListener('incomeUpdated', handleIncomeUpdate)
    window.addEventListener('scanCompleted', handleScanComplete)
    window.addEventListener('expensesUpdated', handleExpenseUpdate) // For HTMX compatibility
    window.addEventListener('onboardingCompleted', handleOnboardingCompleted)

    return () => {
      window.removeEventListener('expenseUpdated', handleExpenseUpdate)
      window.removeEventListener('incomeUpdated', handleIncomeUpdate)
      window.removeEventListener('scanCompleted', handleScanComplete)
      window.removeEventListener('expensesUpdated', handleExpenseUpdate)
      window.removeEventListener('onboardingCompleted', handleOnboardingCompleted)
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
    const isNetworkError = error.includes('İnternet') || error.includes('əlaqə') || error.includes('network') || error.includes('Serverlə')
    
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-red-400 text-4xl mb-4">
            {isNetworkError ? '📡' : '⚠️'}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {isNetworkError ? 'İnternet bağlantısı problemi' : 'Xəta baş verdi'}
          </h3>
          <p className="text-white/70 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
          <button
              onClick={() => fetchDashboardData()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-medium transition"
          >
            Yenidən yoxla
          </button>
            {isNetworkError && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-medium transition"
              >
                Səhifəni yenilə
              </button>
            )}
          </div>
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
  // EcoScore removed - no longer used
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
          toast.success('Əməliyyat silindi', { autoClose: 5000 })
          // Refresh data
          await fetchDashboardData()
        } else {
          toast.error('Xəta baş verdi', { autoClose: 5000 })
        }
      } catch (err) {
        console.error('Delete error:', err)
        toast.error('Xəta baş verdi', { autoClose: 5000 })
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
      {/* Welcome Banner - Ən yuxarıda (Level məlumatı ilə) */}
      <WelcomeBanner
        username={user?.username || 'İstifadəçi'}
        onIncomeClick={handleIncomeClick}
        onFraudClick={handleFraudClick}
        levelInfo={levelInfo}
        xpPoints={xpPoints}
      />

      {/* Budget Warning - Notification (Yuxarıda, onboarding tour-dan əvvəl) */}
      <BudgetWarning
        budgetPercentage={budgetPercentage}
        totalSpending={totalSpending}
        monthlyBudget={monthlyBudget}
        remainingBudget={remainingBudget}
        currency={currency}
      />

      {/* Daily Limit Alert - Notification (Yuxarıda, onboarding tour-dan əvvəl) */}
      <DailyLimitAlert
        dailyLimitAlert={dailyLimitAlert}
        currency={currency}
        incognitoMode={incognitoMode}
      />

      {/* Date Filter - Premium Only */}
      {user?.is_premium && (
        <div className="glass-card p-4 sm:p-6 slide-up" style={{ gridColumn: 'span 12' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg sm:text-xl font-bold text-white">Tarixə görə filter</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            {/* Filter Type Selector */}
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value)
                // Reset all filters when changing type
                setDateFilter(null)
                setMonthFilter(null)
                setYearFilter(null)
                setStartDateFilter(null)
                setEndDateFilter(null)
              }}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'var(--glass-border)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="none" className="bg-gray-900">Filter yoxdur</option>
              <option value="day" className="bg-gray-900">Günə görə</option>
              <option value="month" className="bg-gray-900">Aya görə</option>
              <option value="year" className="bg-gray-900">İlə görə</option>
              <option value="range" className="bg-gray-900">Aralığa görə</option>
            </select>

            {/* Day Filter */}
            {filterType === 'day' && (
              <input
                type="date"
                value={dateFilter || ''}
                onChange={(e) => {
                  setDateFilter(e.target.value || null)
                }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'var(--glass-border)',
                  color: 'var(--text-primary)'
                }}
              />
            )}

            {/* Month Filter */}
            {filterType === 'month' && (
              <input
                type="month"
                value={monthFilter || ''}
                onChange={(e) => {
                  setMonthFilter(e.target.value || null)
                }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'var(--glass-border)',
                  color: 'var(--text-primary)'
                }}
              />
            )}

            {/* Year Filter */}
            {filterType === 'year' && (
              <input
                type="number"
                min="2020"
                max="2030"
                value={yearFilter || ''}
                onChange={(e) => {
                  setYearFilter(e.target.value || null)
                }}
                placeholder="İl (məs: 2025)"
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'var(--glass-border)',
                  color: 'var(--text-primary)'
                }}
              />
            )}

            {/* Range Filter */}
            {filterType === 'range' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDateFilter || ''}
                  onChange={(e) => {
                    setStartDateFilter(e.target.value || null)
                  }}
                  placeholder="Başlanğıc tarix"
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'var(--glass-border)',
                    color: 'var(--text-primary)'
                  }}
                />
                <span className="text-white/60">-</span>
                <input
                  type="date"
                  value={endDateFilter || ''}
                  onChange={(e) => {
                    setEndDateFilter(e.target.value || null)
                  }}
                  placeholder="Son tarix"
                  min={startDateFilter || undefined}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'var(--glass-border)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            )}

            {/* Clear Button */}
            {filterType !== 'none' && (dateFilter || monthFilter || yearFilter || (startDateFilter && endDateFilter)) && (
              <button
                onClick={() => {
                  setFilterType('none')
                  setDateFilter(null)
                  setMonthFilter(null)
                  setYearFilter(null)
                  setStartDateFilter(null)
                  setEndDateFilter(null)
                }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm transition"
              >
                Təmizlə
              </button>
            )}
          </div>
          </div>
          {/* Filter Info - Daha detallı məlumat */}
          {filterType === 'day' && dateFilter && (
            <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm font-semibold text-white mb-1">
                📅 Seçilmiş gün: {new Date(dateFilter).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              </p>
              {dashboardData?.context && (
                <p className="text-xs text-white/70">
                  Bu gün ümumi xərc: <span className="font-bold text-white">{dashboardData.context.total_spend?.toFixed(2) || '0.00'} {currency}</span>
                </p>
              )}
            </div>
          )}
          {filterType === 'month' && monthFilter && (
            <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm font-semibold text-white mb-1">
                📆 Seçilmiş ay: {new Date(monthFilter + '-01').toLocaleDateString('az-AZ', { year: 'numeric', month: 'long' })}
              </p>
              {dashboardData?.context && (
                <p className="text-xs text-white/70">
                  Bu ay ümumi xərc: <span className="font-bold text-white">{dashboardData.context.total_spend?.toFixed(2) || '0.00'} {currency}</span>
                </p>
              )}
            </div>
          )}
          {filterType === 'year' && yearFilter && (
            <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm font-semibold text-white mb-1">
                📅 Seçilmiş il: {yearFilter}
              </p>
              {dashboardData?.context && (
                <p className="text-xs text-white/70">
                  Bu il ümumi xərc: <span className="font-bold text-white">{dashboardData.context.total_spend?.toFixed(2) || '0.00'} {currency}</span>
                </p>
              )}
            </div>
          )}
          {filterType === 'range' && startDateFilter && endDateFilter && (
            <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm font-semibold text-white mb-1">
                📊 Seçilmiş aralıq: {new Date(startDateFilter).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(endDateFilter).toLocaleDateString('az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {dashboardData?.context && (
                <p className="text-xs text-white/70">
                  Bu aralıqda ümumi xərc: <span className="font-bold text-white">{dashboardData.context.total_spend?.toFixed(2) || '0.00'} {currency}</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Category Pie Chart - Ən qabaqda */}
      <CategoryPieChart
        categoryData={categoryData}
        currency={currency}
        incognitoMode={incognitoMode}
      />

      {/* Salary Increase Celebration Card */}
      <SalaryIncrease
        salaryIncreaseInfo={salaryIncreaseInfo}
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
        currency={currency}
        incognitoMode={incognitoMode}
        onToggleIncognito={toggleIncognito}
        onSpeak={async () => {
          // Premium yoxlaması - səsləndirmə yalnız premium üçün
          if (!user?.is_premium) {
            toast.error('🔒 Səsləndirmə funksiyası yalnız Premium istifadəçilər üçün əlçatandır.', {
              duration: 5000,
              position: 'top-center',
            })
            return
          }

          try {
            // Məbləğləri Azərbaycan dilində səsləndirmək üçün funksiya
            const formatAmount = (amount) => {
              if (typeof window.numberToAzerbaijani === 'function') {
                return window.numberToAzerbaijani(amount)
              }
              // Fallback: sadə format
              const wholePart = Math.floor(amount)
              const decimalPart = Math.round((amount - wholePart) * 100)
              if (decimalPart > 0) {
                return `${wholePart} manat ${decimalPart} qəpik`
              }
              return `${wholePart} manat`
            }
            
            const totalSpendingText = formatAmount(totalSpending)
            const monthlyBudgetText = formatAmount(monthlyBudget)
            const remainingBudgetText = formatAmount(remainingBudget)
            
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
            toast.error('Səsləndirmə xətası', { autoClose: 5000 })
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

      {/* Onboarding Tour */}
      <OnboardingTour
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={() => {
          console.log('Onboarding completed')
        }}
        username={user?.username}
      />
    </div>
  )
}

export default Dashboard
