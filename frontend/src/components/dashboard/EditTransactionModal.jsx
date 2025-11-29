/**
 * Edit Transaction Modal Component
 * HTML-dən köçürülmüş - Əməliyyat düzəliş modalı
 */

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'

const EditTransactionModal = ({ isOpen, onClose, expense, onSave, currency = '₼' }) => {
  const [formData, setFormData] = useState({
    merchant: '',
    amount: '',
    category: 'Digər'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (expense) {
      setFormData({
        merchant: expense.merchant || '',
        amount: expense.amount || '',
        category: expense.category || 'Digər'
      })
    }
  }, [expense])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('merchant', formData.merchant)
      formDataToSend.append('amount', formData.amount)
      formDataToSend.append('category', formData.category)

      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: formDataToSend
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
      if (data.success) {
        toast.success('✅ Əməliyyat uğurla yeniləndi', { autoClose: 5000 })
        // Dispatch event for dashboard refresh
        window.dispatchEvent(new CustomEvent('expenseUpdated'))
        onSave && onSave(data)
        onClose()
      } else {
        toast.error(data.error || 'Xəta baş verdi', { autoClose: 5000 })
      }
    } catch (error) {
      console.error('Edit expense error:', error)
      toast.error('Əlaqə xətası', { autoClose: 5000 })
    } finally {
      setSubmitting(false)
    }
  }

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
          <h3 className="text-xl font-bold text-white">Düzəliş et</h3>
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1">Kateqoriya</label>
              <select
                value={formData.category || 'Digər'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="text-black">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Yadda saxlanılır...' : 'Yadda saxla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTransactionModal

