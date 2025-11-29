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
      const response = await fetch('/api/stats', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          // Also get full user data from settings
          const settingsResponse = await fetch('/api/settings', {
            credentials: 'include',
          })
          if (settingsResponse.ok) {
            const settingsData = await settingsResponse.json()
            setUser({
              ...data.user,
              ...settingsData,
              is_premium: data.user.is_premium || false,
            })
          } else {
            setUser(data.user)
          }
        }
      }
    } catch (error) {
      console.error('User refresh error:', error)
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

