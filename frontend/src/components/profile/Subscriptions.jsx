/**
 * Subscriptions Component
 */

import React from 'react'

const Subscriptions = ({ subscriptions }) => {
  return (
    <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-6 slide-up" style={{ animationDelay: '0.25s' }}>
      <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">📱 Aktiv Abunəliklər</h3>
      {subscriptions && subscriptions.length > 0 ? (
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="flex items-center justify-between py-2 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-xl sub-icon-theme">
                  💳
                </div>
                <div>
                  <p className="text-white font-medium">{sub.merchant}</p>
                  <p className="text-xs text-white/60">{sub.category}</p>
                </div>
              </div>
              <span className="text-white font-bold">{typeof sub.amount === 'number' ? sub.amount.toFixed(2) : '0.00'} ₼</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/60 text-center py-4">Aktiv abunəlik yoxdur</p>
      )}
    </div>
  )
}

export default Subscriptions
