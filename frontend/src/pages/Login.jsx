/**
 * Login Page Component
 * login.html-dən köçürülmüşdür
 * Deep Purple Glassmorphism dizaynı
 */

import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { User, Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

const Login = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registered, setRegistered] = useState(false)

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Check for registration success message
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('registered') === 'true') {
      setRegistered(true)
      toast.success('Uğurla qeydiyyat keçdiniz! İndi giriş edə bilərsiniz.')
    }
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(formData.username, formData.password)
      if (result.success) {
        toast.success('Uğurla giriş etdiniz!')
        navigate('/dashboard', { replace: true })
      } else {
        setError(result.error || 'Giriş uğursuz oldu')
        toast.error(result.error || 'Giriş uğursuz oldu')
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
              FinMate AI
            </h1>
            <p className="text-white/70 text-sm font-medium">Şəxsi Maliyyə Köməkçiniz</p>
          </div>

          {/* Success Message (Registration) */}
          {registered && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-500/20 backdrop-blur-md border border-green-500/50 rounded-xl text-green-200 text-sm animate-float"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>Uğurla qeydiyyat keçdiniz! İndi giriş edə bilərsiniz.</span>
              </div>
            </motion.div>
          )}

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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={formData.username}
                  onChange={handleChange}
                  className="glass-input w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-white/40 focus:outline-none"
                  placeholder="demo"
                  autoComplete="username"
                />
              </div>
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
                  value={formData.password}
                  onChange={handleChange}
                  className="glass-input w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-white/40 focus:outline-none"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glass-button w-full py-4 text-white font-bold rounded-xl transition-all duration-300 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                <span>{loading ? 'Giriş edilir...' : 'Giriş et'}</span>
                {!loading && <ArrowRight className="w-5 h-5" />}
              </span>
            </button>
          </form>

          {/* Demo User Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 info-glass p-4 rounded-xl animate-float"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <p className="text-blue-200 text-xs font-semibold mb-0.5">Demo hesab</p>
                <p className="text-blue-300/80 text-xs">
                  <code className="bg-white/10 px-2 py-0.5 rounded">demo</code> /{' '}
                  <code className="bg-white/10 px-2 py-0.5 rounded">demo</code>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Hesabın yoxdur?{' '}
              <Link to="/signup" className="glass-link text-purple-300 hover:text-purple-200 font-semibold transition inline-block">
                Qeydiyyatdan keç
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
