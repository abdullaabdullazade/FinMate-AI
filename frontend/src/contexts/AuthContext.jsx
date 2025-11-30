/**
 * Authentication Context
 * User authentication state-ini idarə edir
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  /**
   * Login funksiyası
   */
  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password)
      if (response.data.success) {
        setUser(response.data.user)
        // Refresh user data
        await refreshUser()
        return { success: true }
      }
      return { success: false, error: response.data.error || 'Login failed' }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Login failed',
      }
    }
  }

  /**
   * Signup funksiyası
   */
  const signup = async (username, password, email) => {
    try {
      const response = await authAPI.signup(username, password, email)
      if (response.data.success) {
        // Don't set user here - redirect to login
        return { success: true }
      }
      return { success: false, error: response.data.error || 'Signup failed' }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Signup failed',
      }
    }
  }

  /**
   * Logout funksiyası
   */
  const logout = async () => {
    try {
      // Logout zamanı onboarding completed qeydini sil
      // ki, növbəti girişdə yenidən göstərilsin
      if (user?.username) {
        const onboardingKey = `onboarding_completed_${user.username}`
        localStorage.removeItem(onboardingKey)
      }
      
      await authAPI.logout()
      setUser(null)
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  /**
   * User məlumatını yenilə
   */
  const refreshUser = async () => {
    try {
      // Get current user from stats API (it returns user data)
      const { api } = await import('../services/api')
      const response = await api.get('/api/stats')
      if (response.data?.user) {
          // Also get full user data from settings
        try {
          const settingsResponse = await api.get('/api/settings')
          if (settingsResponse.data?.user) {
            setUser({
              ...response.data.user,
              ...settingsResponse.data.user,
              is_premium: response.data.user.is_premium || false,
            })
          } else {
            setUser(response.data.user)
          }
        } catch (settingsError) {
          // If settings fails, just use stats data
          setUser(response.data.user)
        }
      }
    } catch (error) {
      console.error('User refresh error:', error)
      // If error, clear user (not authenticated)
      setUser(null)
    }
  }

  /**
   * Component mount olduqda user məlumatını yoxla
   */
  useEffect(() => {
    refreshUser().finally(() => {
      setLoading(false)
    })
  }, [])

  /**
   * Settings və ya user məlumatları yeniləndikdə user context-i yenilə
   */
  useEffect(() => {
    const handleSettingsUpdate = () => {
      console.log('🔄 Settings updated, refreshing user data...')
      refreshUser()
    }

    const handleUserUpdate = () => {
      console.log('🔄 User updated, refreshing user data...')
      refreshUser()
    }

    window.addEventListener('settingsUpdated', handleSettingsUpdate)
    window.addEventListener('userUpdated', handleUserUpdate)

    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate)
      window.removeEventListener('userUpdated', handleUserUpdate)
    }
  }, [])

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

