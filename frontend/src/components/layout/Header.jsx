/**
 * Header Component
 * Top navigation bar - logo, theme toggle, alerts, profile
 * Professional dizayn ilə
 */

import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import ThemeToggle from '../common/ThemeToggle'
import AlertBell from '../common/AlertBell'
import UserStats from '../common/UserStats'
import ProfileDropdown from '../common/ProfileDropdown'
import HamburgerMenu from './HamburgerMenu'

const Header = ({ user }) => {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)

  return (
    <>
      {/* Top Bar - Professional Glassmorphism */}
      <div className="glass fixed top-0 left-0 right-0 z-50 px-2 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Left Side - Hamburger + Logo */}
          <div className="min-w-0 flex-1 flex items-center gap-2">
            {/* Hamburger Menu Button (Mobile Only) */}
            <HamburgerMenu user={user} />

            {/* Logo */}
            <Link
              to="/"
              className="min-w-0 flex-1 flex items-center gap-2 hover:opacity-90 transition-opacity group"
            >
              <div className="relative">
                <img
                  src="/static/icons/icon-192.png"
                  alt="FinMate AI"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0 transition-transform group-hover:scale-110"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm bg-gradient-to-br from-purple-500 to-pink-500 hidden"
                >
                  F
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                  FinMate AI
                </h1>
                <p className="text-[9px] sm:text-[10px] text-white/70">
                  Your Personal CFO
                </p>
              </div>
            </Link>
          </div>

          {/* Right Side - Theme, Alerts, Profile */}
          <div className="flex items-center gap-2 sm:gap-3 relative flex-shrink-0">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Alert Bell */}
            <AlertBell />

            {/* User Stats */}
            <UserStats user={user} />

            {/* Profile Dropdown */}
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
