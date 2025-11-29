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

  // Color palette for categories - Açıq, yumşaq, göz yormayan rənglər (bənövşəyi yoxdur)
  const colors = [
    'rgba(96, 165, 250, 0.65)',   // Açıq Mavi (Sky Blue)
    'rgba(74, 222, 128, 0.65)',   // Açıq Yaşıl (Light Green)
    'rgba(251, 191, 36, 0.65)',   // Açıq Sarı (Light Yellow)
    'rgba(251, 146, 60, 0.65)',  // Açıq Narıncı (Light Orange)
    'rgba(249, 168, 212, 0.65)',  // Açıq Çəhrayı (Light Pink)
    'rgba(167, 243, 208, 0.65)',  // Açıq Mint (Mint Green)
    'rgba(196, 181, 253, 0.55)',  // Çox açıq Bənövşəyi (yalnız ehtiyat üçün)
    'rgba(96, 165, 250, 0.55)',   // Daha açıq Mavi
    'rgba(74, 222, 128, 0.55)',   // Daha açıq Yaşıl
    'rgba(251, 191, 36, 0.55)',   // Daha açıq Sarı
  ]

  const chartData = {
    labels: categories.map(cat => cat),
    datasets: [
      {
        label: 'Məbləğ',
        data: amounts,
        backgroundColor: colors.slice(0, categories.length),
        borderColor: colors.slice(0, categories.length).map(color => color.replace('0.65', '0.8').replace('0.55', '0.7')),
        borderWidth: 1.5,
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
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card p-5 sm:p-8 slide-up relative overflow-hidden"
      style={{ gridColumn: 'span 12' }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-500/10 to-yellow-500/10 rounded-full blur-3xl -z-0"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <span className="text-2xl sm:text-3xl">📊</span>
              Xərclər üzrə dairəvi cədvəl
            </h3>
            <p className="text-xs sm:text-sm text-white/60">
              Kateqoriyalar üzrə xərclərin bölgüsü
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20">
            <span className="text-xs sm:text-sm text-white/80 font-medium">
              {categories.length} kateqoriya
            </span>
            <span className="text-xs text-white/60">•</span>
            <span className={`text-xs sm:text-sm font-bold ${incognitoMode ? 'incognito-hidden' : 'text-white'}`}>
              {incognitoMode ? '****' : `${total.toFixed(2)} ${currency}`}
            </span>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 sm:gap-8 items-center xl:items-start">
          {/* Chart - Daha böyük və mərkəzləşdirilmiş */}
          <div className="w-full xl:w-1/2 flex justify-center items-center">
            <div className="w-full max-w-sm sm:max-w-md">
              <Pie data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Legend/Summary - Daha gözəl dizayn */}
          <div className="w-full xl:w-1/2 space-y-3">
            <div className="text-base font-semibold text-white/90 mb-4 flex items-center gap-2">
              <span>📋</span>
              <span>Kateqoriyalar üzrə bölgü</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {categories.map((category, index) => {
                const amount = amounts[index]
                const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : 0
                return (
                  <div
                    key={category}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 transition-all duration-200 mb-2 group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 shadow-lg"
                        style={{ backgroundColor: colors[index] }}
                      />
                      <span className="text-white font-semibold text-sm sm:text-base truncate">{category}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className={`text-sm sm:text-base font-bold ${incognitoMode ? 'incognito-hidden' : 'text-white'} transition-transform`}>
                        {incognitoMode ? '****' : `${amount.toFixed(2)} ${currency}`}
                      </div>
                      <div className="text-xs text-white/60 mt-0.5">{percentage}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="pt-3 mt-3 border-t border-white/20 bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-white/90 flex items-center gap-2">
                  <span>💰</span>
                  <span>Ümumi xərc:</span>
                </span>
                <span className={`text-lg font-bold ${incognitoMode ? 'incognito-hidden' : 'text-white'}`}>
                  {incognitoMode ? '****' : `${total.toFixed(2)} ${currency}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CategoryPieChart

