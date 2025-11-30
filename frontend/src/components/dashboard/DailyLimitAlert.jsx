/**
 * Daily Limit Alert Component
 *  Gündəlik limit xəbərdarlığı
 */

import React from 'react'
import { motion } from 'framer-motion'

const DailyLimitAlert = ({ dailyLimitAlert, currency = '₼', incognitoMode = false }) => {
  // Check if alert exists and has required data
  if (!dailyLimitAlert) {
    return null
  }
  
  // Ensure we have limit and today_spending
  const limit = dailyLimitAlert.limit
  const todaySpending = dailyLimitAlert.today_spending || 0
  
  // If limit is not set, don't show alert
  if (!limit || limit <= 0) {
    return null
  }
  
  // Determine if exceeded or warning based on backend flags or calculation
  // Backend sets exceeded=true or warning=true, but we also check values
  const isExceeded = dailyLimitAlert.exceeded === true || (todaySpending > limit)
  const isWarning = dailyLimitAlert.warning === true || (!isExceeded && todaySpending >= (limit * 0.9))
  
  // If neither condition is met, don't show alert
  if (!isExceeded && !isWarning) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-card p-4 sm:p-6 slide-up border-2 ${
        isExceeded
          ? 'border-red-500 bg-red-500/20'
          : 'border-yellow-500 bg-yellow-500/20'
      }`}
      style={{ gridColumn: 'span 12' }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-3xl sm:text-5xl flex-shrink-0">
          {isExceeded ? '🚨' : '⚡'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg sm:text-2xl font-bold mb-1 ${
            isExceeded ? 'text-red-200' : 'text-yellow-200'
          }`}>
            {isExceeded
              ? 'Gündəlik Limit Keçildi!'
              : 'Gündəlik Limitə Yaxınlaşırsınız'}
          </h3>
          <p className={`text-sm sm:text-base ${
            isExceeded ? 'text-red-100' : 'text-yellow-100'
          }`}>
            Bu gün <strong className={incognitoMode ? 'hidden' : ''}>
              {todaySpending.toFixed(2)} {currency}
            </strong> xərclədiniz.
            Limit: <strong>{limit.toFixed(2)} {currency}</strong>
            {isExceeded ? (
              <>
                {' '}(Artıq: <strong className={incognitoMode ? 'hidden' : ''}>
                  {(dailyLimitAlert.over_by || (todaySpending - limit)).toFixed(2)} {currency}
                </strong>)
              </>
            ) : (
              <>
                {' '}(Qalan: <strong className={incognitoMode ? 'hidden' : ''}>
                  {(dailyLimitAlert.remaining || (limit - todaySpending)).toFixed(2)} {currency}
                </strong>)
              </>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default DailyLimitAlert

