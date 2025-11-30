/**
 * Time Machine Component
 * Financial Time Machine - slider ilə gələcək proqnoz
 * framer-motion ilə animasiya
 */

import  { useState, useEffect } from 'react'
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
      {/* Header - Settings style */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
          Maliyyə Zaman Maşını
        </h3>
        <p className="text-xs sm:text-sm text-white/60">Keçmiş və gələcək proqnoz</p>
      </div>

      {/* Slider Section - Simple Settings style */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label
            htmlFor="time-machine-slider"
            className="text-sm font-medium text-white"
          >
            Zamanı irəli çək
          </label>
          <span className="text-sm font-semibold text-white/80">
            {getLabel()}
          </span>
        </div>
        
        {/* Simple Slider */}
        <div className="relative">
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
              const newValue = parseInt(e.target.value)
              setMonths(newValue)
            }}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchCancel={() => setIsDragging(false)}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
          />
        </div>
        
        {/* Simple Month labels */}
        <div className="flex justify-between mt-2 text-xs text-white/50">
          <span>İndi</span>
          <span>3 ay</span>
          <span>6 ay</span>
          <span>9 ay</span>
          <span>1 il</span>
        </div>
      </div>

      {/* Balance Display - Simple Settings style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-xs text-white/60 mb-2">{getBalanceLabel()}</p>
          <p
            className={`text-2xl sm:text-3xl font-bold ${
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
                <span className="text-lg">{currency}</span>
              </>
            )}
          </p>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-xs text-white/60 mb-2">Aylıq qənaət</p>
          <p className={`text-2xl sm:text-3xl font-bold text-white ${incognitoMode ? 'incognito-hidden' : ''}`}>
            {incognitoMode ? (
              '****'
            ) : (
              <>
                <CountUp end={monthlySavings} duration={1} decimals={2} separator="," />{' '}
                <span className="text-lg">{currency}</span>
              </>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default TimeMachine

