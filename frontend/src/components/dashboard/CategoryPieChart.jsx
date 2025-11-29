/**
 * Category Pie Chart Component
 * Xərclərin kateqoriyalar üzrə dairəvi cədvəl
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const CategoryPieChart = ({ categoryData, currency = 'AZN', incognitoMode = false }) => {
  if (!categoryData || Object.keys(categoryData).length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="glass-card p-4 sm:p-6 slide-up"
        style={{ gridColumn: 'span 12' }}
      >
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Xərclər üzrə dairəvi cədvəl</h3>
        <p className="text-white/60 text-center py-8">Hələ xərc məlumatı yoxdur</p>
      </motion.div>
    )
  }

  // Prepare data for chart
  const categories = Object.keys(categoryData)
  const amounts = Object.values(categoryData)
  const total = amounts.reduce((sum, amount) => sum + amount, 0)

  // Color palette for categories
  const colors = [
    'rgba(139, 92, 246, 0.8)',   // Purple
    'rgba(236, 72, 153, 0.8)',   // Pink
    'rgba(59, 130, 246, 0.8)',   // Blue
    'rgba(34, 197, 94, 0.8)',    // Green
    'rgba(251, 191, 36, 0.8)',   // Yellow
    'rgba(249, 115, 22, 0.8)',   // Orange
    'rgba(168, 85, 247, 0.8)',   // Violet
    'rgba(236, 72, 153, 0.6)',   // Light Pink
    'rgba(59, 130, 246, 0.6)',   // Light Blue
    'rgba(34, 197, 94, 0.6)',    // Light Green
  ]

  const chartData = {
    labels: categories.map(cat => cat),
    datasets: [
      {
        label: 'Məbləğ',
        data: amounts,
        backgroundColor: colors.slice(0, categories.length),
        borderColor: colors.slice(0, categories.length).map(color => color.replace('0.8', '1').replace('0.6', '1')),
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgba(255, 255, 255, 0.85)',
          font: {
            size: 11,
            family: 'system-ui, -apple-system, sans-serif',
          },
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: 'rgba(255, 255, 255, 0.95)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        padding: 10,
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
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="glass-card p-4 sm:p-6 slide-up"
      style={{ gridColumn: 'span 12' }}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-white">Xərclər üzrə dairəvi cədvəl</h3>
        <span className="text-xs sm:text-sm text-white/60">
          {categories.length} kateqoriya
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center lg:items-start">
        {/* Chart */}
        <div className="w-full lg:w-2/3 flex justify-center">
          <div className="w-full max-w-md">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Legend/Summary */}
        <div className="w-full lg:w-1/3 space-y-2">
          <div className="text-sm font-semibold text-white/80 mb-3">Kateqoriyalar üzrə bölgü:</div>
          {categories.map((category, index) => {
            const amount = amounts[index]
            const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0
            return (
              <div
                key={category}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colors[index] }}
                  />
                  <span className="text-white font-medium text-sm sm:text-base truncate">{category}</span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className={`text-sm sm:text-base font-bold ${incognitoMode ? 'incognito-hidden' : 'text-white'}`}>
                    {incognitoMode ? '****' : `${amount.toFixed(2)} ${currency}`}
                  </div>
                  <div className="text-xs text-white/60">{percentage}%</div>
                </div>
              </div>
            )
          })}
          <div className="pt-2 mt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white/90">Ümumi:</span>
              <span className={`text-base font-bold ${incognitoMode ? 'incognito-hidden' : 'text-white'}`}>
                {incognitoMode ? '****' : `${total.toFixed(2)} ${currency}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CategoryPieChart

