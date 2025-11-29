/**
 * Local Gems Component
 * HTML-dən köçürülmüş - Ucuz Alternativlər kartı
 */

import React from 'react'
import { motion } from 'framer-motion'

const LocalGems = ({ localGems, currency = '₼', incognitoMode = false }) => {
  if (!localGems || localGems.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card p-4 sm:p-6 slide-up"
      style={{ gridColumn: 'span 12' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-yellow-400/30 to-orange-500/30 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl sm:text-3xl">💎</span>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white">Ucuz Alternativlər</h3>
          <p className="text-xs sm:text-sm text-white/60">Pul qənaət etmək üçün məsləhətlər</p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {localGems.map((gem, index) => (
          <div key={index} className="bg-white/5 rounded-xl p-3 sm:p-4 border border-white/10 hover:bg-white/10 transition-all">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg sm:text-xl">📍</span>
                  <h4 className="text-sm sm:text-base font-bold text-white truncate">{gem.merchant}</h4>
                  <span className="text-xs sm:text-sm text-white/70">
                    • {incognitoMode ? '****' : gem.amount.toFixed(2)} {currency}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/60">{gem.category}</p>
              </div>
            </div>

            <div className="mt-2 sm:mt-3 space-y-2">
              {gem.alternatives && gem.alternatives.map((alt, altIndex) => (
                <div key={altIndex} className="flex items-start gap-2 bg-white/5 rounded-lg p-2 sm:p-2.5">
                  <span className="text-base sm:text-lg flex-shrink-0">
                    {alt.is_tip ? '💡' : '✨'}
                  </span>
                  <div className="flex-1 min-w-0">
                    {alt.price && alt.savings ? (
                      <>
                        <p className="text-xs sm:text-sm font-medium text-white">
                          <strong>{alt.name}</strong> - {incognitoMode ? '****' : alt.price.toFixed(2)} {currency}
                        </p>
                        <p className="text-xs text-green-400 mt-0.5">
                          💰 {incognitoMode ? '****' : alt.savings.toFixed(2)} {currency} qənaət (
                          {gem.amount > 0
                            ? ((alt.savings / gem.amount) * 100).toFixed(0)
                            : 0}
                          %)
                        </p>
                      </>
                    ) : alt.special_offer ? (
                      <>
                        <p className="text-xs sm:text-sm font-medium text-white">
                          <strong>{alt.name}</strong> - {alt.special_offer}
                        </p>
                        <p className="text-xs text-yellow-400 mt-0.5">{alt.description}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs sm:text-sm font-medium text-white">
                          <strong>{alt.name}</strong>
                        </p>
                        <p className="text-xs text-white/70 mt-0.5">{alt.description}</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs sm:text-sm text-white/60 text-center">
          💡 İpucu: Chat-də "Starbucks bahadır" yazsan, daha çox alternativ görəcəksən!
        </p>
      </div>
    </motion.div>
  )
}

export default LocalGems

