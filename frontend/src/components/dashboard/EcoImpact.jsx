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
      className="glass-card p-4 sm:p-6 slide-up relative overflow-hidden"
      style={{ gridColumn: 'span 12' }}
    >
      {/* Background gradient decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-500/20 to-green-500/20 rounded-full blur-2xl -z-0"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20">
            <span className="text-xl sm:text-2xl">🌍</span>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Eko İmpakt
            </h3>
            <p className="text-xs sm:text-sm text-white/60 mt-0.5">Karbon ayaq izi</p>
          </div>
        </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        {/* Eco Score Summary */}
        <div className="lg:col-span-1 mb-4 sm:mb-6 lg:mb-0">
          <div className="text-center p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-teal-500/20 backdrop-blur-sm border border-white/20 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent opacity-50"></div>
            <div className="relative z-10">
              <div className="text-5xl sm:text-7xl mb-3 sm:mb-4 transform hover:scale-110 transition-transform duration-300">
                {ecoScore?.icon || '🌍'}
              </div>
              <div className={`text-3xl sm:text-5xl font-bold text-white mb-2 ${incognitoMode ? 'hidden' : ''}`}>
                {ecoScore?.value || 0}
              </div>
              <div className="text-sm sm:text-base text-white/80 font-medium">kg CO₂</div>
              <div className="text-xs sm:text-sm text-white/60 mt-1">bu ay</div>
            </div>
          </div>
        </div>

        {/* Eco Breakdown */}
        <div className="lg:col-span-2">
          <h4 className="text-xs sm:text-sm font-bold text-white/80 mb-4 uppercase tracking-wide flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full"></span>
            Kateqoriya üzrə
          </h4>
          <div className="space-y-2.5 sm:space-y-3">
            {Object.keys(ecoBreakdown || {}).length > 0 ? (
              Object.entries(ecoBreakdown).map(([category, impact], index) => {
                // Handle both old format (just number) and new format (object with co2, icon, level)
                const co2Value = typeof impact === 'object' && impact !== null ? (impact.co2 || 0) : (impact || 0)
                const icon = typeof impact === 'object' && impact !== null ? (impact.icon || '💻') : '💻'
                const level = typeof impact === 'object' && impact !== null ? (impact.level || 'Aşağı təsir') : 'Aşağı təsir'
                
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/0 hover:from-white/10 hover:to-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-xl sm:text-2xl">{icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-semibold text-sm sm:text-base truncate">{category}</p>
                        <p className="text-xs sm:text-sm text-white/60 mt-0.5">{level}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 flex-shrink-0 ml-2 ${incognitoMode ? 'hidden' : ''}`}>
                      <span className="text-white font-bold text-sm sm:text-base">
                        {typeof co2Value === 'number' ? co2Value.toFixed(1) : co2Value} <span className="text-xs text-white/70">kg</span>
                      </span>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="text-center py-8 text-white/50">
                <p className="text-sm">Hələ kateqoriya üzrə məlumat yoxdur</p>
                <p className="text-xs mt-2">Xərcləriniz əlavə olunduqca burada görünəcək</p>
              </div>
            )}
          </div>

          {ecoTip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-4 sm:mt-6 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-green-500/25 via-emerald-500/20 to-teal-500/25 border border-green-400/40 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/10 rounded-full blur-2xl"></div>
              <div className="relative z-10 flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">💡</span>
                <div>
                  <p className="text-sm sm:text-base text-green-100 font-semibold mb-1">AI Məsləhət</p>
                  <p className="text-xs sm:text-sm text-green-200/90 leading-relaxed">{ecoTip}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      </div>
    </motion.div>
  )
}

export default EcoImpact

