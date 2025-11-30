/**
 * Heatmap Stats Component
 */

import React from 'react'

const HeatmapStats = ({ stats }) => {
  const { total_amount, total_points, total_categories, average } = stats

  return (
    <div className="glass-card p-6 slide-up" style={{ animationDelay: '0.1s' }}>
      <h3 className="text-lg font-bold text-white mb-4">📊 Xərc Statistikası</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-white/60 text-xs mb-1">Ümumi</p>
          <p className="text-2xl font-bold text-white">{Math.round(total_amount)} ₼</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-white/60 text-xs mb-1">Nöqtələr</p>
          <p className="text-2xl font-bold text-white">{total_points}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-white/60 text-xs mb-1">Kateqoriya</p>
          <p className="text-2xl font-bold text-white">{total_categories}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-white/60 text-xs mb-1">Ortalama</p>
          <p className="text-2xl font-bold text-white">{Math.round(average)} ₼</p>
        </div>
      </div>
    </div>
  )
}

export default HeatmapStats

