/**
 * Forecast API
 */

import { api } from './index'

export const forecastAPI = {
  // Get forecast
  getForecast: async () => {
    return api.get('/api/forecast')
  },

  // Get forecast chart
  getForecastChart: async () => {
    return api.get('/api/forecast-chart')
  },
}

