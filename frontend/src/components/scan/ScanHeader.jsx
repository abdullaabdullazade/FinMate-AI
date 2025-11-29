/**
 * Scan Header Component
 * Main header for scan page - Mobile responsive
 */

import React from 'react'

const ScanHeader = () => {
  return (
    <div className="glass-card p-5 sm:p-6 mb-5 sm:mb-6 text-center slide-up">
      <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📸</div>
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Çek Skan Et</h2>
      <p className="text-white/70 text-sm sm:text-base">Çekin şəklini yükləyin, AI avtomatik məlumatları çıxarsın</p>
    </div>
  )
}

export default ScanHeader

