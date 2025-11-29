/**
 * XP Progress Component
 * Gamification XP progress bar - framer-motion ilə animasiya
 */

import React from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'

const XPProgress = ({ levelInfo, xpPoints, delay = 0.05 }) => {
  if (!levelInfo) return null

  const progressPercentage = levelInfo.progress_percentage || 0
  const maxXP = levelInfo.max_xp === Infinity ? '∞' : levelInfo.max_xp

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-4 sm:p-6 slide-up"
      style={{ gridColumn: 'span 12' }}
    >
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <span className="text-3xl sm:text-4xl flex-shrink-0">{levelInfo.emoji}</span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-white truncate">{levelInfo.title}</h3>
            <p className="text-xs sm:text-sm text-white/60 truncate" id="xp-text">
              {xpPoints} / {maxXP} XP
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs sm:text-sm text-white/60">Level {levelInfo.level}</p>
          <p className="text-base sm:text-lg font-bold text-white">
            <CountUp end={Math.round(progressPercentage)} duration={1} />%
          </p>
        </div>
      </div>
      <div className="w-full bg-white/20 rounded-full h-2 sm:h-3">
        <motion.div
          id="xp-progress-bar"
          className="h-2 sm:h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        ></motion.div>
      </div>
    </motion.div>
  )
}

export default XPProgress

