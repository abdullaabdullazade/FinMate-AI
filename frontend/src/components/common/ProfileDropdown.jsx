/**
 * Profile Dropdown Component
 * User profile dropdown menu
 */

import React, { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import LogoutConfirmModal from './LogoutConfirmModal'

const ProfileDropdown = ({ user, show, onToggle, onLogout }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const dropdownRef = useRef(null)

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      const profileBtn = document.getElementById('profile-dropdown-btn')
      if (
        show &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileBtn &&
        !profileBtn.contains(event.target)
      ) {
        onToggle()
      }
    }

    if (show) {
      // setTimeout ilə əlavə et ki, click event-i düzgün işləsin
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)
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
        className="relative focus:outline-none touch-manipulation"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
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
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-white font-bold text-[10px] sm:text-xs transition-all duration-400 group-hover:scale-110 hover:scale-110"
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
          className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl overflow-hidden shadow-xl"
          style={{
            zIndex: 10001,
            pointerEvents: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            to="/profile"
            className="flex items-center gap-2 px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/10 transition"
            onClick={onToggle}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profil
          </Link>
          <div className="border-t border-white/10"></div>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggle()
              setShowLogoutModal(true)
            }}
            className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition font-medium"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Çıxış
          </button>
        </div>
      )}

      {/* Logout Confirm Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={onLogout}
      />
    </div>
  )
}

export default ProfileDropdown

