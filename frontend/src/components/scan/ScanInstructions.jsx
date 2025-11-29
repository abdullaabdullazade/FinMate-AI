/**
 * Scan Instructions Component
 * How it works section - Mobile responsive
 */

import React from 'react'

const ScanInstructions = () => {
  return (
    <div className="glass-card p-4 sm:p-5 mt-6 sm:mt-8 slide-up" style={{ animationDelay: '0.3s' }}>
      <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
        <span className="text-xl sm:text-2xl">💡</span> Necə işləyir?
      </h3>
      <ul className="space-y-2 sm:space-y-3 text-white/70 text-sm sm:text-base">
        <li className="flex items-start gap-2 sm:gap-3 group">
          <span className="text-green-400 mt-0.5 sm:mt-1 text-lg sm:text-xl group-hover:scale-110 transition-transform flex-shrink-0">
            ✓
          </span>
          <span className="group-hover:text-white transition-colors">
            Çekin şəklini aydın çəkin və ya yükləyin
          </span>
        </li>
        <li className="flex items-start gap-2 sm:gap-3 group">
          <span className="text-green-400 mt-0.5 sm:mt-1 text-lg sm:text-xl group-hover:scale-110 transition-transform flex-shrink-0">
            ✓
          </span>
          <span className="group-hover:text-white transition-colors">AI avtomatik olaraq oxuyur</span>
        </li>
      </ul>
    </div>
  )
}

export default ScanInstructions

