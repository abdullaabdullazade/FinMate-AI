/**
 * Daily Limit Banner Component
 * Super gözəl və kreativ limit banner-ı
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Zap, AlertCircle, Crown } from 'lucide-react'
import { usePremiumModal } from '../../contexts/PremiumModalContext'

const DailyLimitBanner = ({ dailyMessages, dailyLimit, isLimitReached, user }) => {
  const { openModal } = usePremiumModal()
  const remainingMessages = dailyLimit - dailyMessages
  const percentage = Math.min((dailyMessages / dailyLimit) * 100, 100)
  
  // Rəng seçimi
  const getColors = () => {
    if (isLimitReached) {
      return {
        border: 'border-red-500/60',
        bg: 'bg-gradient-to-br from-red-500/20 via-red-600/15 to-red-500/20',
        progress: 'from-red-500 via-red-600 to-red-700',
        text: 'text-red-200',
        icon: 'text-red-400',
        glow: 'shadow-red-500/50'
      }
    } else if (remainingMessages <= 3) {
      return {
        border: 'border-yellow-500/60',
        bg: 'bg-gradient-to-br from-yellow-500/20 via-orange-500/15 to-yellow-500/20',
        progress: 'from-yellow-500 via-orange-500 to-yellow-600',
        text: 'text-yellow-200',
        icon: 'text-yellow-400',
        glow: 'shadow-yellow-500/50'
      }
    } else {
      return {
        border: 'border-blue-500/60',
        bg: 'bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-blue-500/20',
        progress: 'from-blue-500 via-cyan-500 to-blue-600',
        text: 'text-blue-200',
        icon: 'text-blue-400',
        glow: 'shadow-blue-500/50'
      }
    }
  }

  const colors = getColors()

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-full max-w-md mx-4 ${colors.bg} backdrop-blur-2xl rounded-2xl sm:rounded-3xl border-2 ${colors.border} shadow-2xl ${colors.glow} overflow-hidden`}
      style={{
        background: 'var(--glass-bg)',
        borderColor: 'var(--glass-border)',
      }}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.progress} blur-3xl animate-pulse`} />
      </div>

      {/* Content */}
      <div className="relative z-10 p-3 sm:p-4 md:p-5">
        {/* Header - Mobile optimized */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <motion.div
              animate={isLimitReached ? { rotate: [0, -10, 10, -10, 0] } : {}}
              transition={{ duration: 0.5, repeat: isLimitReached ? Infinity : 0, repeatDelay: 2 }}
            >
              {isLimitReached ? (
                <AlertCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.icon}`} />
              ) : remainingMessages <= 3 ? (
                <Zap className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.icon}`} />
              ) : (
                <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.icon}`} />
              )}
            </motion.div>
            <h3 className={`text-xs sm:text-sm font-bold ${colors.text}`}>
              Gündəlik mesaj limiti
            </h3>
          </div>
          <div className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${colors.bg} border ${colors.border} backdrop-blur-sm`}>
            <span className={`text-[10px] sm:text-xs font-bold ${colors.text}`}>
              {dailyMessages}/{dailyLimit}
            </span>
          </div>
        </div>

        {/* Progress Bar - Mobile optimized */}
        <div className="mb-3 sm:mb-4">
          <div className="relative w-full h-2 sm:h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            {/* Animated gradient progress */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full bg-gradient-to-r ${colors.progress} relative overflow-hidden`}
            >
              {/* Shimmer effect */}
              <motion.div
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </motion.div>
          </div>
        </div>

        {/* Status Message - Mobile optimized */}
        <div className="text-center mb-3 sm:mb-4">
          {isLimitReached ? (
            <motion.p
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={`${colors.text} font-bold text-sm sm:text-base mb-1 flex items-center justify-center gap-1.5 sm:gap-2`}
            >
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Limit doldu!</span>
            </motion.p>
          ) : (
            <p className={`${colors.text} text-xs sm:text-sm font-medium`}>
              Qalan: <span className="font-bold text-white text-sm sm:text-base">{remainingMessages}</span> mesaj
            </p>
          )}
        </div>

        {/* Premium Button - Mobile optimized */}
        {!user?.is_premium && (
          <motion.button
            onClick={openModal}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full relative overflow-hidden group"
          >
            {/* Button Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-xl" />
            
            {/* Shimmer Effect */}
            <motion.div
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
            
            {/* Button Content - Mobile optimized */}
            <div className="relative z-10 px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5 flex items-center justify-center gap-1.5 sm:gap-2 md:gap-2.5 text-white font-bold text-xs sm:text-sm md:text-base rounded-xl sm:rounded-2xl">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform flex-shrink-0" />
              <span className="truncate">Premium AI - Limitsiz</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="hidden sm:inline-block"
              >
                🚀
              </motion.span>
            </div>
          </motion.button>
        )}

        {/* Premium Features Hint - Mobile optimized */}
        {!user?.is_premium && !isLimitReached && (
          <p className="text-white/60 text-[10px] sm:text-xs text-center mt-2 sm:mt-3 leading-tight">
            Premium ilə limitsiz mesaj, səsli funksiyalar və daha çox özəllik
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default DailyLimitBanner

