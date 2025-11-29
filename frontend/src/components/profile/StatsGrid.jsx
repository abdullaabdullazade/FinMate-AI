/**
 * Stats Grid Component
 * profile.html-dəki stats grid strukturunu təkrarlayır
 */

import React from 'react'

const StatsGrid = ({ totalExpenses, totalSpentAllTime, currency }) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="glass-card p-3 sm:p-4 text-center slide-up" style={{ animationDelay: '0.1s' }}>
        <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{totalExpenses || 0}</p>
        <p className="text-xs sm:text-sm text-white/70">Ümumi xərclər</p>
      </div>
      <div className="glass-card p-3 sm:p-4 text-center slide-up" style={{ animationDelay: '0.15s' }}>
        <p className="text-2xl sm:text-3xl font-bold text-white mb-1">
          {typeof totalSpentAllTime === 'number' ? totalSpentAllTime.toFixed(0) : '0'}
        </p>
        <p className="text-xs sm:text-sm text-white/70">Xərclənib ({currency || 'AZN'})</p>
      </div>
    </div>
  )
}

export default StatsGrid
