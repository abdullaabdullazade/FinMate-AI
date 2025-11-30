/**
 * Export Buttons Component
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'

const ExportButtons = () => {
  const navigate = useNavigate()



  return (
    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-center gap-3 slide-up" style={{ animationDelay: '0.2s' }}>

      <button
        onClick={() => navigate('/heatmap')}
        className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all border border-white/20 text-sm sm:text-base"
      >
        🗺️ Xəritəm
      </button>
    </div>
  )
}

export default ExportButtons
