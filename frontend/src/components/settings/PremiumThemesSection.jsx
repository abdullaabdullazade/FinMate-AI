/**
 * Premium Themes Section Component
 * Premium üzvlər üçün ekskluziv temalar
 */

import React, { useState, useEffect } from 'react'
import '../../styles/components/settings/premium-themes-section.css'

const PremiumThemesSection = ({ isPremium, currentTheme, onThemeChange }) => {
  const [activeTheme, setActiveTheme] = useState(currentTheme || 'default')

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('premium-theme')
    if (savedTheme && ['gold', 'midnight', 'ocean', 'forest', 'sunset', 'royal'].includes(savedTheme)) {
      setActiveTheme(savedTheme)
    }
  }, [])

  const themes = [
    { id: 'gold', name: 'Investor Gold', emoji: '✨', description: 'Qızıl tema' },
    { id: 'midnight', name: 'Midnight', emoji: '🌙', description: 'Tam qara tema' },
    { id: 'ocean', name: 'Ocean', emoji: '🌊', description: 'Okean mavisi' },
    { id: 'forest', name: 'Forest', emoji: '🌲', description: 'Meşə yaşılı' },
    { id: 'sunset', name: 'Sunset', emoji: '🌅', description: 'Gün batımı' },
    { id: 'royal', name: 'Royal Purple', emoji: '👑', description: 'Kral bənövşəyi' },
  ]

  const handleThemeClick = (themeId) => {
    setActiveTheme(themeId)
    onThemeChange(themeId)
    
    // Apply theme to body/html
    const body = document.body
    const html = document.documentElement
    const themeClasses = ['theme-gold', 'theme-midnight', 'theme-ocean', 'theme-forest', 'theme-sunset', 'theme-royal']
    
    themeClasses.forEach(cls => {
      body.classList.remove(cls)
      html.classList.remove(cls)
    })
    
    if (themeId !== 'default') {
      const themeMap = {
        'gold': 'theme-gold',
        'midnight': 'theme-midnight',
        'ocean': 'theme-ocean',
        'forest': 'theme-forest',
        'sunset': 'theme-sunset',
        'royal': 'theme-royal'
      }
      
      const themeClass = themeMap[themeId]
      if (themeClass) {
        body.classList.add(themeClass)
        html.classList.add(themeClass)
        localStorage.setItem('premium-theme', themeId)
      }
    } else {
      localStorage.removeItem('premium-theme')
      html.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }

  if (!isPremium) {
    return null
  }

  return (
    <div className="settings-section premium-themes-section slide-up" style={{ animationDelay: '0.3s' }}>
      <div className="section-header">
        <div className="section-icon premium-themes-icon">
          🎨
        </div>
        <div className="section-title-group">
          <h2 className="section-title">Ekskluziv Temalar</h2>
          <p className="section-subtitle">Premium üzvlərimiz üçün xüsusi temalar</p>
        </div>
      </div>

      <div className="premium-themes-content">
        <p className="themes-description">
          Premium üzvlərimiz üçün xüsusi temalar mövcuddur. İstədiyiniz temanı seçin.
        </p>

        <div className="themes-grid">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleThemeClick(theme.id)}
              className={`theme-card ${activeTheme === theme.id ? 'theme-card-active' : ''} theme-card-${theme.id}`}
            >
              <div className="theme-card-overlay"></div>
              <div className="theme-card-content">
                <div className="theme-emoji">{theme.emoji}</div>
                <h3 className="theme-name">{theme.name}</h3>
                <p className="theme-description">{theme.description}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => handleThemeClick('default')}
          className="reset-theme-button"
        >
          Standart temaya qayıt
        </button>
      </div>
    </div>
  )
}

export default PremiumThemesSection

