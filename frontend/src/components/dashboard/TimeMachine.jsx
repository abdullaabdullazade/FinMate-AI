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
      className="glass-card p-4 sm:p-6 slide-up relative overflow-hidden"
      style={{ gridColumn: 'span 12' }}
    >
      {/* Background gradient decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-2xl -z-0"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <span className="text-xl sm:text-2xl">⏳</span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Maliyyə Zaman Maşını
              </h3>
              <p className="text-xs sm:text-sm text-white/60 mt-0.5">Keçmiş və gələcək proqnoz</p>
            </div>
          </div>
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

        <div className="text-center md:text-right w-full md:w-auto md:min-w-[220px]">
          <p id="balance-label" className="text-xs sm:text-sm text-white/60 mb-2 font-medium">
            {getBalanceLabel()}
          </p>
          <div className="inline-block p-3 sm:p-4 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20">
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
                  <span id="projected-balance-currency" className="text-lg sm:text-2xl">{currency}</span>
                </>
              )}
            </p>
          </div>
          <div className="mt-3 p-2 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs sm:text-sm text-white/70">
              <span className="text-white/50">Aylıq qənaət:</span>{' '}
              <span id="monthly-savings" className={`font-semibold ${incognitoMode ? 'incognito-hidden' : ''}`}>
                {incognitoMode ? '****' : (
                  <>
                    <CountUp end={monthlySavings} duration={1} decimals={2} separator="," />
                  </>
                )}
              </span>{' '}
              <span id="monthly-savings-currency" className="text-white/70">{currency}</span>
            </p>
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  )
}

export default TimeMachine

