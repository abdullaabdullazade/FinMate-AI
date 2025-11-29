/**
 * Hamburger Menu Component
 * hamburger_menu.js-dən köçürülmüşdür
 * Swipe to close, ESC key, backdrop click funksiyaları daxildir
 */

import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { HomeIcon, ChatIcon, CameraIcon, VaultIcon, MapIcon, ProfileIcon, SettingsIcon, LogoutIcon, CloseIcon } from '../icons/Icons'

const HamburgerMenu = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { logout } = useAuth()
  const menuPanelRef = useRef(null)
  const backdropRef = useRef(null)
  const touchStartXRef = useRef(0)
  const touchEndXRef = useRef(0)

  // Location dəyişəndə menu-nu bağla
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Menu açıq olduqda body scroll-u blokla
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('menu-open')
      // Focus close button for accessibility
      setTimeout(() => {
        const closeBtn = document.getElementById('menu-close-btn')
        if (closeBtn) closeBtn.focus()
      }, 100)
    } else {
      document.body.classList.remove('menu-open')
    }
    return () => {
      document.body.classList.remove('menu-open')
    }
  }, [isOpen])

  // ESC key ilə bağla
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  // Window resize - desktop-də bağla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  // Swipe to close
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.changedTouches[0].screenX
  }

  const handleTouchEnd = (e) => {
    touchEndXRef.current = e.changedTouches[0].screenX
    const swipeDistance = touchStartXRef.current - touchEndXRef.current
    if (swipeDistance < -100) {
      setIsOpen(false)
    }
  }

  const menuItems = [
    { path: '/', label: 'Ana səhifə', icon: HomeIcon },
    { path: '/chat', label: 'AI Chat', icon: ChatIcon },
    { path: '/scan', label: 'Çek Skan', icon: CameraIcon },
  ]

  const featureItems = [
    { path: '/dream-vault', label: 'Dream Vault', icon: VaultIcon },
    { path: '/rewards', label: 'Hədiyyələr', icon: null, emoji: '🎁' },
    { path: '/heatmap', label: 'Xəritə', icon: MapIcon },
  ]

  const accountItems = [
    { path: '/profile', label: 'Profil', icon: ProfileIcon },
    { path: '/settings', label: 'Ayarlar', icon: SettingsIcon },
  ]

  const userInitial = user?.username?.[0]?.toUpperCase() || 'D'

  return (
    <>
      {/* Hamburger Button */}
      <button
        id="hamburger-btn"
        className={`hamburger-btn-navbar lg:hidden ${isOpen ? 'active' : ''}`}
        aria-label="Menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`hamburger-icon ${isOpen ? 'active' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Menu Backdrop */}
      <div
        ref={backdropRef}
        id="menu-backdrop"
        className={`menu-backdrop ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sliding Menu Panel */}
      <nav
        ref={menuPanelRef}
        id="menu-panel"
        className={`menu-panel ${isOpen ? 'active' : ''}`}
        aria-hidden={!isOpen}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Menu Header */}
        <div className="menu-header">
          <div className="menu-header-content">
            <div className="menu-avatar">
              {userInitial}
            </div>
            <div className="menu-user-info">
              <span className="menu-username">
                {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1) || 'Demo'}
              </span>
              <span className="menu-subtitle">Your Personal CFO</span>
            </div>
            <button
              id="menu-close-btn"
              className="menu-close-btn"
              aria-label="Close Menu"
              onClick={() => setIsOpen(false)}
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="menu-section">
          <div className="menu-section-title">Əsas</div>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setTimeout(() => setIsOpen(false), 150)}
              >
                <div className="menu-item-icon">
                  <Icon />
                </div>
                <span className="menu-item-label">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Features */}
        <div className="menu-section">
          <div className="menu-section-title">Xüsusiyyətlər</div>
          {featureItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setTimeout(() => setIsOpen(false), 150)}
              >
                <div className="menu-item-icon">
                  {Icon ? <Icon /> : <span className="text-2xl">{item.emoji}</span>}
                </div>
                <span className="menu-item-label">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Settings & Profile */}
        <div className="menu-section">
          <div className="menu-section-title">Hesab</div>
          {accountItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`menu-item ${isActive ? 'active' : ''}`}
                onClick={() => setTimeout(() => setIsOpen(false), 150)}
              >
                <div className="menu-item-icon">
                  <Icon />
                </div>
                <span className="menu-item-label">{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={() => {
              logout()
              setIsOpen(false)
            }}
            className="menu-item logout"
          >
            <div className="menu-item-icon">
              <LogoutIcon />
            </div>
            <span className="menu-item-label">Çıxış</span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default HamburgerMenu
