/**
 * Stat Card Component
 * Dashboard-dəki stat kartları üçün
 * react-countup ilə animated numbers
 */

import React from 'react'
import CountUp from 'react-countup'
import { motion } from 'framer-motion'

const StatCard = ({ label, value, currency, color = 'text-white', delay = 0, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={className}
    >
      <p className="text-xs sm:text-sm text-white/70 mb-1 sm:mb-2">{label}</p>
      <div className="flex items-end gap-1 sm:gap-2">
        <span className={`text-2xl sm:text-4xl font-bold ${color} incognito-hidden`}>
          {typeof value === 'number' ? (
            <CountUp
              end={value}
              duration={2.5}
              decimals={2}
              separator=","
              useEasing
            />
          ) : (
            value
          )}
        </span>
        {currency && (
          <span className="text-sm sm:text-lg text-white/70 mb-0.5 sm:mb-1">{currency}</span>
        )}
      </div>
    </motion.div>
  )
}

export default StatCard

