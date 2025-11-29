/**
 * Navigation Component
 * Desktop sidebar navigation - base.html-ə bir-bir uyğun
 * Sıralama: Dashboard, AI Chat, Skan et, Profil, Hədiyyələr, Ayarlar, Dream Vault, Xəritəm
 */

import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Navigation = ({ user }) => {
  const location = useLocation()

  // base.html-dəki sıralama: Dashboard, AI Chat, Skan et, Profil, Hədiyyələr, Ayarlar, Dream Vault, Xəritəm
  const desktopItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      path: '/chat',
      label: 'AI Chat',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      path: '/scan',
      label: 'Skan et',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
        </svg>
      ),
    },
    {
      path: '/profile',
      label: 'Profil',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      path: '/rewards',
      label: 'Hədiyyələr',
      icon: <span className="text-2xl">🎁</span>,
    },
    {
      path: '/settings',
      label: 'Ayarlar',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      path: '/dream-vault',
      label: 'Dream Vault',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          />
        </svg>
      ),
    },
    {
      path: '/heatmap',
      label: 'Xəritəm',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M2 12a10 10 0 1020 0 10 10 0 00-20 0zm10-7a7 7 0 00-7 7c0 3.866 3.134 7 7 7a7 7 0 007-7c0-3.866-3.134-7-7-7z"
          />
        </svg>
      ),
    },
  ]

  // Menu item render - base.html-dəki class-lara uyğun
  const MenuItem = ({ item }) => {
    const isActive = location.pathname === item.path
    return (
      <Link
        to={item.path}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
          isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        {item.icon}
        <span className="font-medium">{item.label}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Desktop Sidebar Navigation - base.html-ə bir-bir uyğun */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 glass z-40 pt-24">
        <nav className="p-6 space-y-2">
          {desktopItems.map((item) => (
            <MenuItem key={item.path} item={item} />
          ))}
        </nav>
      </div>
    </>
  )
}

export default Navigation
