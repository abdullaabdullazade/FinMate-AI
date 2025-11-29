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
import UserStats from '../common/UserStats'
import ProfileDropdown from '../common/ProfileDropdown'
import LogoutConfirmModal from '../common/LogoutConfirmModal'

const Header = ({ user }) => {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const checkIntervalRef = useRef(null)
  // Hamburger menu açıq olduqda profil dropdown bağla
  useEffect(() => {
    const menuPanel = document.getElementById('menu-panel')
    const checkMenuState = () => {
      if (menuPanel) {
        const isMenuOpen = menuPanel.classList.contains('active')
        if (isMenuOpen) {
          setShowProfileDropdown(false)
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

  // Network status yoxlaması - Header-da görünən indikator üçün (real internet yoxlaması)
  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        // Real internet yoxlaması - xarici server-ə request
        // Image yükləməyə cəhd et (CORS problemi olmayacaq)
        let isActuallyOnline = false
        
        // Bir neçə yoxlama et - ən azı biri uğurlu olsa, online say
        const checkPromises = [
          // Google favicon (kiçik və sürətli)
          new Promise((resolve) => {
            const img = new Image()
            const timeoutId = setTimeout(() => {
              img.onload = null
              img.onerror = null
              resolve(false)
            }, 2000)
            
            img.onload = () => {
              clearTimeout(timeoutId)
              resolve(true)
            }
            img.onerror = () => {
              clearTimeout(timeoutId)
              resolve(false)
            }
            img.src = 'https://www.google.com/favicon.ico?t=' + Date.now() // Cache bypass
          }),
          
          // Cloudflare favicon
          new Promise((resolve) => {
            const img = new Image()
            const timeoutId = setTimeout(() => {
              img.onload = null
              img.onerror = null
              resolve(false)
            }, 2000)
            
            img.onload = () => {
              clearTimeout(timeoutId)
              resolve(true)
            }
            img.onerror = () => {
              clearTimeout(timeoutId)
              resolve(false)
            }
            img.src = 'https://www.cloudflare.com/favicon.ico?t=' + Date.now()
          }),
        ]
        
        // Ən azı biri uğurlu olsa, online say
        const results = await Promise.allSettled(checkPromises)
        isActuallyOnline = results.some(result => result.status === 'fulfilled' && result.value === true)
        
        // Əgər xarici yoxlama işləmədisə, local API-yə də yoxla (WiFi bağlı ola bilər, amma internet yoxdur)
        if (!isActuallyOnline) {
          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 2000)
            
            const response = await fetch('/api/dashboard-data', {
              method: 'GET',
              cache: 'no-cache',
              signal: controller.signal,
              credentials: 'include',
            })
            
            clearTimeout(timeoutId)
            // Local API işləyirsə, amma xarici internet yoxdursa, hələ də offline say
            // Çünki real internet yoxdur
            isActuallyOnline = false
          } catch (localError) {
            // Local API də işləmir - tam offline
            isActuallyOnline = false
          }
        }
        
        setIsOnline(isActuallyOnline)
      } catch (error) {
        // Network error - offline
        setIsOnline(false)
      }
    }

    // Browser events
    const handleOnlineEvent = () => {
      setTimeout(() => {
        checkNetworkStatus()
      }, 500)
    }

    const handleOfflineEvent = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnlineEvent)
    window.addEventListener('offline', handleOfflineEvent)

    // İlk yoxlama
    checkNetworkStatus()

    // Periodic check - hər 3 saniyədə bir
    checkIntervalRef.current = setInterval(() => {
      checkNetworkStatus()
    }, 3000)

    return () => {
      window.removeEventListener('online', handleOnlineEvent)
      window.removeEventListener('offline', handleOfflineEvent)
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* Top Bar - Glass format dark mode */}
      <div className="glass fixed top-0 left-0 right-0 z-40 px-2 sm:px-3 py-1.5 sm:py-2">
        <div className="flex items-center justify-between max-w-md mx-auto w-full gap-1 sm:gap-2">
          {/* Left Side - Hamburger + Logo - Mobile responsive */}
          <div className="min-w-0 flex-1 flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
            {/* Hamburger Menu Button */}
            <button 
              id="hamburger-btn" 
              className="hamburger-btn-navbar lg:hidden flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9" 
              aria-label="Menu"
              aria-expanded="false"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                
                const menuPanel = document.getElementById('menu-panel')
                const menuBackdrop = document.getElementById('menu-backdrop')
                const hamburgerBtn = document.getElementById('hamburger-btn')
                const profileDropdown = document.getElementById('profile-dropdown')
                
                if (!menuPanel || !menuBackdrop || !hamburgerBtn) {
                  console.warn('Hamburger menu elements not found')
                  return
                }
                
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
                  
                  menuPanel.classList.add('active')
                  menuBackdrop.classList.add('active')
                  hamburgerBtn.classList.add('active')
                  document.body.classList.add('menu-open')
                  menuPanel.setAttribute('aria-hidden', 'false')
                  hamburgerBtn.setAttribute('aria-expanded', 'true')
                  
                  // Force reflow to ensure animation
                  menuPanel.offsetHeight
                  
                  setTimeout(() => {
                    const closeBtn = document.getElementById('menu-close-btn')
                    if (closeBtn) closeBtn.focus()
                  }, 100)
                }
              }}
            >
              <div className="hamburger-icon">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="min-w-0 flex-1 flex items-center gap-1 sm:gap-1.5 hover:opacity-90 transition-opacity overflow-hidden"
            >
              <img
                src="/static/icons/icon-192.png"
                alt="FinMate AI"
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-lg flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <div className="min-w-0 overflow-hidden">
                <h1 className="text-xs sm:text-sm md:text-base font-bold text-white truncate">FinMate AI</h1>
                <p className="text-[6px] sm:text-[8px] md:text-[9px] text-white/70 truncate hidden sm:block">Your Personal CFO</p>
              </div>
            </Link>
          </div>

          {/* Right Side - Theme, Network Status, Profile */}
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 relative flex-shrink-0">
            {/* Network Status Indicator */}
            <div
              className="relative flex-shrink-0 hidden sm:block"
              title={isOnline ? 'İnternet bağlantısı mövcuddur' : 'İnternet bağlantısı yoxdur'}
            >
              <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse'
              }`}></div>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Stats */}
            <UserStats user={user} />

            {/* Logout Button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // Profile dropdown-u bağla
                setShowProfileDropdown(false)
                // Logout modal aç
                setShowLogoutModal(true)
              }}
              className="relative text-white/80 hover:text-white transition p-1 sm:p-1.5 flex-shrink-0 touch-manipulation"
              aria-label="Çıxış"
              type="button"
              title="Hesabdan çıx"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            <ProfileDropdown
              user={user}
              show={showProfileDropdown}
              onToggle={() => {
                // Profile dropdown-u toggle et
                setShowProfileDropdown(prev => !prev)
              }}
              onLogout={logout}
            />
          </div>
        </div>
      </div>

      {/* Logout Confirm Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
      />
    </>
  )
}

export default Header
