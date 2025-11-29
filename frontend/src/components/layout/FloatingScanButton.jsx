/**
 * Floating Scan Button Component
 * Mobile üçün floating scan button - Professional dizayn
 */

import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const FloatingScanButton = () => {
  const location = useLocation()

  // Chat səhifəsində göstərmə
  if (location.pathname === '/chat') {
    return null
  }

  return (
    <Link
      to="/scan"
      className="fixed top-20 right-4 sm:right-6 px-4 py-2 rounded-full flex items-center gap-2 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 z-30 lg:hidden scan-button-float"
      style={{
        background: 'linear-gradient(135deg, #FF8C00 0%, #FFA500 50%, #FFB347 100%)',
        boxShadow: '0 4px 16px rgba(255, 140, 0, 0.3), 0 2px 8px rgba(255, 165, 0, 0.2)',
      }}
    >
      <svg
        className="w-5 h-5 text-white flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span className="text-white font-semibold text-sm whitespace-nowrap">Scan</span>
    </Link>
  )
}

export default FloatingScanButton
