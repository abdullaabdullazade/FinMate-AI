/**
 * Budget Overview Component
 * HTML-dən köçürülmüş - Büdcə icmalı kartı
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Eye, Volume2 } from 'lucide-react'
import StatCard from './StatCard'

const BudgetOverview = ({
  greeting,
  username,
  currentMonth,
  totalSpending,
  monthlyBudget,
  remainingBudget,
  budgetPercentage,
  ecoScore,
  currency = '₼',
  incognitoMode = false,
  onToggleIncognito,
  onSpeak
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="glass-card p-4 sm:p-6 slide-up"
      style={{ gridColumn: 'span 12' }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-white/50">
            {greeting}, {username?.charAt(0).toUpperCase() + username?.slice(1) || 'İstifadəçi'}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            Bu ay
            <button
              onClick={onToggleIncognito}
              className="p-1 sm:p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/70 hover:text-white flex-shrink-0 cursor-pointer"
              title="Xərc məbləğlərini göstər/gizlət"
            >
              <Eye className="w-4 h-5 sm:w-5 sm:h-5" />
            </button>
          </h2>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={onSpeak}
            className="btn btn-sm hidden md:inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white border border-white/20 hover:brightness-110 shadow-lg shadow-pink-500/30"
            aria-label="Dashboard məlumatını səsləndir"
          >
            <Volume2 className="w-4 h-4" />
            <span className="font-semibold">Səsləndir</span>
          </button>
          <span className="text-xs sm:text-sm text-white/70">{currentMonth}</span>
        </div>
      </div>

      {/* Stats Grid - HTML-dəki kimi bir-bir */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
        {/* Total Spending */}
        <div>
          <p className="text-xs sm:text-sm text-white/70 mb-1 sm:mb-2">Ümumi xərc</p>
          <div className="flex items-end gap-1 sm:gap-2">
            <span
              id="stat-total"
              className={`text-2xl sm:text-4xl font-bold text-white ${incognitoMode ? 'incognito-hidden' : ''}`}
              data-value={totalSpending}
              data-initial={totalSpending.toFixed(2)}
            >
              {incognitoMode ? '****' : totalSpending.toFixed(2)}
            </span>
            <span id="stat-total-currency" className="text-sm sm:text-lg text-white/70 mb-0.5 sm:mb-1">
              {currency}
            </span>
          </div>
        </div>

        {/* Budget */}
        <div>
          <p className="text-xs sm:text-sm text-white/70 mb-1 sm:mb-2">Aylıq büdcə</p>
          <div className="flex items-end gap-1 sm:gap-2">
            <span
              id="stat-budget"
              className={`text-2xl sm:text-4xl font-bold text-white ${incognitoMode ? 'incognito-hidden' : ''}`}
              data-value={monthlyBudget}
              data-initial={monthlyBudget.toFixed(2)}
            >
              {incognitoMode ? '****' : monthlyBudget.toFixed(2)}
            </span>
            <span id="stat-budget-currency" className="text-sm sm:text-lg text-white/70 mb-0.5 sm:mb-1">
              {currency}
            </span>
          </div>
        </div>

        {/* Remaining */}
        <div>
          <p className="text-xs sm:text-sm text-white/70 mb-1 sm:mb-2">Qalıq</p>
          <div className="flex items-end gap-1 sm:gap-2">
            <span
              id="stat-remaining"
              className={`text-2xl sm:text-4xl font-bold ${
                remainingBudget < 0 ? 'text-red-400' : 'text-green-400'
              } ${incognitoMode ? 'incognito-hidden' : ''}`}
              data-value={remainingBudget}
              data-initial={remainingBudget.toFixed(2)}
            >
              {incognitoMode ? '****' : remainingBudget.toFixed(2)}
            </span>
            <span id="stat-remaining-currency" className="text-sm sm:text-lg text-white/70 mb-0.5 sm:mb-1">
              {currency}
            </span>
          </div>
        </div>

        {/* Eco Score */}
        <div>
          <p className="text-xs sm:text-sm text-white/70 mb-1 sm:mb-2">Eko İmpakt</p>
          <div className="flex items-end gap-1 sm:gap-2">
            <span className="eco-leaf text-lg sm:text-2xl">{ecoScore?.icon || '🌍'}</span>
            <span
              className={`text-2xl sm:text-4xl font-bold text-white ${incognitoMode ? 'incognito-hidden' : ''}`}
            >
              {incognitoMode ? '****' : ecoScore?.value || 0}
            </span>
            <span className="text-xs sm:text-lg text-white/70 mb-0.5 sm:mb-1">kg CO₂</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 sm:mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm text-white/70">Büdcə istifadəsi</span>
          <span className={`text-xs sm:text-sm font-bold text-white ${incognitoMode ? 'hidden' : ''}`}>
            {budgetPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 sm:h-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-3 sm:h-4 rounded-full transition-all duration-500 ${
              budgetPercentage >= 100
                ? 'bg-red-500'
                : budgetPercentage >= 80
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
          ></motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default BudgetOverview

