/**
 * Manual Expense Modal Component
 * Yazılı rejimdə xərc əlavə etmə modalı
 */

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const ManualExpenseModal = ({ isOpen, onClose, onSuccess, currency = 'AZN' }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    amount: '',
    merchant: '',
    category: 'Digər',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const categories = [
    'Market',
    'Restoran',
    'Kafe',
    'Nəqliyyat',
    'Əyləncə',
    'Kommunal',
    'Geyim',
    'Bank',
    'Digər'
  ]

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('amount', formData.amount)
      formDataToSend.append('merchant', formData.merchant)
      formDataToSend.append('category', formData.category)
      if (formData.notes) {
        formDataToSend.append('notes', formData.notes)
      }

      const response = await fetch('/api/expense', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formDataToSend
      })

      if (!response.ok) {
        let errorMessage = 'Xəta baş verdi'
        try {
          const errorText = await response.text()
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText)
              errorMessage = errorData.error || errorData.message || errorMessage
            } catch (e) {
              // If not JSON, use the text as error message
              if (errorText.length < 200) {
                errorMessage = errorText
              }
            }
          }
        } catch (e) {
          // Network error or other issues
          if (response.status === 500) {
            errorMessage = 'Server xətası. Zəhmət olmasa yenidən cəhd edin.'
          } else if (response.status === 401) {
            errorMessage = 'Giriş tələb olunur. Zəhmət olmasa yenidən giriş edin.'
          } else if (response.status === 400) {
            errorMessage = 'Yanlış məlumat. Zəhmət olmasa yoxlayın.'
          }
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      if (data.success) {
        // Show success message with XP if available
        let successMessage = '✅ Əlavə olundu'
        if (data.xp_result && data.xp_result.xp_awarded) {
          successMessage += ` (+${data.xp_result.xp_awarded} XP)`
        }
        toast.success(successMessage, { autoClose: 5000 })
        
        // Reset form
        setFormData({
          amount: '',
          merchant: '',
          category: 'Digər',
          notes: ''
        })
        
        // Dispatch event for dashboard refresh
        window.dispatchEvent(new CustomEvent('expenseUpdated'))
        window.dispatchEvent(new CustomEvent('scanCompleted'))
        
        // Close modal first
        onClose()
        
        // Call onSuccess callback if provided
        onSuccess && onSuccess(data)
        
        // Navigate to scan page and refresh
        setTimeout(() => {
          navigate('/scan', { replace: true })
          // Refresh the page to ensure all data is updated
          window.location.reload()
        }, 300) // Small delay to allow modal to close smoothly
      } else {
        toast.error(data.error || 'Xəta baş verdi', { autoClose: 5000 })
      }
    } catch (error) {
      console.error('Add manual expense error:', error)
      // More specific error messages
      let errorMessage = error.message || 'Əlaqə xətası'
      if (errorMessage.includes('Network') || errorMessage.includes('Failed to fetch')) {
        errorMessage = 'İnternet bağlantısı yoxdur. Zəhmət olmasa yoxlayın.'
      }
      toast.error(errorMessage, { autoClose: 5000 })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        display: isOpen ? 'flex' : 'none',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        background: 'var(--glass-shadow)'
      }}
    >
      <div
        className="glass-card p-4 sm:p-6 w-full max-w-md transform transition-transform duration-300 mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          background: 'var(--glass-bg)',
          borderColor: 'var(--glass-border)',
          boxShadow: '0 25px 50px -12px var(--glass-shadow)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Yazılı rejimdə xərc əlavə et</h3>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Obyekt / Mağaza</label>
              <input
                type="text"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="Məsələn: Bazar, Restoran..."
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Məbləğ ({currency})</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Kateqoriya</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="text-black">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Qeyd (opsional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition resize-none"
                placeholder="Əlavə məlumat..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Yadda saxlanılır...' : 'Əlavə et'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ManualExpenseModal

