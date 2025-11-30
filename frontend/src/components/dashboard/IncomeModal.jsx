/**
 * Income Modal Component
 * HTML-dən köçürülmüş - Gəlir əlavə etmə modalı
 */

import React, { useState } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const IncomeModal = ({ isOpen, onClose, currency = 'AZN', onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    source: 'Maaş',
    date: new Date().toISOString().split('T')[0],
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('amount', formData.amount)
      formDataToSend.append('source', formData.source)
      formDataToSend.append('date', formData.date)
      if (formData.description) {
        formDataToSend.append('description', formData.description)
      }

      const response = await fetch('/api/add-income', {
        method: 'POST',
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
          throw new Error(errorData.error || 'Məlumat yadda saxlanılmadı')
        } catch (e) {
          throw new Error('Məlumat yadda saxlanılmadı')
        }
      }

      const data = await response.json()
      if (data.success) {
        setSuccess(true)
        toast.success('✅ Gəlir uğurla əlavə edildi!', { autoClose: 5000 })
        // Dispatch event for dashboard refresh
        window.dispatchEvent(new CustomEvent('incomeUpdated'))
        onSuccess && onSuccess(data)
        setTimeout(() => {
          onClose()
          // Don't reload page, let dashboard refresh via event
        }, 1500)
      } else {
        setError(data.error || 'Məlumat yadda saxlanılmadı')
      }
    } catch (error) {
      console.error('Add income error:', error)
      setError(error.message || 'Şəbəkə xətası. Yenidən cəhd edin.')
    } finally {
      setSubmitting(false)
    }
  }

  const sources = [
    { value: 'Maaş', label: '💼 Maaş' },
    { value: 'Bonus', label: '🎁 Bonus' },
    { value: 'Freelance', label: '💻 Freelance' },
    { value: 'Hədiyyə', label: '🎉 Hədiyyə' },
    { value: 'Digər', label: '➕ Digər' }
  ]

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm transition-all duration-300"
      style={{
        display: isOpen ? 'flex' : 'none',
        opacity: isOpen ? 1 : 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        background: 'var(--glass-shadow)'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-lg p-4 mx-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative backdrop-blur-xl rounded-2xl shadow-2xl border p-4 sm:p-6 md:p-8 transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
          style={{
            background: 'var(--glass-bg)',
            borderColor: 'var(--glass-border)',
            boxShadow: '0 25px 50px -12px var(--glass-shadow)',
            transform: isOpen ? 'scale(1)' : 'scale(0.95)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                }}
              >
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Gəlir Əlavə Et
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Əlavə gəlirinizi qeyd edin
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-lg transition hover:bg-white/10"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 rounded-xl border border-red-500/50 bg-red-500/10">
              <div className="flex items-center gap-2 text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 rounded-xl border border-green-500/50 bg-green-500/10">
              <div className="flex items-center gap-2 text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <span className="text-sm font-medium">Gəlir uğurla əlavə edildi! ✓</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Amount */}
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span className="text-lg">💵</span>
                  Məbləğ ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="Məsələn: 500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full rounded-xl px-4 py-3.5 text-lg transition-all focus:outline-none focus:ring-2"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    '--tw-ring-color': 'var(--accent-primary)'
                  }}
                  autoComplete="off"
                />
              </div>

              {/* Source */}
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span className="text-lg">📊</span>
                  Mənbə
                </label>
                <select
                  name="source"
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full rounded-xl px-4 py-3.5 transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    '--tw-ring-color': 'var(--accent-primary)'
                  }}
                >
                  {sources.map((source) => (
                    <option
                      key={source.value}
                      value={source.value}
                      style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span className="text-lg">📅</span>
                  Tarix
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-xl px-4 py-3.5 transition-all focus:outline-none focus:ring-2"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    '--tw-ring-color': 'var(--accent-primary)'
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span className="text-lg">📝</span>
                  Təsvir <span className="text-xs opacity-50">(istəyə bağlı)</span>
                </label>
                <input
                  type="text"
                  placeholder="Əlavə məlumat..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl px-4 py-3.5 transition-all focus:outline-none focus:ring-2"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    '--tw-ring-color': 'var(--accent-primary)'
                  }}
                  autoComplete="off"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="relative w-full font-bold py-4 rounded-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                style={{
                  color: '#ffffff',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span>{submitting ? 'Əlavə edilir...' : 'Əlavə Et'}</span>
                </span>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
              </button>
            </div>
          </form>

          {/* Footer Tip */}
          <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--glass-border)' }}>
            <p className="text-xs text-center opacity-50" style={{ color: 'var(--text-secondary)' }}>
              💡 Əlavə gəliriniz büdcənizə avtomatik olaraq əlavə olunacaq
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IncomeModal

