/**
 * Expense Analysis Dashboard Component
 * Full-width responsive dashboard with Analysis Zone, Details Zone, and Alert Banner
 * Glassmorphism design with Tailwind + DaisyUI
 * 
 * @example
 * <ExpenseAnalysisDashboard
 *   budgetPercentage={120}
 *   overAmount={50}
 *   currency="AZN"
 *   categoryData={{
 *     "Market": 150,
 *     "Restoran": 80,
 *     "Nəqliyyat": 45
 *   }}
 *   transactions={transactionsArray}
 *   onEdit={(expense) => console.log('Edit', expense)}
 *   onDelete={(id) => console.log('Delete', id)}
 *   dateFilter="month"
 *   onDateFilterChange={(value) => setDateFilter(value)}
 *   futurePredictionValue={75}
 *   onFuturePredictionChange={(value) => setFuturePrediction(value)}
 *   incognitoMode={false}
 * />
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import TransactionRow from './TransactionRow'
import { TransactionContext } from './RecentTransactions'

ChartJS.register(ArcElement, Tooltip, Legend)

const ExpenseAnalysisDashboard = ({
  budgetPercentage = 0,
  overAmount = 0,
  currency = 'AZN',
  categoryData = {},
  transactions = [],
  onEdit,
  onDelete,
  dateFilter = null,
  onDateFilterChange,
  incognitoMode = false,
  futurePredictionValue = 0,
  onFuturePredictionChange
}) => {
  const [chartData, setChartData] = useState(null)
  const [chartOptions, setChartOptions] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [showAllCategories, setShowAllCategories] = useState(false)

  // Prepare chart data from categoryData
  useEffect(() => {
    if (!categoryData || Object.keys(categoryData).length === 0) {
      setChartData(null)
      return
    }

    const categories = Object.keys(categoryData)
    const amounts = Object.values(categoryData)
    const total = amounts.reduce((sum, amount) => sum + amount, 0)

    // Color palette - professional, eye-friendly colors
    const colors = [
      'rgba(96, 165, 250, 0.7)',   // Sky Blue
      'rgba(74, 222, 128, 0.7)',   // Light Green
      'rgba(251, 191, 36, 0.7)',   // Light Yellow
      'rgba(251, 146, 60, 0.7)',   // Light Orange
      'rgba(249, 168, 212, 0.7)',  // Light Pink
      'rgba(167, 243, 208, 0.7)',  // Mint Green
      'rgba(139, 92, 246, 0.7)',   // Purple
      'rgba(236, 72, 153, 0.7)',   // Pink
    ]

    const borderColors = colors.map(color => color.replace('0.7', '0.9'))

    setChartData({
      labels: categories,
      datasets: [
        {
          label: 'Məbləğ',
          data: amounts,
          backgroundColor: colors.slice(0, categories.length),
          borderColor: borderColors.slice(0, categories.length),
          borderWidth: 2,
        },
      ],
    })

    setChartOptions({
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false, // We'll show custom legend below
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          titleColor: 'rgba(255, 255, 255, 0.95)',
          bodyColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed || 0
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
              if (incognitoMode) {
                return `${label}: **** (${percentage}%)`
              }
              return `${label}: ${value.toFixed(2)} ${currency} (${percentage}%)`
            },
          },
        },
      },
      cutout: '60%',
    })
  }, [categoryData, currency, incognitoMode])

  // Calculate total spending
  const totalSpending = categoryData && Object.keys(categoryData).length > 0
    ? Object.values(categoryData).reduce((sum, amount) => sum + amount, 0)
    : 0

  // Chart colors for legend
  const chartColors = [
    'rgba(96, 165, 250, 0.7)',
    'rgba(74, 222, 128, 0.7)',
    'rgba(251, 191, 36, 0.7)',
    'rgba(251, 146, 60, 0.7)',
    'rgba(249, 168, 212, 0.7)',
    'rgba(167, 243, 208, 0.7)',
    'rgba(139, 92, 246, 0.7)',
    'rgba(236, 72, 153, 0.7)',
  ]

  return (
    <TransactionContext.Provider value={{ expandedId, setExpandedId }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* 🚨 Alert Banner - Full Width */}
      {budgetPercentage > 100 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="col-span-1 lg:col-span-3"
        >
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-3xl sm:text-4xl">🚨</span>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                  Gündəlik Limit Keçildi!
                </h3>
                <p className="text-sm sm:text-base text-white/90">
                  {incognitoMode ? (
                    'Artıq: ****'
                  ) : (
                    <>Artıq: {overAmount.toFixed(2)} {currency}</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 📊 Analysis Zone - Left / Top */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="col-span-1 lg:col-span-2"
      >
        <div className="bg-base-100/80 backdrop-blur-xl shadow-xl rounded-xl p-4 sm:p-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Xərc Analizi</h2>
            
            {/* Date Filter - DaisyUI Select */}
            <div className="w-full sm:w-auto">
              <select
                className="select select-bordered w-full sm:w-auto bg-white/10 border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateFilter || ''}
                onChange={(e) => onDateFilterChange?.(e.target.value || null)}
              >
                <option value="" className="bg-gray-900">Bütün tarixlər</option>
                <option value="today" className="bg-gray-900">Bu gün</option>
                <option value="week" className="bg-gray-900">Bu həftə</option>
                <option value="month" className="bg-gray-900">Bu ay</option>
                <option value="year" className="bg-gray-900">Bu il</option>
              </select>
            </div>
          </div>

          {/* Chart Section */}
          {chartData ? (
            <>
              {/* Large Doughnut Chart */}
              <div className="mb-6">
                <div className="w-full max-w-md mx-auto h-64 sm:h-80">
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* Legend - Below Chart */}
              <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.keys(categoryData)
                    .slice(0, showAllCategories ? undefined : 6)
                    .map((category, index) => {
                      const amount = categoryData[category]
                      const percentage = totalSpending > 0 
                        ? ((amount / totalSpending) * 100).toFixed(1) 
                        : 0
                      
                      return (
                        <motion.div
                          key={category}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: chartColors[index % chartColors.length] }}
                            />
                            <span className="text-white font-medium text-sm truncate">
                              {category}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <div className={`text-sm font-bold ${incognitoMode ? 'incognito-hidden' : 'text-white'}`}>
                              {incognitoMode ? '****' : `${amount.toFixed(2)} ${currency}`}
                            </div>
                            <div className="text-xs text-white/60">{percentage}%</div>
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
                
                {/* Show More Button for Categories */}
                {Object.keys(categoryData).length > 6 && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-lg text-white text-sm font-medium transition-all duration-300"
                    >
                      {showAllCategories 
                        ? `Daha az göstər` 
                        : `Daha çox göstər (+${Object.keys(categoryData).length - 6})`
                      }
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/60">Hələ xərc məlumatı yoxdur</p>
            </div>
          )}

          {/* Future Prediction Slider */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">
              Gələcək Proqnoz Nəzarəti
            </h3>
            
            {/* DaisyUI Slider */}
            <div className="w-full">
              <input
                type="range"
                min="0"
                max="100"
                value={futurePredictionValue}
                onChange={(e) => onFuturePredictionChange?.(parseInt(e.target.value))}
                className="range range-primary"
                step="1"
              />
              <div className="w-full flex justify-between text-xs text-white/60 px-2 mt-2">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
              <div className="mt-3 text-center">
                <span className="text-white font-semibold">
                  Proqnoz: {futurePredictionValue}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 📝 Details Zone - Right / Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="col-span-1"
      >
        <div className="bg-base-100/80 backdrop-blur-xl shadow-xl rounded-xl p-4 sm:p-6 h-full flex flex-col">
          {/* Header */}
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
            Son Əməliyyatlar
          </h2>

          {/* Scrollable List */}
          <div className="flex-1 max-h-[400px] sm:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {!transactions || transactions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
                <div className="text-4xl mb-3">💳</div>
                <p className="text-white/60 text-sm">Hələ əməliyyat yoxdur</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {transactions.map((expense, index) => (
                  <TransactionRow
                    key={expense.id || index}
                    expense={expense}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    currency={currency}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
      </div>
    </TransactionContext.Provider>
  )
}

export default ExpenseAnalysisDashboard

