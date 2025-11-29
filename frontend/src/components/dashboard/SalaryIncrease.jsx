/**
 * Salary Increase Celebration Component
 * HTML-dən köçürülmüş - Maaş artımı təbrik kartı
 */

import React from 'react'
import { motion } from 'framer-motion'

const SalaryIncrease = ({ salaryIncreaseInfo, currency = '₼', incognitoMode = false }) => {
  if (!salaryIncreaseInfo) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.03 }}
      className="glass-card p-4 sm:p-6 slide-up border-2 border-green-500/50 bg-gradient-to-br from-green-500/20 to-emerald-600/20 relative overflow-hidden"
      style={{ gridColumn: 'span 12' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-emerald-500/10 to-teal-600/10 animate-gradient"></div>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/30 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/30 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-4xl sm:text-6xl"
        >
          🎉
        </motion.div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-2xl font-bold text-green-200 mb-1">
            Təbriklər! Maaş Artımı! 💰
          </h3>
          <p className="text-green-100 text-sm sm:text-base">
            Maaşınız <strong className={incognitoMode ? 'hidden' : ''}>
              {salaryIncreaseInfo.percentage?.toFixed(1)}%
            </strong> artıb!
            Əvvəlki ay: <strong className={incognitoMode ? 'hidden' : ''}>
              {salaryIncreaseInfo.previous?.toFixed(2)} {currency}
            </strong>
            → İndi: <strong className={incognitoMode ? 'hidden' : ''}>
              {salaryIncreaseInfo.current?.toFixed(2)} {currency}
            </strong>
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-green-200 text-xs sm:text-sm">Artım</p>
          <p className={`text-2xl sm:text-4xl font-bold text-green-100 ${incognitoMode ? 'hidden' : ''}`}>
            +{salaryIncreaseInfo.amount?.toFixed(2)} {currency}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default SalaryIncrease

