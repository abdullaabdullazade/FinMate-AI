/**
 * Header Component
 * Top navigation bar - base.html-dən TAM KOPYALANMIŞ
 * Logo, theme toggle, alerts, profile - HTML/CSS strukturuna bir-bir uyğun
 */

import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import ThemeToggle from '../common/ThemeToggle'
import AlertBell from '../common/AlertBell'
import UserStats from '../common/UserStats'
import ProfileDropdown from '../common/ProfileDropdown'

const Header = ({ user }) => {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const alertPanelRef = useRef(null)
  const alertBellRef = useRef(null)
  const [showAlertPanel, setShowAlertPanel] = useState(false)

  // Alert panel toggle - base.html-dəki kimi
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showAlertPanel &&
        alertPanelRef.current &&
        !alertPanelRef.current.contains(event.target) &&
        alertBellRef.current &&
        !alertBellRef.current.contains(event.target)
      ) {
        setShowAlertPanel(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAlertPanel])

  // Hamburger menu açıq olduqda profil dropdown və alert panel bağla
  useEffect(() => {
    const menuPanel = document.getElementById('menu-panel')
    const checkMenuState = () => {
      if (menuPanel) {
        const isMenuOpen = menuPanel.classList.contains('active')
        if (isMenuOpen) {
          setShowProfileDropdown(false)
          setShowAlertPanel(false)
        }
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
  }, [])

  return (
    <>
      {/* Top Bar - base.html-dən TAM KOPYALANMIŞ (sətir 184-301) */}
      <div className="glass fixed top-0 left-0 right-0 z-50 px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          {/* Left Side - Hamburger + Logo - base.html strukturuna TAM UYĞUN */}
          <div className="min-w-0 flex-1 flex items-center gap-1.5 sm:gap-2 flex-shrink">
            {/* Hamburger Menu Button - Navbar Integrated (Mobile Only) - base.html sətir 188-195 */}
            <button 
              id="hamburger-btn" 
              className="hamburger-btn-navbar lg:hidden flex-shrink-0" 
              aria-label="Menu"
              aria-expanded="false"
              onClick={() => {
                const menuPanel = document.getElementById('menu-panel')
                const menuBackdrop = document.getElementById('menu-backdrop')
                const hamburgerBtn = document.getElementById('hamburger-btn')
                const profileDropdown = document.getElementById('profile-dropdown')
                
                if (menuPanel && menuBackdrop && hamburgerBtn) {
                  const isOpen = menuPanel.classList.contains('active')
                  if (isOpen) {
                    // Menu-nu bağla
                    menuPanel.classList.remove('active')
                    menuBackdrop.classList.remove('active')
                    hamburgerBtn.classList.remove('active')
                    document.body.classList.remove('menu-open')
                    menuPanel.setAttribute('aria-hidden', 'true')
                    hamburgerBtn.setAttribute('aria-expanded', 'false')
                  } else {
                    // Menu-nu aç - profil dropdown-u bağla
                    if (profileDropdown) {
                      profileDropdown.classList.add('hidden')
                    }
                    setShowProfileDropdown(false)
                    setShowAlertPanel(false)
                    
                    menuPanel.classList.add('active')
                    menuBackdrop.classList.add('active')
                    hamburgerBtn.classList.add('active')
                    document.body.classList.add('menu-open')
                    menuPanel.setAttribute('aria-hidden', 'false')
                    hamburgerBtn.setAttribute('aria-expanded', 'true')
                    setTimeout(() => {
                      const closeBtn = document.getElementById('menu-close-btn')
                      if (closeBtn) closeBtn.focus()
                    }, 100)
                  }
                }
              }}
            >
              <div className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>

            {/* Logo - base.html sətir 197-204 - TAM KOPYALANMIŞ */}
            <Link
              to="/"
              className="min-w-0 flex-1 flex items-center gap-1.5 sm:gap-2 hover:opacity-90 transition-opacity overflow-hidden"
            >
              <img
                src="/static/icons/icon-192.png"
                alt="FinMate AI"
                className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <div className="min-w-0 overflow-hidden">
                <h1 className="text-base sm:text-xl font-bold text-white truncate">FinMate AI</h1>
                <p className="text-[8px] sm:text-[10px] text-white/70 truncate">Your Personal CFO</p>
              </div>
            </Link>
          </div>

          {/* Right Side - Theme, Alerts, Profile - base.html sətir 206-299 - TAM KOPYALANMIŞ */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 relative flex-shrink-0">
            {/* Theme Toggle - base.html sətir 207-224 */}
            <ThemeToggle />

            {/* Alerts - base.html sətir 226-279 - TAM KOPYALANMIŞ */}
            <div className="relative">
              <button
                ref={alertBellRef}
                id="alert-bell"
                className="relative text-white/80 hover:text-white transition p-0.5 sm:p-1 flex-shrink-0"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowAlertPanel(!showAlertPanel)
                }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span
                  id="alert-counter"
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full shadow-lg"
                ></span>
              </button>
              {/* Alert Panel - base.html sətir 236-279 - TAM KOPYALANMIŞ */}
              {showAlertPanel && (
                <div
                  ref={alertPanelRef}
                  id="alert-panel"
                  className="absolute right-0 sm:right-14 top-10 sm:top-10 w-[calc(100vw-1rem)] sm:w-64 max-w-[calc(100vw-1rem)] sm:max-w-none glass-card rounded-xl shadow-2xl overflow-hidden z-[60]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-glass-border text-sm font-semibold text-text-primary">Bildirişlər (AI)</div>
                  <ul className="divide-y divide-glass-border text-sm">
                    <li className="px-4 py-3 flex gap-2 items-start group hover:bg-glass-bg transition-colors text-text-secondary">
                      <span className="text-amber-500 flex-shrink-0">⚠️</span>
                      <div className="flex-1 incognito-hidden" data-original="Diqqət: Keçən aya görə 15% çox xərcləmisən.">
                        Diqqət: Keçən aya görə 15% çox xərcləmisən.
                      </div>
                      <button
                        onClick={() => setShowAlertPanel(false)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary hover:text-text-primary flex-shrink-0 p-1"
                        aria-label="Bağla"
                        title="Ləğv et"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </li>
                    <li className="px-4 py-3 flex gap-2 items-start group hover:bg-glass-bg transition-colors text-text-secondary">
                      <span className="text-purple-500 flex-shrink-0">🎬</span>
                      <div className="flex-1">Netflix abunəliyin sabah bitir.</div>
                      <button
                        onClick={() => setShowAlertPanel(false)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary hover:text-text-primary flex-shrink-0 p-1"
                        aria-label="Bağla"
                        title="Ləğv et"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </li>
                    <li className="px-4 py-3 flex gap-2 items-start group hover:bg-glass-bg transition-colors text-text-secondary">
                      <span className="text-blue-500 flex-shrink-0">📈</span>
                      <div className="flex-1">28-ində büdcə limitini keçə bilərsən.</div>
                      <button
                        onClick={() => setShowAlertPanel(false)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary hover:text-text-primary flex-shrink-0 p-1"
                        aria-label="Bağla"
                        title="Ləğv et"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* User Stats - base.html sətir 281 - {% include "partials/user_stats.html" %} */}
            <UserStats user={user} />

            {/* Profile / Logout - base.html sətir 283-298 - TAM KOPYALANMIŞ */}
            <ProfileDropdown
              user={user}
              show={showProfileDropdown}
              onToggle={() => setShowProfileDropdown(!showProfileDropdown)}
              onLogout={logout}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
