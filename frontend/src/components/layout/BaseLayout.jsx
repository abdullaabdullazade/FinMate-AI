/**
 * Base Layout Component
 * Bütün səhifələr üçün əsas layout - Professional dizayn
 */

import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'
import FloatingScanButton from './FloatingScanButton'
import HamburgerMenu from './HamburgerMenu'
import { useAuth } from '../../contexts/AuthContext'

const BaseLayout = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen relative">
      {/* Hamburger Menu Panel & Backdrop - base.html strukturuna uyğun (body-nin əsas hissəsində) */}
      <HamburgerMenu user={user} />

      {/* Top Header */}
      <Header user={user} />

      {/* Main Content Area */}
      <div className="pt-20 sm:pt-24 pb-8 px-4">
        <div className="w-full lg:max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>

      {/* Desktop Sidebar Navigation */}
      <Navigation user={user} />

      {/* Floating Scan Button (Mobile Only) */}
      <FloatingScanButton />
    </div>
  )
}

export default BaseLayout
