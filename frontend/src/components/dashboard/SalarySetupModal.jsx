/**
 * Salary Setup Modal Component
 * İlk dəfə giriş edən istifadəçilər üçün maaş təyin etmək modalı
 */

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'

const SalarySetupModal = ({ isOpen, onClose, onSalarySet }) => {
  const { user, refreshUser } = useAuth()
  const [salary, setSalary] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!salary || parseFloat(salary) <= 0) {
      toast.error('Zəhmət olmasa düzgün maaş məbləği daxil edin', {
        position: 'top-right',
        autoClose: 5000,
      })
      return
    }

    setSubmitting(true)
    try {
      // Backend FormData gözləyir
      const formData = new FormData()
      formData.append('monthly_income', String(parseFloat(salary)))

      const response = await fetch('/api/settings', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server xətası' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('Salary setup response:', data)

      if (data.success) {
        // Maaş təyin edildikdən sonra localStorage-da qeyd et
        const salarySetupKey = `salary_setup_completed_${user?.username || 'user'}`
        localStorage.setItem(salarySetupKey, 'true')
        
        // User data-nı yenilə
        await refreshUser()
        
        // Yenilənmiş user data-nı yoxla
        const updatedUser = await new Promise((resolve) => {
          setTimeout(async () => {
            try {
              const { api } = await import('../../services/api')
              const statsResponse = await api.get('/api/stats')
              resolve(statsResponse.data?.user)
            } catch (e) {
              console.error('Failed to verify user update:', e)
              resolve(null)
            }
          }, 500)
        })
        
        if (updatedUser?.monthly_income) {
          console.log('✅ Monthly income verified:', updatedUser.monthly_income)
        } else {
          console.warn('⚠️ Monthly income not found in updated user data')
        }
        
        // Dashboard-u yenilə (büdcə də dəyişəcək)
        if (onSalarySet) {
          onSalarySet()
        }
        
        toast.success('✅ Maaşınız uğurla təyin edildi! Büdcə avtomatik yeniləndi.', {
          position: 'top-right',
          autoClose: 5000,
        })
        onClose()
      } else {
        toast.error(data.error || 'Xəta baş verdi', {
          position: 'top-right',
          autoClose: 5000,
        })
      }
    } catch (error) {
      console.error('Salary setup error:', error)
      toast.error('Əlaqə xətası. Zəhmət olmasa yenidən cəhd edin.', {
        position: 'top-right',
        autoClose: 5000,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-md transition-all duration-300"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md mx-4 transform transition-transform duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ec4899]/20 via-[#d81b60]/20 to-purple-500/20 rounded-3xl blur-3xl animate-pulse"></div>

        {/* Main Card */}
        <div
          className="relative glass-card border-2 border-white/20 p-6 sm:p-8 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
          style={{
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Bağla"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ec4899] to-[#d81b60] flex items-center justify-center text-4xl shadow-lg shadow-pink-500/30">
              💰
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
            Xoş gəldiniz! 👋
          </h2>
          <p className="text-white/70 text-center text-sm sm:text-base mb-2">
            Maliyyə hədəflərinə çatmaq üçün ilk addımı atın
          </p>
          <p className="text-white/60 text-center text-xs mb-6">
            İlk dəfə giriş edirsiniz - maaşınızı təyin edin
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3 text-center">
                Aylıq maaşınız nə qədərdir?
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  required
                  min="1"
                  step="0.01"
                  placeholder="Məs: 1000"
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-4 text-center text-2xl font-bold text-white focus:outline-none focus:border-[#ec4899]/50 transition-colors placeholder-white/20"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 font-bold">
                  AZN
                </span>
              </div>
              <p className="text-white/50 text-xs text-center mt-2">
                Bu məlumat yalnız büdcə hesablamaları üçün istifadə olunur
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#ec4899] to-[#d81b60] text-white shadow-xl shadow-pink-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saxlanılır...' : 'Təyin Et'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/50 text-center text-xs">
              💡 Maaşınızı hər zaman Ayarlar səhifəsindən dəyişə bilərsiniz
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalarySetupModal

