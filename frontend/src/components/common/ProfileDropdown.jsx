/**
 * Profile Dropdown Component
 * User profile dropdown menu
 */

import React, { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

const ProfileDropdown = ({ user, show, onToggle, onLogout }) => {
  const dropdownRef = useRef(null)

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onToggle()
      }
    }

    if (show) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [show, onToggle])

  // Hamburger menu açıq olduqda profil dropdown-u bağla
  useEffect(() => {
    const menuPanel = document.getElementById('menu-panel')
    const checkMenuState = () => {
      if (menuPanel && menuPanel.classList.contains('active') && show) {
        onToggle() // Profil dropdown-u bağla
      }
    }

    const observer = new MutationObserver(checkMenuState)
    if (menuPanel) {
      observer.observe(menuPanel, {
        attributes: true,
        attributeFilter: ['class']
      })
    }

    return () => {
      observer.disconnect()
    }
  }, [show, onToggle])

  if (!user) return null

  const userInitial = user.username?.[0]?.toUpperCase() || 'D'

  return (
    <div className="relative flex-shrink-0 group">
      <button
        type="button"
        id="profile-dropdown-btn"
        className="relative focus:outline-none"
        onClick={(e) => {
          // Hamburger menu açıq olduqda profil dropdown-u açma
          const menuPanel = document.getElementById('menu-panel')
          if (menuPanel && menuPanel.classList.contains('active')) {
            return // Hamburger menu açıq olduqda profil dropdown-u açma
          }
          onToggle()
        }}
      >
        <div
          id="user-avatar"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm transition-all duration-400 group-hover:scale-110 hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          }}
        >
          {userInitial}
        </div>
      </button>
      {show && (
        <div
          ref={dropdownRef}
          id="profile-dropdown"
          className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl overflow-hidden shadow-xl z-[60]"
        >
          <Link
            to="/profile"
            className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 transition"
            onClick={onToggle}
          >
            Profil
          </Link>
          <button
            onClick={() => {
              onLogout()
              onToggle()
            }}
            className="block w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-white/10 transition"
          >
            Çıxış
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown

