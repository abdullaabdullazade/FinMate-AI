/**
 * Export API
 */

import { api } from './index'

export const exportAPI = {
  // Export to Excel
  exportToExcel: async () => {
    return api.get('/api/export-xlsx', {
      responseType: 'blob',
    })
  },

  // Export to PDF
  exportToPDF: async () => {
    return api.get('/api/export-pdf', {
      responseType: 'blob',
    })
  },
}



