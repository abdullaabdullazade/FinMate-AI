/**
 * Login Page Component
 * login.html-dən TAM KOPYALANMIŞ - bir-bir eyni
 */

import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/pages/auth.css'

const Login = () => {
  const { login, isAuthenticated, loading: authLoading } = useAuth()
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
    if (!authLoading && isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  // Check for registration success message
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('registered') === 'true' || params.get('registered') === '1') {
      setRegistered(true)
    }
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(formData.username, formData.password)
      if (result.success) {
        navigate('/', { replace: true })
      } else {
        setError(result.error || 'Giriş uğursuz oldu')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Xəta baş verdi'
      setError(errorMessage)
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
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10"
      style={{
        background: 'linear-gradient(135deg, #0a0e27 0%, #141b3d 50%, #1a1f4d 100%)',
        minHeight: '100vh',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowX: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className="w-full max-w-md animate-float mx-auto">
        {/* Main Glass Card - login.html sətir 22 */}
        <div className="glass-card p-8 sm:p-10 rounded-3xl">
          {/* Logo and Title - login.html sətir 24-33 */}
          <div className="text-center mb-8">
            <div className="inline-block mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl"></div>
              <img
                src="/static/icons/icon-192.png"
                alt="FinMate AI"
                className="w-24 h-24 rounded-2xl mx-auto relative logo-glow"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
            <h1 className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              FinMate AI
            </h1>
            <p className="text-white/70 text-sm font-medium">Şəxsi Maliyyə Köməkçiniz</p>
          </div>

          {/* Success Message (Registration) - login.html sətir 36-44 */}
          {registered && (
            <div className="mb-6 p-4 bg-green-500/20 backdrop-blur-md border border-green-500/50 rounded-xl text-green-200 text-sm animate-float">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Uğurla qeydiyyat keçdiniz! İndi giriş edə bilərsiniz.</span>
              </div>
            </div>
          )}

          {/* Error Message - login.html sətir 48-56 */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-md border border-red-500/50 rounded-xl text-red-200 text-sm animate-float">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Login Form - login.html sətir 60-115 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-white/90 text-sm font-semibold">
                İstifadəçi adı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
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
                  <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
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
                {!loading && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                )}
              </span>
            </button>
          </form>

          {/* Demo User Info - login.html sətir 119-133 */}
          <div className="mt-6 info-glass p-4 rounded-xl animate-float" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-blue-200 text-xs font-semibold mb-0.5">Demo hesab</p>
                <p className="text-blue-300/80 text-xs">
                  <code className="bg-white/10 px-2 py-0.5 rounded">demo</code> / <code className="bg-white/10 px-2 py-0.5 rounded">demo</code>
                </p>
              </div>
            </div>
          </div>

          {/* Signup Link - login.html sətir 136-143 */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Hesabın yoxdur?{' '}
              <Link to="/signup" className="glass-link text-blue-300 hover:text-blue-200 font-semibold transition inline-block">
                Qeydiyyatdan keç
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
