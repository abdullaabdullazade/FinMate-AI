/**
 * Eco Impact Component
 * HTML-dən köçürülmüş - Eko İmpakt kartı
 */

import React from 'react'
import { motion } from 'framer-motion'

const EcoImpact = ({ ecoScore, ecoBreakdown, ecoTip, incognitoMode = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass-card p-4 sm:p-6 slide-up"
      style={{ gridColumn: 'span 12' }}
    >
      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Eco Score Summary */}
        <div className="lg:col-span-1 mb-4 sm:mb-6 lg:mb-0">
          <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
            🌍 Eko İmpakt
          </h3>
          <div className="text-center p-4 sm:p-6 rounded-xl bg-white/5">
            <div className="text-4xl sm:text-6xl mb-2 sm:mb-3">{ecoScore?.icon || '🌍'}</div>
            <div className={`text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2 ${incognitoMode ? 'hidden' : ''}`}>
              {ecoScore?.value || 0}
            </div>
            <div className="text-xs sm:text-sm text-white/70">kg CO₂ bu ay</div>
          </div>
        </div>

        {/* Eco Breakdown */}
        <div className="lg:col-span-2">
          <h4 className="text-xs sm:text-sm font-bold text-white/70 mb-3 uppercase tracking-wide">
            Kateqoriya üzrə
          </h4>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(ecoBreakdown || {}).map(([category, impact]) => (
              <div
                key={category}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <span className="text-xl sm:text-2xl flex-shrink-0">{impact.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium text-xs sm:text-sm truncate">{category}</p>
                    <p className="text-xs text-white/60">{impact.level}</p>
                  </div>
                </div>
                <span className={`text-white font-bold text-sm sm:text-base flex-shrink-0 ml-2 ${incognitoMode ? 'hidden' : ''}`}>
                  {impact.co2} kg
                </span>
              </div>
            ))}
          </div>

          {ecoTip && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg bg-green-500/20 border border-green-500/30">
              <p className="text-xs sm:text-sm text-green-200">
                💡 <strong>AI Məsləhət:</strong> {ecoTip}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default EcoImpact

