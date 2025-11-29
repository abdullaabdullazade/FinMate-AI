/**
 * App Info Component
 * profile.html-dəki app info strukturunu təkrarlayır
 */

import React from 'react'

const AppInfo = () => {
  return (
    <div className="glass-card p-4 sm:p-6 slide-up" style={{ animationDelay: '0.3s' }}>
      <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">ℹ️ FinMate AI Haqqında</h3>
      <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4">
        Google Gemini AI ilə gücləndirilən şəxsi maliyyə məsləhətçiniz. Maliyyə idarəetməsini sadə, ağıllı və
        əlçatan edir.
      </p>
      <div className="space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between text-white/70">
          <span>Version</span>
          <span className="text-white">1.0.0</span>
        </div>
        <div className="flex justify-between text-white/70">
          <span>AI Model</span>
          <span className="text-white">Gemini 2.0 Flash</span>
        </div>
        <div className="flex justify-between text-white/70">
          <span>Tech Stack</span>
          <span className="text-white">FastAPI + React</span>
        </div>
      </div>
    </div>
  )
}

export default AppInfo
