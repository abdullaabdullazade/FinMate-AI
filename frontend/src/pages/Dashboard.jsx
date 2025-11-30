/**
 * Dashboard Page Component
 * HTML/CSS-dən tam köçürülmüş - Bütün komponentlər səliqəli şəkildə bölünmüşdür
 * Deep Purple Glassmorphism dizaynı
 */

import React, { useState, useEffect, useRef } from 'react'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { toast } from '../utils/toast'

// Dashboard Components
import BudgetWarning from '../components/dashboard/BudgetWarning'
import WelcomeBanner from '../components/dashboard/WelcomeBanner'
import SalaryIncrease from '../components/dashboard/SalaryIncrease'
import XPProgress from '../components/dashboard/XPProgress'
import DailyLimitAlert from '../components/dashboard/DailyLimitAlert'
import BudgetOverview from '../components/dashboard/BudgetOverview'
import TimeMachine from '../components/dashboard/TimeMachine'
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown'
import DateFilter from '../components/dashboard/DateFilter'
import CategoryPieChart from '../components/dashboard/CategoryPieChart'
import LocalGems from '../components/dashboard/LocalGems'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import FinancialPet from '../components/dashboard/FinancialPet'
import EditTransactionModal from '../components/dashboard/EditTransactionModal'
import DeleteTransactionModal from '../components/dashboard/DeleteTransactionModal'
import IncomeModal from '../components/dashboard/IncomeModal'
import OnboardingTour from '../components/dashboard/OnboardingTour'
import SalarySetupModal from '../components/dashboard/SalarySetupModal'

const Dashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [incognitoMode, setIncognitoMode] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingExpense, setDeletingExpense] = useState(null)
  const [incomeModalOpen, setIncomeModalOpen] = useState(false)
  const [filterType, setFilterType] = useState('none') // 'none', 'day', 'month', 'year', 'range'
  const [dateFilter, setDateFilter] = useState(null) // Format: 'YYYY-MM-DD' for day
  const [monthFilter, setMonthFilter] = useState(null) // Format: 'YYYY-MM' for month
  const [yearFilter, setYearFilter] = useState(null) // Format: 'YYYY' for year
  const [yearFilterInput, setYearFilterInput] = useState('') // Temporary input value for year
  const [startDateFilter, setStartDateFilter] = useState(null) // Format: 'YYYY-MM-DD' for range start
  const [endDateFilter, setEndDateFilter] = useState(null) // Format: 'YYYY-MM-DD' for range end
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [salaryModalOpen, setSalaryModalOpen] = useState(false)

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

  // Debounce year filter - yalnız tam 4 rəqəmli il olduqda refresh et
  // Yalnız tam 4 rəqəmli il olduqda və ya boş olduqda refresh et
  useEffect(() => {
    // Yalnız tam 4 rəqəmli il olduqda və ya boş olduqda refresh et
    if (yearFilterInput.length === 0) {
      setYearFilter(null)
    } else if (yearFilterInput.length === 4) {
      const year = parseInt(yearFilterInput)
      if (year >= 2020 && year <= 2030) {
        setYearFilter(yearFilterInput)
      } else {
        setYearFilter(null)
      }
    }
    // Yarımçıq yazılıbsa (1-3 rəqəm), refresh etmə - yalnız input dəyərini saxla
  }, [yearFilterInput])

  useEffect(() => {
    fetchDashboardData()
  }, [filterType, dateFilter, monthFilter, yearFilter, startDateFilter, endDateFilter]) // Re-fetch when any filter changes

  // Check if user needs to set salary (first time login) - yalnız bir dəfə
  useEffect(() => {
    if (!loading && user) {
      // İstifadəçi adı ilə salary setup completed key yarat
      const salarySetupKey = `salary_setup_completed_${user.username}`
      const salarySetupCompleted = localStorage.getItem(salarySetupKey)
      
      // Əgər maaş yoxdursa VƏ hələ təyin edilməyibsə, göstər
      if (!user.monthly_income && !salarySetupCompleted) {
        setTimeout(() => {
          setSalaryModalOpen(true)
        }, 1000)
      }
    }
  }, [loading, user])

  // Show onboarding tour - yalnız bir dəfə, hesabdan çıxıb girəndə yenidən göstər
  useEffect(() => {
    if (!loading && dashboardData && user && user.monthly_income) {
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
  // Get daily limit alert - check context first, then root level
  const dailyLimitAlert = context?.daily_limit_alert || dashboardData?.daily_limit_alert || null
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

  // Handle delete transaction - modal aç
  const handleDelete = (expense) => {
    // Expense obyekti gəlir (TransactionRow-dan)
    // Income-lar silinə bilməz
    if (expense && expense.type !== 'income') {
      setDeletingExpense(expense)
      setDeleteModalOpen(true)
    } else if (expense && expense.type === 'income') {
      toast.error('Gəlir əməliyyatları silinə bilməz', { autoClose: 5000 })
    }
  }

  // Delete transaction confirm
  const handleDeleteConfirm = async (expenseId) => {
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
        // Refresh data
        await fetchDashboardData()
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('expenseUpdated'))
      } else {
        const errorText = await response.text()
        throw new Error(errorText || 'Xəta baş verdi')
      }
    } catch (err) {
      console.error('Delete error:', err)
      throw err
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


  return (
    <div className="dashboard-grid px-2 sm:px-4 pb-24 sm:pb-32">
      {/* Welcome Banner - Ən yuxarıda (Level məlumatı ilə) */}
      <WelcomeBanner
        username={user?.username || 'İstifadəçi'}
        onIncomeClick={handleIncomeClick}
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

      {/* Date Filter - Premium Only - Beautiful New Design */}
      {user?.is_premium && (
        <DateFilter
          filterType={filterType}
          setFilterType={setFilterType}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          monthFilter={monthFilter}
          setMonthFilter={setMonthFilter}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          yearFilterInput={yearFilterInput}
          setYearFilterInput={setYearFilterInput}
          startDateFilter={startDateFilter}
          setStartDateFilter={setStartDateFilter}
          endDateFilter={endDateFilter}
          setEndDateFilter={setEndDateFilter}
          dashboardData={dashboardData}
          currency={currency}
        />
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
            toast.error('🔒 Səsləndirmə funksiyası yalnız Premium istifadəçilər üçün əlçatandır. Premium alın!', {
              position: 'top-center',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              closeButton: true,
              onClick: () => {
                // Toast-a klik edəndə Premium modal aç
                if (typeof window.openPremiumModal === 'function') {
                  window.openPremiumModal()
                }
              }
            })
            // Premium modal aç
            setTimeout(() => {
              if (typeof window.openPremiumModal === 'function') {
                window.openPremiumModal()
              }
            }, 1000)
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

      {/* Delete Transaction Modal */}
      <DeleteTransactionModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeletingExpense(null)
        }}
        transaction={deletingExpense}
        onConfirm={handleDeleteConfirm}
        currency={currency}
      />

      {/* Income Modal */}
      <IncomeModal
        isOpen={incomeModalOpen}
        onClose={() => setIncomeModalOpen(false)}
        currency={currency}
        onSuccess={handleIncomeSuccess}
      />


      {/* Salary Setup Modal - First Time Login */}
      <SalarySetupModal
        isOpen={salaryModalOpen}
        onClose={() => setSalaryModalOpen(false)}
        onSalarySet={() => {
          // Maaş təyin edildikdən sonra dashboard-u yenilə
          fetchDashboardData()
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
