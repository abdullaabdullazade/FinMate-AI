/**
 * XP Progress Component
 * Gamification XP progress bar - Kompakt və yığışdırılmış dizayn
 */

import React from 'react'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'

const XPProgress = ({ levelInfo, xpPoints, delay = 0.05 }) => {
  if (!levelInfo) return null

  const progressPercentage = levelInfo.progress_percentage || 0
  const maxXP = levelInfo.max_xp === Infinity ? '∞' : levelInfo.max_xp
  const nextLevelXP = levelInfo.max_xp === Infinity ? null : levelInfo.max_xp
  const currentLevelXP = levelInfo.min_xp || 0
  const xpInCurrentLevel = xpPoints - currentLevelXP
  const xpNeededForNext = nextLevelXP ? nextLevelXP - currentLevelXP : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-3 sm:p-4 slide-up"
      style={{ gridColumn: 'span 12' }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Level Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 flex items-center justify-center">
            <span className="text-2xl sm:text-3xl">{levelInfo.emoji}</span>
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {levelInfo.title} • Level {levelInfo.current_level || levelInfo.level || 1}
              </h3>
        </div>
        <div className="text-right flex-shrink-0">
              <p className="text-xs sm:text-sm font-bold text-white">
            <CountUp end={Math.round(progressPercentage)} duration={1} />%
          </p>
        </div>
      </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2 mb-1.5">
        <motion.div
          id="xp-progress-bar"
              className="h-2 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-orange-500 shadow-lg"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
        ></motion.div>
          </div>

          {/* XP Details */}
          <div className="flex items-center justify-between text-xs text-white/60">
            <span className="truncate">
              {xpInCurrentLevel} / {xpNeededForNext || '∞'} XP
            </span>
            {nextLevelXP && (
              <span className="flex-shrink-0 ml-2">
                Növbəti: {nextLevelXP - xpPoints} XP
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default XPProgress

