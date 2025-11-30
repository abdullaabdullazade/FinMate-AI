/**
 * XP Breakdown Chart Component
 */

import React, { useEffect, useRef } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const XPBreakdownChart = ({ xpBreakdown, theme }) => {
  const chartRef = useRef(null)

  useEffect(() => {
    // Theme colors function - profile.js-dəki getThemeColors() funksiyasını təkrarlayır
    const getThemeColors = () => {
      if (theme === 'gold') {
        return ['#ffd700', '#ffed4e', '#ffb300', '#ffc107', '#ffa000']
      } else if (theme === 'midnight') {
        return ['#ffffff', '#e0e0e0', '#bdbdbd', '#9e9e9e', '#757575']
      } else if (theme === 'ocean') {
        return ['#00bfff', '#5dade2', '#3498db', '#2980b9', '#1e88e5']
      } else if (theme === 'forest') {
        return ['#4caf50', '#81c784', '#66bb6a', '#43a047', '#388e3c']
      } else if (theme === 'sunset') {
        return ['#ff9800', '#ffb74d', '#ffa726', '#fb8c00', '#f57c00']
      } else if (theme === 'royal') {
        return ['#9c27b0', '#ba68c8', '#ab47bc', '#8e24aa', '#7b1fa2']
      } else {
        // Default colors
        return ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899']
      }
    }

    if (chartRef.current && xpBreakdown && Object.keys(xpBreakdown).length > 0) {
      // Chart is updated automatically by react-chartjs-2
    }
  }, [xpBreakdown, theme])

  if (!xpBreakdown || Object.keys(xpBreakdown).length === 0) {
    return (
      <div className="glass-card p-4 sm:p-6 slide-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">XP bölüşdürməsi</h3>
        <div className="h-48 sm:h-64 flex items-center justify-center">
          <p className="text-white/50 text-sm">Hələ aktivlik yoxdur</p>
        </div>
      </div>
    )
  }

  const getThemeColors = () => {
    if (theme === 'gold') {
      return ['#ffd700', '#ffed4e', '#ffb300', '#ffc107', '#ffa000']
    } else if (theme === 'midnight') {
      return ['#ffffff', '#e0e0e0', '#bdbdbd', '#9e9e9e', '#757575']
    } else if (theme === 'ocean') {
      return ['#00bfff', '#5dade2', '#3498db', '#2980b9', '#1e88e5']
    } else if (theme === 'forest') {
      return ['#4caf50', '#81c784', '#66bb6a', '#43a047', '#388e3c']
    } else if (theme === 'sunset') {
      return ['#ff9800', '#ffb74d', '#ffa726', '#fb8c00', '#f57c00']
    } else if (theme === 'royal') {
      return ['#9c27b0', '#ba68c8', '#ab47bc', '#8e24aa', '#7b1fa2']
    } else {
      return ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899']
    }
  }

  const labels = Object.keys(xpBreakdown).map((key) => {
    if (key === 'manual_expense') return 'Xərclər'
    if (key === 'scan_receipt') return 'Qəbz'
    if (key === 'chat_message') return 'Söhbət'
    if (key === 'login_streak') return 'Serial giriş'
    return key
  })

  const data = Object.values(xpBreakdown)

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: getThemeColors(),
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: 'Inter',
          },
        },
      },
    },
    cutout: '70%',
  }

  return (
    <div className="glass-card p-4 sm:p-6 slide-up" style={{ animationDelay: '0.1s' }}>
      <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">XP bölüşdürməsi</h3>
      <div className="h-48 sm:h-64 flex items-center justify-center">
        <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
      </div>
    </div>
  )
}

export default XPBreakdownChart
