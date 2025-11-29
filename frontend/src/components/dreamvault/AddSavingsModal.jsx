/**
 * Add Savings Modal Component
 * HTML/CSS-dən bir-bir köçürülmüş versiya
 */

import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { dreamVaultAPI } from '../../services/api'

const AddSavingsModal = ({ dream, isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [moneyIconAnimated, setMoneyIconAnimated] = useState(false)

  const animateMoneyIcon = () => {
    setMoneyIconAnimated(true)
    setTimeout(() => {
      setMoneyIconAnimated(false)
    }, 500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Düzgün məbləğ daxil edin')
      return
    }

    animateMoneyIcon()
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('amount', amount)

      const response = await fetch(`/api/dreams/${dream.id}/add-savings`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || 'Xəta baş verdi')
        } catch (e) {
          throw new Error('Xəta baş verdi')
        }
      }

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(`✅ ${data.message || 'Qənaət uğurla əlavə edildi!'}`)
        onSuccess(parseFloat(amount))
        setAmount('')
        onClose()
      } else {
        toast.error(data.error || 'Xəta baş verdi')
      }
    } catch (error) {
      console.error('Add savings error:', error)
      toast.error('Əlaqə xətası')
    } finally {
      setSubmitting(false)
    }
  }

  if (!dream || !isOpen) return null

  return (
    <div 
      className={`fixed inset-0 z-50 backdrop-blur-sm transition-opacity duration-300 overflow-y-auto ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}
      style={{ backgroundColor: 'var(--glass-shadow)' }}
      onClick={onClose}
    >
      <div className="flex items-start sm:items-center justify-center min-h-screen px-3 sm:px-4 py-4 sm:py-8">
        <div 
          className="glass-card p-4 sm:p-6 w-full max-w-sm transform transition-transform duration-300 my-auto"
          style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-white">Qənaət Əlavə Et</h3>
            <button onClick={onClose} className="text-white/50 hover:text-white flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm text-white/70 mb-1.5 sm:mb-2">Məbləğ (AZN)</label>
                <input 
                  type="number" 
                  name="amount" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01" 
                  min="0.01" 
                  required 
                  placeholder="100"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-green-500 transition"
                />
              </div>
              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm sm:text-base font-bold py-2.5 sm:py-3 rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className={`money-icon text-lg sm:text-xl leading-none inline-flex items-center ${moneyIconAnimated ? 'animate' : ''}`}>💰</span>
                <span>{submitting ? 'Əlavə edilir...' : 'Əlavə Et'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddSavingsModal
