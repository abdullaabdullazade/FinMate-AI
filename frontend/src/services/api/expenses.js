/**
 * Expenses API
 */

import { api } from './index'

export const expensesAPI = {
  // Add expense
  addExpense: async (expenseData) => {
    const formData = new FormData()
    Object.keys(expenseData).forEach((key) => {
      formData.append(key, expenseData[key])
    })
    return api.post('/api/expense', formData)
  },

  // Update expense
  updateExpense: async (expenseId, expenseData) => {
    return api.put(`/api/expenses/${expenseId}`, expenseData)
  },

  // Delete expense
  deleteExpense: async (expenseId) => {
    return api.delete(`/api/expenses/${expenseId}`)
  },
}

