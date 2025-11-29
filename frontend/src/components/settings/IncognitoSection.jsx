/**
 * Incognito Mode Section Component
 * Premium üzvlər üçün məxfilik modu
 */

import React, { useState, useEffect } from 'react'
import '../../styles/components/settings/incognito-section.css'

const IncognitoSection = ({ isPremium, incognitoMode, onIncognitoModeChange }) => {
  const [isEnabled, setIsEnabled] = useState(incognitoMode || false)

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('incognito-mode') === 'enabled'
    setIsEnabled(saved || incognitoMode)
  }, [incognitoMode])

  const handleToggle = (enabled) => {
    setIsEnabled(enabled)
    onIncognitoModeChange(enabled)
    
    // Apply incognito mode
    if (typeof window.toggleIncognitoMode === 'function') {
      window.toggleIncognitoMode(enabled)
    } else {
      // Fallback implementation
      if (enabled) {
        localStorage.setItem('incognito-mode', 'enabled')
        document.body.classList.add('incognito-mode')
      } else {
        localStorage.removeItem('incognito-mode')
        document.body.classList.remove('incognito-mode')
      }
    }
  }

  if (!isPremium) {
    return null
  }

  return (
    <div className="glass-card p-4 sm:p-6 slide-up" style={{ animationDelay: '0.35s' }}>
      <div className="section-header">
        <div className="section-icon incognito-icon">
          🕵️‍♂️
        </div>
        <div className="section-title-group">
          <h2 className="section-title">Məxfilik Modu</h2>
          <p className="section-subtitle">Bütün məbləğləri gizlətin</p>
        </div>
      </div>

      <div className="incognito-content">
        <p className="incognito-description">
          Bank tətbiqlərində olan xüsusiyyət. Bir düyməyə basanda bütün məbləğlər <strong>****</strong> ulduzla gizlənir.
        </p>

        <div className="incognito-toggle-card">
          <div className="incognito-toggle-info">
            <label className="incognito-toggle-label">Məxfilik Modu</label>
            <p className="incognito-toggle-description">
              Varlı adamların ehtiyacı - pulu çoxdur, gizlətmək istəyir
            </p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              id="incognito-mode-toggle"
              checked={isEnabled}
              onChange={(e) => handleToggle(e.target.checked)}
              className="toggle-input"
            />
            <span className="toggle-slider incognito-slider"></span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default IncognitoSection

