/**
 * Settings Header Component
 */

import React from 'react'
import { Link } from 'react-router-dom'

const SettingsHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-10 slide-up gap-3">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
          Tənzimləmələr
        </h1>
        <p className="text-white/60 mt-1 sm:mt-2 text-sm sm:text-lg">Şəxsi seçimlərinizi və büdcənizi idarə edin</p>
      </div>
      <Link
        to="/"
        className="group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 text-sm sm:text-base"
      >
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Geri</span>
      </Link>
    </div>
  )
}

export default SettingsHeader
