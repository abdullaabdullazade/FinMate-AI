/**
 * Signup Page Component
 * signup.html-dən köçürülmüşdür
 * Deep Purple Glassmorphism dizaynı
 */

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { User, Lock, UserPlus, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const Signup = () => {
  const { signup, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirm_password) {
      setError('Şifrələr uyğun gəlmir')
      toast.error('Şifrələr uyğun gəlmir')
      return
    }

    // Validate password length
    if (formData.password.length < 4) {
      setError('Şifrə ən azı 4 simvol olmalıdır')
      toast.error('Şifrə ən azı 4 simvol olmalıdır')
      return
    }

    // Validate username length
    if (formData.username.length < 3) {
      setError('İstifadəçi adı ən azı 3 simvol olmalıdır')
      toast.error('İstifadəçi adı ən azı 3 simvol olmalıdır')
      return
    }

    setLoading(true)

    try {
      const result = await signup(formData.username, formData.password, formData.email)
      if (result.success) {
        toast.success('Uğurla qeydiyyat keçdiniz!')
        navigate('/login?registered=true', { replace: true })
      } else {
        setError(result.error || 'Qeydiyyat uğursuz oldu')
        toast.error(result.error || 'Qeydiyyat uğursuz oldu')
      }
    } catch (err) {
      setError('Xəta baş verdi')
      toast.error('Xəta baş verdi')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md animate-float"
      >
        {/* Main Glass Card */}
        <div className="glass-card p-8 sm:p-10 rounded-3xl">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-6 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
              <img
                src="/static/icons/icon-192.png"
                alt="FinMate AI"
                className="w-24 h-24 rounded-2xl mx-auto relative logo-glow"
              />
            </motion.div>
            <h1 className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Yeni Hesab Yarat
            </h1>
            <p className="text-white/70 text-sm font-medium">FinMate AI ilə başla</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 backdrop-blur-md border border-red-500/50 rounded-xl text-red-200 text-sm animate-float"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-white/90 text-sm font-semibold">
                İstifadəçi adı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-white/40" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  minLength={3}
                  value={formData.username}
                  onChange={handleChange}
                  className="glass-input w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-white/40 focus:outline-none"
                  placeholder="istifadəçi_adı"
                  autoComplete="username"
                />
              </div>
              <p className="password-hint">Ən azı 3 simvol</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-white/90 text-sm font-semibold">
                Şifrə
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-white/40" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  minLength={4}
                  value={formData.password}
                  onChange={handleChange}
                  className="glass-input w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-white/40 focus:outline-none"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <p className="password-hint">Ən azı 4 simvol</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm_password" className="block text-white/90 text-sm font-semibold">
                Şifrəni təsdiq et
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <CheckCircle className="w-5 h-5 text-white/40" />
                </div>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  required
                  minLength={4}
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="glass-input w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-white/40 focus:outline-none"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glass-button w-full py-4 text-white font-bold rounded-xl transition-all duration-300 text-base mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="w-5 h-5" />
                <span>{loading ? 'Qeydiyyat edilir...' : 'Hesab yarat'}</span>
              </span>
            </button>
          </form>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 info-glass green p-4 rounded-xl animate-float"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-300" />
              </div>
              <div>
                <p className="text-green-200 text-xs font-semibold mb-1">Pulsuz qeydiyyat</p>
                <p className="text-green-300/80 text-xs">Bütün funksiyalar sənindir. Heç bir kredit kartı tələb olunmur.</p>
              </div>
            </div>
          </motion.div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Artıq hesabın var?{' '}
              <Link to="/login" className="glass-link text-purple-300 hover:text-purple-200 font-semibold transition inline-block">
                Giriş et
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Signup
