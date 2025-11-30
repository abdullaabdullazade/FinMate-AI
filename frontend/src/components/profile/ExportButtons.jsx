/**
 * Export Buttons Component
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'

const ExportButtons = () => {
  const navigate = useNavigate()

  const handleExportPDF = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/export-pdf', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `finmate-report-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export PDF error:', error)
    }
  }

  return (
    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-center gap-3 slide-up" style={{ animationDelay: '0.2s' }}>
      <button
        onClick={handleExportPDF}
        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:scale-105 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl transition-all shadow-lg font-bold btn-theme text-sm sm:text-base"
      >
        📄 Export Monthly Report (PDF)
      </button>
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
