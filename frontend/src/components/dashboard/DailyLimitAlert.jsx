/**
 * Daily Limit Alert Component
 * HTML-dən köçürülmüş - Gündəlik limit xəbərdarlığı
 */

import React from 'react'
import { motion } from 'framer-motion'

const DailyLimitAlert = ({ dailyLimitAlert, currency = '₼', incognitoMode = false }) => {
  if (!dailyLimitAlert) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`glass-card p-4 sm:p-6 slide-up border ${
        dailyLimitAlert.exceeded
          ? 'border-orange-400/40 bg-orange-500/10'
          : 'border-amber-400/40 bg-amber-500/10'
      }`}
      style={{ gridColumn: 'span 12' }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-3xl sm:text-5xl flex-shrink-0">
          {dailyLimitAlert.exceeded ? '🚨' : '⚡'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg sm:text-2xl font-bold mb-1 ${
            dailyLimitAlert.exceeded ? 'text-orange-300' : 'text-amber-300'
          }`}>
            {dailyLimitAlert.exceeded
              ? 'Gündəlik Limit Keçildi!'
              : 'Gündəlik Limitə Yaxınlaşırsınız'}
          </h3>
          <p className={`text-sm sm:text-base ${
            dailyLimitAlert.exceeded ? 'text-orange-200/90' : 'text-amber-200/90'
          }`}>
            Bu gün <strong className={incognitoMode ? 'hidden' : ''}>
              {dailyLimitAlert.today_spending?.toFixed(2)} {currency}
            </strong> xərclədiniz.
            Limit: <strong>{dailyLimitAlert.limit?.toFixed(2)} {currency}</strong>
            {dailyLimitAlert.exceeded ? (
              <>
                {' '}(Artıq: <strong className={incognitoMode ? 'hidden' : ''}>
                  {dailyLimitAlert.over_by?.toFixed(2)} {currency}
                </strong>)
              </>
            ) : (
              <>
                {' '}(Qalan: <strong className={incognitoMode ? 'hidden' : ''}>
                  {dailyLimitAlert.remaining?.toFixed(2)} {currency}
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

