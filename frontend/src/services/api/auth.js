/**
 * Authentication API
 */

import { api } from './index'

export const authAPI = {
  // Login
  login: async (username, password) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    return api.post('/api/login', formData, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
  },

  // Signup
  signup: async (username, password, email) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    formData.append('confirm_password', password) // Signup requires confirm_password
    if (email) {
      formData.append('email', email)
    }
    return api.post('/api/signup', formData, {
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    })
  },

  // Logout
  logout: async () => {
    return api.get('/logout')
  },
}

