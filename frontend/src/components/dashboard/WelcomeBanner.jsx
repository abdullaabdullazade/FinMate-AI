/**
 * Welcome Banner Component
 * Dashboard-dəki welcome banner - framer-motion ilə animasiya
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle, Camera, DollarSign, AlertTriangle } from 'lucide-react'

const WelcomeBanner = ({ username, onIncomeClick, onFraudClick, levelInfo = null, xpPoints = 0, delay = 0.02 }) => {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Sabahın xeyir'
    if (hour < 18) return 'Günün aydın'
    return 'Axşamın xeyir'
  }

  const progressPercentage = levelInfo?.progress_percentage || 0
  const maxXP = levelInfo?.max_xp === Infinity ? '∞' : levelInfo?.max_xp
  const currentLevelXP = levelInfo?.min_xp || 0
  const xpInCurrentLevel = xpPoints - currentLevelXP
  const xpNeededForNext = levelInfo?.max_xp && levelInfo.max_xp !== Infinity ? levelInfo.max_xp - currentLevelXP : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-4 sm:p-6 slide-up"
      style={{ gridColumn: 'span 12' }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        {/* Icon - düzgün görünsün */}
        <div className="text-4xl sm:text-6xl flex-shrink-0" style={{ lineHeight: '1' }}>
          👋
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Salam, {username?.charAt(0).toUpperCase() + username?.slice(1)}!
            </h2>
            {/* Level Badge - Kompakt */}
            {levelInfo && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30">
                <span className="text-lg">{levelInfo.emoji}</span>
                <span className="text-xs font-bold text-white">
                  {levelInfo.title} {levelInfo.current_level || levelInfo.level || 1}
                </span>
              </div>
            )}
          </div>
          <p className="text-white/70 text-base sm:text-lg mb-2">Maliyyə azadlığına xoş gəldin</p>
          
          {/* XP Progress - Kompakt */}
          {levelInfo && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                <span>{xpInCurrentLevel} / {xpNeededForNext || '∞'} XP</span>
                <span className="font-semibold">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <p className="text-white/60 text-xs sm:text-sm mt-2">
            FinMate AI ilə xərclərinizi idarə edin, qənaət edin və arzularınıza çatın.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/chat"
            className="px-6 py-3 bg-gradient-to-r from-[#ec4899] to-[#d81b60] rounded-xl text-white font-medium transition shadow-lg flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>AI Məsləhəti</span>
          </Link>
          <Link
            to="/scan"
            className="px-6 py-3 bg-white/10 rounded-xl text-white font-medium transition border border-white/20 flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>Çek Skan</span>
          </Link>
          <button
            onClick={onIncomeClick}
            className="px-6 py-3 bg-gradient-to-r from-[#ec4899] to-[#d81b60] rounded-xl text-white font-medium transition shadow-lg border border-white/20 flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            <span>Gəlir</span>
          </button>
          <button
            onClick={onFraudClick}
            className="px-4 sm:px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-white font-medium transition shadow-lg shadow-red-500/50 border border-red-400 animate-pulse flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Fraud</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default WelcomeBanner

