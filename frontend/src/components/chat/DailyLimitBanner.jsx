/**
 * Daily Limit Banner Component
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Zap, AlertCircle, Crown, Rocket, Star } from 'lucide-react'
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
      className={`fixed top-10 sm:top-14 md:top-18 left-1/2 transform -translate-x-1/2 z-40 w-[calc(100%-0.5rem)] sm:w-[calc(100%-1.5rem)] md:w-full max-w-[260px] sm:max-w-[300px] md:max-w-sm mx-0.5 sm:mx-2 md:mx-4 ${colors.bg} backdrop-blur-2xl rounded-md sm:rounded-lg md:rounded-xl border-2 ${colors.border} shadow-xl ${colors.glow} overflow-hidden`}
      style={{
        background: 'var(--glass-bg)',
        borderColor: 'var(--glass-border)',
      }}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.progress} blur-3xl animate-pulse`} />
      </div>

      {/* Content - Mobile First Design - SUPER KOMPAKT - TELEFON ÜÇÜN */}
      <div className="relative z-10 p-1.5 sm:p-2">
        {/* Single Row: Icon + Progress + Count + Premium Button - ALL IN ONE */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Icon - Tiny */}
          <motion.div
            animate={isLimitReached ? { rotate: [0, -10, 10, -10, 0] } : {}}
            transition={{ duration: 0.5, repeat: isLimitReached ? Infinity : 0, repeatDelay: 2 }}
            className="flex-shrink-0"
          >
            {isLimitReached ? (
              <AlertCircle className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${colors.icon}`} />
            ) : remainingMessages <= 3 ? (
              <Zap className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${colors.icon}`} />
            ) : (
              <Sparkles className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${colors.icon}`} />
            )}
          </motion.div>
          
          {/* Progress Bar - Inline - Super Thin */}
          <div className="flex-1 min-w-0">
            <div className="relative w-full h-0.5 sm:h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full bg-gradient-to-r ${colors.progress} relative overflow-hidden`}
              />
            </div>
          </div>
          
          {/* Count Badge - Tiny */}
          <div className={`px-1 sm:px-1.5 py-0.5 rounded-full ${colors.bg} border ${colors.border} backdrop-blur-sm flex-shrink-0`}>
            <span className={`text-[8px] sm:text-[9px] font-bold ${colors.text}`}>
              {dailyMessages}/{dailyLimit}
            </span>
          </div>

          {/* Premium Button - Super Compact - Inline - Enhanced */}
          {!user?.is_premium && !isLimitReached && remainingMessages > 3 && (
            <motion.button
              onClick={openModal}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="flex-shrink-0 relative overflow-hidden group ml-0.5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-md sm:rounded-lg shadow-lg" />
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20"
              />
              <div className="relative z-10 px-1.5 sm:px-2 py-0.5 sm:py-1 flex items-center gap-0.5 text-white font-bold text-[8px] sm:text-[9px] md:text-[10px] rounded-md sm:rounded-lg">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Crown className="w-2 h-2 sm:w-2.5 sm:h-2.5 flex-shrink-0" />
                </motion.div>
                <span className="hidden sm:inline">Premium</span>
                <span className="sm:hidden text-[9px]">✨</span>
              </div>
            </motion.button>
          )}
        </div>

        {/* Status Message - Second Row - Only if needed */}
        {(isLimitReached || remainingMessages <= 3) && (
          <div className="mt-1 sm:mt-1.5">
            {isLimitReached ? (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <motion.p
                  className={`${colors.text} font-bold text-[8px] sm:text-[9px] md:text-[10px] flex items-center justify-center gap-0.5 sm:gap-1 mb-1`}
                >
                  <AlertCircle className="w-2 h-2 sm:w-2.5 sm:h-2.5 flex-shrink-0" />
                  <span>Limit doldu!</span>
                </motion.p>
                {/* Premium Promotion - Limit dolduğunda */}
                {!user?.is_premium && (
                  <motion.button
                    onClick={openModal}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-md sm:rounded-lg shadow-lg" />
                    <motion.div
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                    <div className="relative z-10 px-2 sm:px-2.5 py-1 sm:py-1.5 flex items-center justify-center gap-1 text-white font-bold text-[9px] sm:text-[10px] md:text-xs rounded-md sm:rounded-lg">
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                      >
                        <Rocket className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                      </motion.div>
                      <span className="truncate">Premium Al - Limitsiz Mesaj</span>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    </div>
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <div className="text-center">
                <p className={`${colors.text} text-[8px] sm:text-[9px] md:text-[10px] font-medium mb-1`}>
                  Qalan: <span className="font-bold text-white text-[9px] sm:text-[10px]">{remainingMessages}</span> mesaj
                </p>
                {/* Premium Promotion - Az qaldıqda */}
                {!user?.is_premium && remainingMessages <= 3 && (
                  <motion.button
                    onClick={openModal}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-md sm:rounded-lg shadow-lg opacity-90" />
                    <motion.div
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    <div className="relative z-10 px-1.5 sm:px-2 py-0.5 sm:py-1 flex items-center justify-center gap-0.5 sm:gap-1 text-white font-bold text-[8px] sm:text-[9px] md:text-[10px] rounded-md sm:rounded-lg">
                      <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                      <span className="truncate">Premium Al</span>
                    </div>
                  </motion.button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default DailyLimitBanner
