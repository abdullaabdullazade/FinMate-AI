/**
 * Theme Toggle Component
 * theme.js-dən köçürülmüşdür
 * Dark/Light theme dəyişdirmə
 */

import React, { useEffect } from 'react'
import { SunIcon, MoonIcon } from '../icons/Icons'
import { useTheme } from '../../contexts/ThemeContext'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  // Apply theme immediately on mount (prevent flash)
  useEffect(() => {
    // Remove preload class after a short delay
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('preload')
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <button
      id="theme-toggle"
      className="relative text-white/80 hover:text-white transition p-1"
      title="Tema dəyişdir"
      onClick={toggleTheme}
    >
      {/* Sun icon (shown in dark mode) */}
      {theme === 'dark' ? (
        <SunIcon id="sun-icon" className="w-4 h-4 sm:w-5 sm:h-5" />
      ) : (
        <MoonIcon id="moon-icon" className="w-4 h-4 sm:w-5 sm:h-5" />
      )}
    </button>
  )
}

export default ThemeToggle
