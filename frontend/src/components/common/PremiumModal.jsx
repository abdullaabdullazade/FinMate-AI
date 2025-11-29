/**
 * Premium Modal Component
 * 14 günlük pulsuz sınaq müddəti ilə Premium modal
 */

import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/components/common/premium-modal.css'

const PremiumModal = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth()
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleActivateTrial = async () => {
    setActivating(true)
    try {
      const response = await fetch('/api/activate-trial', {
        method: 'POST',
        credentials: 'include',
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh user data
        await refreshUser()
        
        toast.success(`✨ ${data.message}`, {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          className: 'premium-success-toast',
        })
        
        // Close modal
        onClose()
        
        // Trigger premium activated event
        window.dispatchEvent(new CustomEvent('premiumActivated'))
        
        // Reload page after delay to show premium status
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        toast.error(data.error || 'Xəta baş verdi', {
          position: 'top-center',
          autoClose: 5000,
        })
      }
    } catch (error) {
      console.error('Trial activation error:', error)
      toast.error('Əlaqə xətası. Zəhmət olmasa yenidən cəhd edin.', {
        position: 'top-center',
        autoClose: 5000,
      })
    } finally {
      setActivating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="premium-modal-overlay"
      onClick={onClose}
    >
      <div 
        className="premium-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="premium-modal-close"
          onClick={onClose}
          aria-label="Bağla"
        >
          ✕
        </button>

        <div className="premium-modal-header">
          <h2 className="premium-modal-title">✨ FinMate Premium</h2>
          <p className="premium-modal-subtitle">Pulunu maksimum səviyyədə idarə et</p>
        </div>

        <div className="premium-plans-grid">
          {/* Free Plan */}
          <div className="premium-plan-card free-plan">
            <div className="plan-header">
              <h3 className="plan-title">Free</h3>
              <span className="plan-price">0 ₼</span>
            </div>
            <p className="plan-description">Əsas funksiyalar</p>
            <ul className="plan-features">
              <li className="plan-feature">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Dashboard və Büdcə İzləmə
              </li>
              <li className="plan-feature">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Resept Scan (10/ay)
              </li>
              <li className="plan-feature">
                <svg className="feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Əməliyyat Tarixçəsi
              </li>
            </ul>
          </div>

          {/* Premium Plan */}
          <div className="premium-plan-card premium-plan">
            <div className="plan-badge">POPULYAR</div>
            <div className="plan-header">
              <h3 className="plan-title">Pro</h3>
              <div className="plan-price-group">
                <span className="plan-price-gradient">4.99</span>
                <span className="plan-price-period">₼/ay</span>
              </div>
            </div>
            <p className="plan-description">Tam funksional paket</p>
            <ul className="plan-features">
              <li className="plan-feature">
                <svg className="feature-icon premium-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="feature-text">Limitsiz Resept Scan</span>
              </li>
              <li className="plan-feature">
                <svg className="feature-icon premium-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="feature-text">AI Maliyyə Məsləhətçisi</span>
              </li>
              <li className="plan-feature">
                <svg className="feature-icon premium-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="feature-text">Excel/PDF Export</span>
              </li>
              <li className="plan-feature">
                <svg className="feature-icon premium-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="feature-text">Prioritet Dəstək</span>
              </li>
              <li className="plan-feature">
                <svg className="feature-icon premium-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="feature-text">Reklamsız İstifadə</span>
              </li>
            </ul>
            <button
              onClick={handleActivateTrial}
              disabled={activating || user?.is_premium}
              className="premium-activate-button"
            >
              {activating ? (
                <>
                  <span className="button-spinner"></span>
                  <span>Aktivləşdirilir...</span>
                </>
              ) : user?.is_premium ? (
                <>
                  <span>✅ Premium Aktivdir</span>
                </>
              ) : (
                <>
                  <span>14 Gün Pulsuz Başla</span>
                  <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="premium-modal-footer">
          💳 Təhlükəsiz ödəniş - 14 gün pulsuz sınaq
        </div>
      </div>
    </div>
  )
}

export default PremiumModal

