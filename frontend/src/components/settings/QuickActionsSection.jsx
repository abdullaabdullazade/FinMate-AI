/**
 * Quick Actions Section Component
 * Xəritə, export və digər sürətli əməliyyatlar
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import '../../styles/components/settings/quick-actions-section.css'
import { exportAPI } from '../../services/api'

const QuickActionsSection = ({ isPremium, loginStreak, levelTitle }) => {
  const navigate = useNavigate()

  const handleExportPDF = async () => {
    if (!isPremium) {
      // Open premium modal
      if (typeof window.openPremiumModal === 'function') {
        window.openPremiumModal()
      } else {
        toast.error('Bu funksiya Premium üçündür')
      }
      return
    }

    try {
      const response = await exportAPI.exportToPDF()
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hesabat-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('PDF uğurla yükləndi')
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('PDF yüklənmədi')
    }
  }

  const handleExportXLSX = async () => {
    if (!isPremium) {
      // Open premium modal
      if (typeof window.openPremiumModal === 'function') {
        window.openPremiumModal()
      } else {
        toast.error('Bu funksiya Premium üçündür')
      }
      return
    }

    try {
      const response = await exportAPI.exportToExcel()
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hesabat-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Excel faylı uğurla yükləndi')
    } catch (error) {
      console.error('Excel export error:', error)
      toast.error('Excel faylı yüklənmədi')
    }
  }

  const handleResetDemoData = async () => {
    if (!confirm('Demo məlumatlarını sıfırlamaq istəyirsən? Bütün cari məlumatlar silinəcək.')) {
      return
    }

    try {
      const response = await fetch('/api/reset-demo', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        toast.success('Demo məlumatları yeniləndi, səhifəni yenilə!')
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        toast.error(data.error || 'Sıfırlama alınmadı')
      }
    } catch (error) {
      console.error('Reset demo error:', error)
      toast.error('Şəbəkə xətası')
    }
  }

  return (
    <>
      {/* Heatmap Card */}
      <div className="settings-section quick-actions-section slide-up" style={{ animationDelay: '0.35s' }}>
        <div className="section-header">
          <div className="section-icon quick-actions-icon">
            🗺️
          </div>
          <div className="section-title-group">
            <h2 className="section-title">Xəritə</h2>
            <p className="section-subtitle">Xərclərinizin coğrafi paylanmasını görün</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/heatmap')}
          className="quick-action-button heatmap-button"
        >
          <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
          </svg>
          <span className="action-text">Xəritəni Aç</span>
          <svg className="action-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      {/* Export Buttons */}
      <div className="export-buttons-grid slide-up" style={{ animationDelay: '0.4s' }}>
        <button
          type="button"
          onClick={handleExportPDF}
          className="quick-action-button export-button"
        >
          <span className="action-emoji">📄</span>
          <span className="action-text">Aylıq Hesabat (PDF)</span>
          {!isPremium && (
            <span className="premium-badge">👑 Pro</span>
          )}
        </button>

        <button
          type="button"
          onClick={handleExportXLSX}
          className="quick-action-button export-button"
        >
          <span className="action-emoji">📊</span>
          <span className="action-text">Excel Export (XLSX)</span>
          {!isPremium && (
            <span className="premium-badge">👑 Pro</span>
          )}
        </button>
      </div>

      {/* Reset Demo Data */}
      <div className="reset-demo-container slide-up" style={{ animationDelay: '0.45s' }}>
        <button
          type="button"
          onClick={handleResetDemoData}
          className="quick-action-button reset-button"
        >
          <span className="action-emoji">🧹</span>
          <span className="action-text">Demo məlumatlarını sıfırla</span>
        </button>
      </div>
    </>
  )
}

export default QuickActionsSection

