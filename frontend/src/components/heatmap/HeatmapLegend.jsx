/**
 * Heatmap Legend Component
 * HTML/CSS-dən bir-bir köçürülmüş versiya
 */

import React from 'react'

const HeatmapLegend = ({ totalMerchants }) => {
  return (
    <div className="mt-4 flex items-center gap-4 text-sm text-white/70">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
        <span>Xərc nöqtəsi</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white/50">|</span>
        <span>{totalMerchants} merchant</span>
      </div>
    </div>
  )
}

export default HeatmapLegend

