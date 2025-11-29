/**
 * Time Machine Component
 * Financial Time Machine - slider ilə gələcək proqnoz
 * framer-motion ilə animasiya
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import '../../styles/components/dashboard/time-machine.css'

const TimeMachine = ({
  currentBalance,
  monthlySavings,
  currency = '₼',
  delay = 0.1,
  incognitoMode = false,
}) => {
  const [months, setMonths] = useState(0)
  const [projectedBalance, setProjectedBalance] = useState(currentBalance)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const projected = currentBalance + monthlySavings * months
    setProjectedBalance(projected)
  }, [months, currentBalance, monthlySavings])

  const getLabel = () => {
    if (months === 0) return 'İndi'
    return `${months} ay sonra`
  }

  const getBalanceLabel = () => {
    if (months === 0) return 'Balans'
    return 'Təxmini balans'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-4 sm:p-6 slide-up"
      style={{ gridColumn: 'span 12' }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          ⏳ Maliyyə Zaman Maşını
        </h3>
        <span className="text-xs sm:text-sm text-white/60">Keçmiş və gələcək proqnoz</span>
      </div>

      <div className="flex flex-col md:flex-row gap-4 sm:gap-8 items-stretch md:items-center">
        <div className="flex-1 w-full">
          <label
            htmlFor="time-machine-slider"
            className="block text-xs sm:text-sm text-white/70 mb-3 sm:mb-4 flex justify-between"
          >
            <span>Zamanı irəli çək:</span>
            <span id="time-machine-label" className="font-bold text-white">
              {getLabel()}
            </span>
          </label>
          <input
            type="range"
            id="time-machine-slider"
            min="0"
            max="12"
            value={months}
            step="1"
            onChange={(e) => {
              const newValue = parseInt(e.target.value)
              setMonths(newValue)
            }}
            onInput={(e) => {
              // Real-time update for smooth dragging
              const newValue = parseInt(e.target.value)
              setMonths(newValue)
            }}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchCancel={() => setIsDragging(false)}
            className="w-full h-2 sm:h-3 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              WebkitAppearance: 'none',
              appearance: 'none',
              background: 'transparent',
            }}
          />
          <div className="flex justify-between text-xs text-white/40 mt-2">
            <span>İndi</span>
            <span>1 il sonra</span>
          </div>
        </div>

        <div className="text-center md:text-right w-full md:w-auto md:min-w-[200px]">
          <p id="balance-label" className="text-xs sm:text-sm text-white/60 mb-1">
            {getBalanceLabel()}
          </p>
          <p
            id="projected-balance"
            className={`text-2xl sm:text-4xl font-bold transition-colors duration-300 ${
              incognitoMode ? 'incognito-hidden' : ''
            } ${projectedBalance < 0 ? 'text-red-400' : 'text-green-400'}`}
          >
            {incognitoMode ? (
              '****'
            ) : (
              <>
                <CountUp
                  end={projectedBalance}
                  duration={0.5}
                  decimals={2}
                  separator=","
                />{' '}
                <span id="projected-balance-currency">{currency}</span>
              </>
            )}
          </p>
          <p className="text-xs text-white/40 mt-1">
            Aylıq qənaət:{' '}
            <span id="monthly-savings" className={incognitoMode ? 'incognito-hidden' : ''}>
              {incognitoMode ? '****' : (
                <CountUp end={monthlySavings} duration={1} decimals={2} separator="," />
              )}
            </span>{' '}
            <span id="monthly-savings-currency">{currency}</span>
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default TimeMachine

