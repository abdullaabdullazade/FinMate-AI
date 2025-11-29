/**
 * Fraud Alert Modal Component
 * HTML-dən köçürülmüş - Fraud xəbərdarlığı modalı
 */

import React, { useState, useEffect } from 'react'
import { X, Check, XCircle } from 'lucide-react'
import { toast } from 'sonner'

const FraudAlertModal = ({ isOpen, onClose, onConfirm, onBlock }) => {
  const [showBlocked, setShowBlocked] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setShowBlocked(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = (isLegit) => {
    if (isLegit) {
      toast.success('✅ Təşəkkürlər! Əməliyyat təsdiqləndi.', { autoClose: 5000 })
      onConfirm && onConfirm()
      onClose()
    } else {
      setShowBlocked(true)
      onBlock && onBlock()
      // Play success sound and confetti
      if (typeof window.confetti !== 'undefined') {
        window.confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7']
        })
      }
    }
  }

  const handleCloseBlocked = () => {
    setShowBlocked(false)
    onClose()
  }

  // Fraud Blocked Modal
  if (showBlocked) {
    return (
      <div
        className="fixed inset-0 z-[101] flex items-center justify-center backdrop-blur-md transition-all duration-300"
        style={{
          display: 'flex',
          opacity: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          background: 'var(--glass-shadow)'
        }}
      >
        <div className="relative w-full max-w-md mx-4 transform transition-transform duration-300 scale-100">
          {/* Success Glow */}
          <div className="absolute inset-0 bg-green-500/20 rounded-3xl blur-3xl animate-pulse"></div>

          {/* Success Card */}
          <div
            className="relative glass-card border-2 border-green-500 p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl shadow-green-500/50 max-h-[90vh] overflow-y-auto"
            style={{
              background: 'var(--glass-bg)',
              borderColor: 'rgba(34, 197, 94, 0.5)',
              boxShadow: '0 25px 50px -12px var(--glass-shadow)'
            }}
          >
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-6xl shadow-lg shadow-green-500/50 animate-bounce">
                🛡️
              </div>
            </div>

            {/* Success Title */}
            <h2 className="text-3xl font-black text-center text-green-400 mb-4">
              PULUNUZ QORUNDU!
            </h2>

            {/* Success Message */}
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 mb-6">
              <p className="text-white text-center text-lg font-bold mb-4">
                ✅ Kartınız dərhal bloklandı
              </p>
              <p className="text-white/80 text-center text-sm mb-2">
                Dələduz əməliyyat dayandırıldı
              </p>
              <p className="text-green-200 text-center text-2xl font-black">
                500.00 USD qorundu
              </p>
            </div>

            {/* Info Message */}
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <p className="text-white/70 text-center text-sm">
                💳 Yeni kart 24 saat ərzində göndəriləcək<br />
                📞 Sizinlə əlaqə saxlanılacaq
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={handleCloseBlocked}
              className="w-full px-6 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-xl shadow-green-500/50 transition-all hover:scale-105"
            >
              Bağla
            </button>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/50 text-center text-xs">
                🤖 FinMate AI ilə təhlükəsiz olun
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fraud Alert Modal
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md transition-all duration-300"
      style={{
        display: isOpen ? 'flex' : 'none',
        opacity: isOpen ? 1 : 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        background: 'var(--glass-shadow)'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md mx-4 transform transition-transform duration-300"
        style={{ transform: isOpen ? 'scale(1)' : 'scale(0.9)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pulsing Red Background */}
        <div className="absolute inset-0 bg-red-500/20 rounded-3xl blur-3xl animate-pulse"></div>

        {/* Main Alert Card */}
        <div
          className="relative glass-card border-2 border-red-500 p-4 sm:p-6 md:p-8 rounded-3xl shadow-2xl shadow-red-500/50 max-h-[90vh] overflow-y-auto"
          style={{
            background: 'var(--glass-bg)',
            borderColor: 'rgba(239, 68, 68, 0.5)',
            boxShadow: '0 25px 50px -12px var(--glass-shadow)'
          }}
        >
          {/* Alert Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-6xl animate-bounce shadow-lg shadow-red-500/50">
              🚨
            </div>
          </div>

          {/* Alert Title */}
          <h2 className="text-3xl font-black text-center text-red-400 mb-4 animate-pulse">
            ŞÜBHƏLI ƏMƏLIYYAT!
          </h2>

          {/* Alert Message */}
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6 mb-6">
            <p className="text-white text-center text-lg font-bold mb-2">🌍 Dubay, BƏƏ</p>
            <p className="text-red-200 text-center text-2xl font-black mb-3">500.00 USD</p>
            <p className="text-white/80 text-center text-sm">İndi cəmi 2 dəqiqə əvvəl</p>
          </div>

          {/* Question */}
          <p className="text-white text-center text-xl font-bold mb-8">
            Bu ƏMƏLİYYATI SİZ EDİRSİNİZ?
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleConfirm(true)}
              className="group relative overflow-hidden px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 hover:border-white/50"
            >
              <span className="relative z-10">✓ Bəli, Mənəm</span>
            </button>
            <button
              onClick={() => handleConfirm(false)}
              className="group relative overflow-hidden px-6 py-4 rounded-xl font-bold text-lg transition-all hover:scale-110 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-xl shadow-red-500/50 border-2 border-red-400"
            >
              <span className="relative z-10 animate-pulse">✗ XEYR!</span>
            </button>
          </div>

          {/* Footer Warning */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/50 text-center text-xs flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
              FinMate AI Fraud Detection System
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FraudAlertModal

