/**
 * Theme Context
 * theme.js-dən köçürülmüşdür
 * Dark/Light theme və Premium theme idarəsi
 */

import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // Apply theme before render to prevent flash
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      // Add preload class
      document.documentElement.classList.add('preload')
      const savedTheme = localStorage.getItem('theme') || 'light'
      document.documentElement.setAttribute('data-theme', savedTheme)
      return savedTheme
    }
    return 'light'
  })

  const [premiumTheme, setPremiumTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('premium-theme') || null
    }
    return null
  })

  /**
   * Theme dəyişdir
   */
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  /**
   * Premium theme tətbiq et
   */
  const applyPremiumTheme = (premiumThemeName) => {
    const validThemes = ['gold', 'midnight', 'ocean', 'forest', 'sunset', 'royal']
    const themes = ['theme-gold', 'theme-midnight', 'theme-ocean', 'theme-forest', 'theme-sunset', 'theme-royal']

    // Remove all theme classes
    themes.forEach((t) => {
      document.body.classList.remove(t)
      document.documentElement.classList.remove(t)
    })

    if (premiumThemeName && premiumThemeName !== 'default' && validThemes.includes(premiumThemeName)) {
      document.body.classList.add(`theme-${premiumThemeName}`)
      document.documentElement.classList.add(`theme-${premiumThemeName}`)
      localStorage.setItem('premium-theme', premiumThemeName)
      setPremiumTheme(premiumThemeName)
    } else {
      localStorage.removeItem('premium-theme')
      setPremiumTheme(null)
    }

    // Trigger custom event
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: premiumThemeName } }))
  }

  /**
   * Component mount olduqda theme-i tətbiq et
   */
  useEffect(() => {
    // Apply saved premium theme
    if (premiumTheme) {
      const validThemes = ['gold', 'midnight', 'ocean', 'forest', 'sunset', 'royal']
      if (validThemes.includes(premiumTheme)) {
        applyPremiumTheme(premiumTheme)
      }
    }

    // Remove preload class after render
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('preload')
      document.body.classList.remove('no-transition')
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const value = {
    theme,
    premiumTheme,
    toggleTheme,
    applyPremiumTheme,
    isDark: theme === 'dark',
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
