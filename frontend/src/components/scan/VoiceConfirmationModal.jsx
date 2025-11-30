/**
 * Voice Confirmation Modal Component
 */

import React, { useState, useEffect } from 'react'
import { X, Mic } from 'lucide-react'
import { toast } from 'sonner'

const VoiceConfirmationModal = ({ isOpen, onClose, transcribedText, expenseData, onConfirm }) => {
  const [formData, setFormData] = useState({
    amount: expenseData?.amount || '',
    merchant: expenseData?.merchant || '',
    category: expenseData?.category || ''
  })

  useEffect(() => {
    if (expenseData) {
      setFormData({
        amount: expenseData.amount || '',
        merchant: expenseData.merchant || '',
        category: expenseData.category || ''
      })
    }
  }, [expenseData])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('amount', formData.amount)
      formDataToSend.append('merchant', formData.merchant)
      formDataToSend.append('category', formData.category)

      const response = await fetch('/api/confirm-voice', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formDataToSend
      })

      if (!response.ok) {
        throw new Error('Xəta baş verdi')
      }

      const data = await response.json()
      if (data.success) {
        toast.success('✅ Səsli əmr uğurla təsdiqləndi!', { autoClose: 5000 })
        onConfirm && onConfirm(data)
        onClose()
        // Refresh dashboard
        window.dispatchEvent(new CustomEvent('expenseUpdated'))
      } else {
        toast.error(data.error || 'Xəta baş verdi', { autoClose: 5000 })
      }
    } catch (error) {
      console.error('Confirm voice error:', error)
      toast.error('Əlaqə xətası', { autoClose: 5000 })
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        background: 'var(--glass-shadow)'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-sm max-h-[85vh] overflow-y-auto relative slide-up flex flex-col"
        style={{
          background: 'var(--glass-bg)',
          borderColor: 'var(--glass-border)',
          boxShadow: '0 25px 50px -12px var(--glass-shadow)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 pb-0 text-center">
          <div
            className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-500/30"
            style={{
              background: 'rgba(138, 92, 246, 0.2)',
              borderColor: 'rgba(138, 92, 246, 0.3)'
            }}
          >
            <Mic className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Səsi yoxlayın</h3>
          <p className="text-white/60 text-xs">Düz başa düşdümsə, davam edin</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            {/* Transcribed Text Display */}
            <div
              className="bg-white/5 rounded-xl p-4 border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'var(--glass-border)'
              }}
            >
              <p className="text-xs text-white/50 mb-2">Siz dediniz:</p>
              <p className="text-white italic text-sm">"{transcribedText}"</p>
            </div>

            {/* Editable Amount */}
            <div
              className="text-center bg-white/5 rounded-xl p-4 border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'var(--glass-border)'
              }}
            >
              <p className="text-white/60 text-sm mb-2">Məbləğ</p>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="text-4xl font-bold text-white bg-transparent border-b-2 border-blue-500/50 focus:border-blue-500 outline-none text-center w-40"
                  style={{
                    borderColor: 'rgba(138, 92, 246, 0.5)'
                  }}
                  required
                />
                <span className="text-xl text-white/60">AZN</span>
              </div>
              <p className="text-xs text-white/40 mt-2">Yanlışdırsa düzəldin</p>
            </div>

            {/* Editable Merchant/Item Name */}
            <div
              className="bg-white/5 rounded-xl p-4 border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'var(--glass-border)'
              }}
            >
              <label className="block text-xs text-white/50 mb-2">Məhsul / Xidmət</label>
              <input
                type="text"
                name="merchant"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                className="w-full text-white bg-transparent border-b border-white/20 focus:border-blue-500 outline-none py-2"
                style={{
                  borderColor: 'var(--glass-border)'
                }}
                required
              />
            </div>

            {/* Category Display */}
            <div
              className="bg-white/5 rounded-xl p-3 border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'var(--glass-border)'
              }}
            >
              <p className="text-xs text-white/50 mb-1">Kateqoriya</p>
              <span
                className="inline-block px-2 py-0.5 bg-blue-500/30 text-blue-200 rounded text-xs font-medium"
                style={{
                  background: 'rgba(138, 92, 246, 0.3)',
                  color: 'rgba(196, 181, 253, 1)'
                }}
              >
                {formData.category}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 pt-0 mt-auto space-y-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-95 transition shadow-lg shadow-blue-500/25"
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                boxShadow: '0 4px 15px var(--glass-shadow)'
              }}
            >
              ✅ Düzdür, saxla
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-medium transition"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'var(--glass-border)'
              }}
            >
              ← Yenidən cəhd et
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VoiceConfirmationModal

