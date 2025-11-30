/**
 * Heatmap Page Component
 */

import React, { useState, useEffect } from 'react'
import HeatmapHeader from '../components/heatmap/HeatmapHeader'
import HeatmapMap from '../components/heatmap/HeatmapMap'
import HeatmapLegend from '../components/heatmap/HeatmapLegend'
import HeatmapStats from '../components/heatmap/HeatmapStats'

const Heatmap = () => {
  const [heatmapData, setHeatmapData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/heatmap', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        })

        if (!response.ok) {
          throw new Error('Xəta baş verdi')
        }

        const data = await response.json()
        setHeatmapData(data)
      } catch (err) {
        console.error('Heatmap data error:', err)
        setError(err.message || 'Xəta baş verdi')
      } finally {
        setLoading(false)
      }
    }

    fetchHeatmapData()
  }, [])

  if (loading) {
    return (
      <div className="px-3 sm:px-4 md:px-6 pb-24 sm:pb-32">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white">Yüklənir...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-3 sm:px-4 md:px-6 pb-24 sm:pb-32">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-500">Xəta: {error}</div>
        </div>
      </div>
    )
  }

  if (!heatmapData || !heatmapData.points) {
    return (
      <div className="px-3 sm:px-4 md:px-6 pb-24 sm:pb-32">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white/70">Məlumat tapılmadı</div>
        </div>
      </div>
    )
  }

  const { points, stats } = heatmapData
  const uniqueMerchants = new Set(points.map(p => p.merchant)).size

  return (
    <div className="px-3 sm:px-4 md:px-6 pb-24 sm:pb-32">
      {/* Header Card */}
      <div className="glass-card p-6 mb-6 slide-up">
        <HeatmapHeader totalPoints={points.length} />
        
        {/* Map Container */}
        <HeatmapMap points={points} />
        
        {/* Legend */}
        <HeatmapLegend totalMerchants={uniqueMerchants} />
      </div>

      {/* Stats Card */}
      <HeatmapStats stats={stats} />
    </div>
  )
}

export default Heatmap
