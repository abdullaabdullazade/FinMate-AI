/**
 * Scanning Modal Component
 * Mobile responsive və səliqəli
 */

import React from 'react'

const ScanningModal = () => {
  return (
    <div
      id="scanModal"
      className="fixed inset-0 z-[200] backdrop-blur-sm flex items-center justify-center p-4"
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="text-center">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-green-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl">🧾</div>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Skan edilir...</h3>
        <p className="text-white/60 text-sm sm:text-base">Süni intellekt çeki emal edir</p>
      </div>
    </div>
  )
}

export default ScanningModal

