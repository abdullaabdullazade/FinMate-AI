/**
 * Budget Settings Component
 */

import React from 'react'

const BudgetSettings = ({ monthlyBudget }) => {
  return (
    <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-6 slide-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">💰 Aylıq Büdcə</h3>
      <div className="flex items-center justify-between">
        <span className="text-white text-sm sm:text-base">Cari Büdcə</span>
        <span className="text-xl sm:text-2xl font-bold text-white incognito-hidden">
          {typeof monthlyBudget === 'number' ? monthlyBudget.toFixed(2) : '0.00'} ₼
        </span>
      </div>
    </div>
  )
}

export default BudgetSettings
