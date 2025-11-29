/**
 * Heatmap Header Component
 * HTML/CSS-dən bir-bir köçürülmüş versiya
 */

import React from 'react'

const HeatmapHeader = ({ totalPoints }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-2xl font-bold text-white">🗺️ Xərc Xəritəsi</h2>
        <p className="text-white/70 text-sm">Xərclərinizin GPS koordinatları</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-white/60">Ümumi nöqtə</p>
        <p className="text-2xl font-bold text-white">{totalPoints}</p>
      </div>
    </div>
  )
}

export default HeatmapHeader

