/**
 * Budget Warning Component
 * Budget limit xəbərdarlığı - framer-motion ilə animasiya
 */

import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Zap } from 'lucide-react'

const BudgetWarning = ({ budgetPercentage, totalSpending, monthlyBudget, remainingBudget, currency = '₼', delay = 0 }) => {
  if (budgetPercentage >= 100) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="glass-card p-4 sm:p-6 slide-up border-2 border-red-500 bg-red-500/20"
        style={{ gridColumn: 'span 12' }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-3xl sm:text-5xl flex-shrink-0">
            <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 text-red-200" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-2xl font-bold text-red-200 mb-1">Büdcə Aşıldı!</h3>
            <p className="text-sm sm:text-base text-red-100">
              Bu ay <strong className="incognito-hidden">
                {(totalSpending - monthlyBudget).toFixed(2)} {currency}
              </strong> artıq xərclədiniz.
              Xərclərinizi azaltmağı tövsiyə edirik.
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-red-200 text-xs sm:text-sm">Büdcə</p>
            <p className="text-xl sm:text-3xl font-bold text-red-100 incognito-hidden">
              {Math.round(budgetPercentage)}%
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (budgetPercentage >= 80) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="glass-card p-4 sm:p-6 slide-up border-2 border-yellow-500 bg-yellow-500/20"
        style={{ gridColumn: 'span 12' }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-3xl sm:text-4xl flex-shrink-0">
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-200" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-xl font-bold text-yellow-200 mb-1">
              Diqqət: Büdcə Limitinə Yaxınsınız
            </h3>
            <p className="text-sm sm:text-base text-yellow-100">
              Büdcənizin <strong className="incognito-hidden">{Math.round(budgetPercentage)}%</strong>-ni istifadə etdiniz.
              Daha <strong className="incognito-hidden">
                {remainingBudget.toFixed(2)} {currency}
              </strong> qalıb.
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return null
}

export default BudgetWarning

