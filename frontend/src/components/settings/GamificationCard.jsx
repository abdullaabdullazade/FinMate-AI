/**
 * Gamification Card Component
 * Login streak və level göstəricisi
 */

import React from 'react'
import '../../styles/components/settings/gamification-card.css'

const GamificationCard = ({ loginStreak, levelTitle }) => {
  return (
    <div className="gamification-card slide-up" style={{ animationDelay: '0.3s' }}>
      <div className="gamification-background"></div>
      <div className="gamification-pattern"></div>
      
      <div className="gamification-content">
        <div className="gamification-info">
          <h2 className="gamification-title">
            🔥 Login Streak
            {levelTitle && (
              <span className="gamification-level-badge">{levelTitle}</span>
            )}
          </h2>
          <p className="gamification-description">
            Hər gün daxil olaraq XP qazanın!
          </p>
        </div>
        <div className="gamification-stats">
          <span className="gamification-streak">{loginStreak || 0}</span>
          <span className="gamification-streak-label">Gün</span>
        </div>
      </div>
    </div>
  )
}

export default GamificationCard

