/**
 * Category Chart Component
 * react-chartjs-2 ilə doughnut chart
 */

import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const CategoryChart = ({ labels = [], values = [] }) => {
  if (!labels.length || !values.length) {
    return (
      <div className="flex items-center justify-center h-full text-white/50">
        <p>Hələ məlumat yoxdur</p>
      </div>
    )
  }

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          '#60a5fa', // Blue
          '#22d3ee', // Cyan
          '#c084fc', // Purple
          '#34d399', // Green
          '#fca5a5', // Red
          '#facc15', // Yellow
        ],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#e5e7eb',
        },
      },
    },
    cutout: '70%',
    maintainAspectRatio: true,
    responsive: true,
  }

  return (
    <div className="chart-shell p-4 sm:p-6 h-[200px] sm:h-[250px]">
      <Doughnut data={chartData} options={chartOptions} />
    </div>
  )
}

export default CategoryChart

