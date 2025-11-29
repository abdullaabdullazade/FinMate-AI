/**
 * Preferences Section Component
 * Səsli əmrlər, səsləndirmə, oxunaqlılıq rejimi
 */

import React from 'react'
import '../../styles/components/settings/preferences-section.css'

const PreferencesSection = ({
  voiceEnabled,
  voiceMode,
  readabilityMode,
  onVoiceEnabledChange,
  onVoiceModeChange,
  onReadabilityModeChange,
  isPremium = false
}) => {
  return (
    <div className="glass-card p-4 sm:p-6 slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="section-header">
        <div className="section-icon preferences-icon">
          ⚙️
        </div>
        <div className="section-title-group">
          <h2 className="section-title">Tərcihlər</h2>
          <p className="section-subtitle">Tətbiqi özünüzə uyğunlaşdırın</p>
        </div>
      </div>

      <div className="preferences-grid">
        {/* Voice Commands Toggle - Premium */}
        <div className="preference-card">
          <div className="preference-content">
            <div className="preference-info">
              <label className="preference-label">Səsli Əmrlər {!isPremium && <span className="text-xs text-pink-400">(Premium)</span>}</label>
              <p className="preference-description">Mikrofon ilə xərc əlavə et</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="voice_enabled"
                checked={voiceEnabled}
                disabled={!isPremium}
                onChange={(e) => {
                  if (!isPremium) {
                    return
                  }
                  onVoiceEnabledChange(e.target.checked)
                }}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Voice Mode Toggle (TTS) - Premium */}
        <div className="preference-card">
          <div className="preference-content">
            <div className="preference-info">
              <label className="preference-label">🔊 Səsləndirmə {!isPremium && <span className="text-xs text-pink-400">(Premium)</span>}</label>
              <p className="preference-description">Mətnləri səsli oxumaq</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="voice-mode-toggle"
                checked={voiceMode}
                disabled={!isPremium}
                onChange={(e) => {
                  if (!isPremium) {
                    return
                  }
                  onVoiceModeChange(e.target.checked)
                }}
                className="toggle-input"
              />
              <span className="toggle-slider voice-mode-slider"></span>
            </label>
          </div>
        </div>

        {/* Readability Mode Toggle */}
        <div className="preference-card preference-card-full">
          <div className="preference-content">
            <div className="preference-info">
              <label className="preference-label">👁️ Oxunaqlılıq Rejimi</label>
              <p className="preference-description">Gözü zəif görənlər üçün böyük yazı</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                id="readability-mode-toggle"
                name="readability_mode"
                checked={readabilityMode}
                onChange={(e) => {
                  const enabled = e.target.checked
                  onReadabilityModeChange(enabled)
                  // Immediately apply readability mode
                  if (typeof window.toggleReadabilityMode === 'function') {
                    window.toggleReadabilityMode(enabled)
                  } else {
                    // Fallback
                    if (enabled) {
                      document.body.classList.add('readability-mode')
                      localStorage.setItem('readability-mode', 'enabled')
                    } else {
                      document.body.classList.remove('readability-mode')
                      localStorage.setItem('readability-mode', 'disabled')
                    }
                  }
                }}
                className="toggle-input"
              />
              <span className="toggle-slider readability-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PreferencesSection

