/**
 * Category Card Component
 * Dashboard-dəki category breakdown kartları üçün
 * framer-motion ilə hover animasiyası
 */

import React from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'

const CategoryCard = ({ category, amount, totalSpending, currency = '₼' }) => {
  const categoryPercent = totalSpending > 0 ? (amount / totalSpending) * 100 : 0

  // Category class və icon müəyyən et
  const getCategoryStyles = (categoryName) => {
    const styles = {
      bg: '',
      border: '',
      iconBg: '',
      progressBg: '',
      icon: '💰',
      badge: '',
    }

    if (categoryName?.includes('Market')) {
      styles.bg = 'bg-gradient-to-br from-green-500/20 to-emerald-600/30 border-green-500/30'
      styles.iconBg = 'bg-gradient-to-br from-green-400 to-emerald-600'
      styles.progressBg = 'bg-green-500'
      styles.icon = '🛒'
    } else if (categoryName?.includes('Restoran')) {
      styles.bg = 'bg-gradient-to-br from-amber-500/20 to-orange-600/30 border-amber-500/30'
      styles.iconBg = 'bg-gradient-to-br from-amber-400 to-orange-600'
      styles.progressBg = 'bg-amber-500'
      styles.icon = '🍽️'
    } else if (categoryName?.includes('Kafe')) {
      styles.bg = 'bg-gradient-to-br from-amber-500/20 to-yellow-600/30 border-amber-500/30'
      styles.iconBg = 'bg-gradient-to-br from-amber-400 to-yellow-600'
      styles.progressBg = 'bg-amber-500'
      styles.icon = '☕'
    } else if (categoryName?.includes('Nəqliyyat')) {
      styles.bg = 'bg-gradient-to-br from-blue-500/20 to-cyan-600/30 border-blue-500/30'
      styles.iconBg = 'bg-gradient-to-br from-blue-400 to-cyan-600'
      styles.progressBg = 'bg-blue-500'
      styles.icon = '🚗'
    } else if (categoryName?.includes('Mobil') || categoryName?.includes('İnternet')) {
      styles.bg = 'bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border-cyan-500/30'
      styles.iconBg = 'bg-gradient-to-br from-cyan-400 to-blue-600'
      styles.progressBg = 'bg-cyan-500'
      styles.icon = categoryName?.includes('Mobil') ? '📱' : '🌐'
    } else if (categoryName?.includes('Kommunal')) {
      styles.bg = 'bg-gradient-to-br from-orange-500/20 to-red-600/30 border-orange-500/30'
      styles.iconBg = 'bg-gradient-to-br from-orange-400 to-red-600'
      styles.progressBg = 'bg-orange-500'
      styles.icon = '⚡'
    } else if (categoryName?.includes('Geyim') || categoryName?.includes('Alış-veriş')) {
      styles.bg = 'bg-gradient-to-br from-indigo-500/20 to-blue-600/30 border-indigo-500/30'
      styles.iconBg = 'bg-gradient-to-br from-indigo-400 to-blue-600'
      styles.progressBg = 'bg-indigo-500'
      styles.icon = categoryName?.includes('Geyim') ? '👔' : '🏬'
    } else if (categoryName?.includes('Online')) {
      styles.bg = 'bg-gradient-to-br from-cyan-500/20 to-teal-600/30 border-cyan-500/30'
      styles.iconBg = 'bg-gradient-to-br from-cyan-400 to-teal-600'
      styles.progressBg = 'bg-gray-500'
      styles.icon = '📦'
    } else if (categoryName?.includes('Əyləncə')) {
      styles.bg = 'bg-gradient-to-br from-red-500/20 to-orange-600/30 border-red-500/30'
      styles.iconBg = 'bg-gradient-to-br from-red-400 to-orange-600'
      styles.progressBg = 'bg-red-500'
      styles.icon = '🎬'
    } else if (categoryName?.includes('Aptək') || categoryName?.includes('İdman')) {
      styles.bg = 'bg-gradient-to-br from-teal-500/20 to-green-600/30 border-teal-500/30'
      styles.iconBg = 'bg-gradient-to-br from-teal-400 to-green-600'
      styles.progressBg = 'bg-gray-500'
      styles.icon = categoryName?.includes('Aptək') ? '💊' : '💪'
    } else if (categoryName?.includes('Bank') || categoryName?.includes('E-ödəniş')) {
      styles.bg = 'bg-gradient-to-br from-indigo-500/20 to-blue-600/30 border-indigo-500/30'
      styles.iconBg = 'bg-gradient-to-br from-indigo-400 to-blue-600'
      styles.progressBg = 'bg-gray-500'
      styles.icon = categoryName?.includes('Bank') ? '🏦' : '💳'
    } else {
      styles.bg = 'bg-gradient-to-br from-gray-500/20 to-slate-600/30 border-gray-500/30'
      styles.iconBg = 'bg-gradient-to-br from-gray-400 to-slate-600'
      styles.progressBg = 'bg-gray-500'
    }

    // Badge rəngi
    if (categoryPercent >= 30) {
      styles.badge = 'bg-red-500/30 text-red-200'
      styles.badgeText = '🔥 Yüksək'
    } else if (categoryPercent >= 15) {
      styles.badge = 'bg-yellow-500/30 text-yellow-200'
      styles.badgeText = '⚡ Orta'
    } else {
      styles.badge = 'bg-green-500/30 text-green-200'
      styles.badgeText = '✅ Az'
    }

    return styles
  }

  const styles = getCategoryStyles(category)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.05 }}
      className={`relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-5 transition-all duration-300 shadow-lg border ${styles.bg}`}
    >
      {/* Icon Badge Blur Effect */}
      <div
        className={`absolute -top-2 -right-2 w-16 h-16 rounded-full blur-2xl opacity-40 ${
          styles.progressBg.replace('bg-', 'bg-')
        }`}
      ></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div
            className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-3xl shadow-xl flex-shrink-0 ${styles.iconBg}`}
          >
            {styles.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm sm:text-lg truncate">{category}</p>
            <p className="text-white/50 text-xs">{categoryPercent.toFixed(1)}% xərc</p>
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-end justify-between mb-2 sm:mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-white/60 text-xs mb-1">Ümumi məbləğ</p>
            <p className="text-white font-black text-lg sm:text-2xl incognito-hidden">
              <CountUp end={amount} duration={2} decimals={2} separator="," />{' '}
              <span className="text-sm sm:text-lg">{currency}</span>
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${styles.badge}`}>
              {styles.badgeText}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${categoryPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full shadow-lg ${styles.progressBg}`}
          ></motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default CategoryCard

