/**
 * Premium Modal Component
 * 14 günlük pulsuz sınaq müddəti ilə Premium modal
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '../../utils/toast'
import { useAuth } from '../../contexts/AuthContext'
import { Sparkles, Crown, Zap, Volume2, Infinity, FileText, Headphones, X } from 'lucide-react'
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
          pauseOnHover: false,
          pauseOnFocusLoss: false,
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
          pauseOnHover: false,
          pauseOnFocusLoss: false,
        })
      }
    } catch (error) {
      console.error('Trial activation error:', error)
      toast.error('Əlaqə xətası. Zəhmət olmasa yenidən cəhd edin.', {
        position: 'top-center',
        autoClose: 5000,
        pauseOnHover: false,
        pauseOnFocusLoss: false,
      })
    } finally {
      setActivating(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="premium-modal-overlay"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="premium-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="premium-modal-close"
              onClick={onClose}
              aria-label="Bağla"
            >
              <X className="w-5 h-5" />
            </motion.button>

            <div className="premium-modal-header">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block mb-2"
              >
                <Crown className="w-8 h-8 text-yellow-400 mx-auto" />
              </motion.div>
              <h2 className="premium-modal-title">✨ FinMate Premium</h2>
              <p className="premium-modal-subtitle">Pulunu maksimum səviyyədə idarə et</p>
            </div>

        <div className="premium-plans-grid">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="premium-plan-card free-plan"
          >
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
                <Zap className="feature-icon w-5 h-5" />
                AI Chat (10 mesaj/gün)
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
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-plan-card premium-plan"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="plan-badge"
            >
              ⭐ POPULYAR
            </motion.div>
            <div className="plan-header">
              <h3 className="plan-title flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                Pro
              </h3>
              <div className="plan-price-group">
                <span className="plan-price-gradient">4.99</span>
                <span className="plan-price-period">₼/ay</span>
              </div>
            </div>
            <p className="plan-description">Tam funksional paket</p>
            <ul className="plan-features">
              <li className="plan-feature">
                <Infinity className="feature-icon premium-icon w-5 h-5" />
                <span className="feature-text">Limitsiz AI Chat Mesajları</span>
              </li>
              <li className="plan-feature">
                <Volume2 className="feature-icon premium-icon w-5 h-5" />
                <span className="feature-text">Səsli Funksiyalar (TTS)</span>
              </li>
              <li className="plan-feature">
                <Sparkles className="feature-icon premium-icon w-5 h-5" />
                <span className="feature-text">Limitsiz Resept Scan</span>
              </li>
              <li className="plan-feature">
                <Zap className="feature-icon premium-icon w-5 h-5" />
                <span className="feature-text">AI Maliyyə Məsləhətçisi</span>
              </li>
              <li className="plan-feature">
                <FileText className="feature-icon premium-icon w-5 h-5" />
                <span className="feature-text">Excel/PDF Export</span>
              </li>
              <li className="plan-feature">
                <Headphones className="feature-icon premium-icon w-5 h-5" />
                <span className="feature-text">Prioritet Dəstək</span>
              </li>
              <li className="plan-feature">
                <Crown className="feature-icon premium-icon w-5 h-5" />
                <span className="feature-text">Reklamsız İstifadə</span>
              </li>
            </ul>
            <motion.button
              onClick={handleActivateTrial}
              disabled={activating || user?.is_premium}
              whileHover={{ scale: user?.is_premium ? 1 : 1.05 }}
              whileTap={{ scale: user?.is_premium ? 1 : 0.95 }}
              className="premium-activate-button"
            >
              {activating ? (
                <>
                  <span className="button-spinner"></span>
                  <span>Aktivləşdirilir...</span>
                </>
              ) : user?.is_premium ? (
                <>
                  <Crown className="w-5 h-5" />
                  <span>✅ Premium Aktivdir</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>14 Gün Pulsuz Başla</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    🚀
                  </motion.span>
                </>
              )}
            </motion.button>
          </motion.div>
        </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="premium-modal-footer"
            >
              💳 Təhlükəsiz ödəniş - 14 gün pulsuz sınaq
            </motion.div>
          </motion.div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default PremiumModal

