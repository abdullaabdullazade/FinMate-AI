/**
 * Premium Upgrade Card Component
 * Premium-a keçid kartı
 */

import React from 'react'
import '../../styles/components/settings/premium-upgrade-card.css'

const PremiumUpgradeCard = ({ onUpgradeClick }) => {
  return (
    <div 
      className="glass-card p-4 sm:p-6 slide-up cursor-pointer" 
      style={{ animationDelay: '0.25s' }}
      onClick={onUpgradeClick}
    >
      <div className="premium-upgrade-background"></div>
      <div className="premium-upgrade-pattern"></div>
      
      <div className="premium-upgrade-content">
        <div className="premium-upgrade-info">
          <h2 className="premium-upgrade-title">
            ✨ Premium-a Keç
          </h2>
          <p className="premium-upgrade-description">
            AI məsləhətçi, limitsiz scan və daha çoxu!
          </p>
        </div>
        <div className="premium-upgrade-price">
          <span className="premium-price-amount">
            <span id="premium-price">4.99</span> <span id="premium-currency">AZN</span>
          </span>
          <span className="premium-price-period">/ay</span>
        </div>
      </div>
    </div>
  )
}

export default PremiumUpgradeCard

