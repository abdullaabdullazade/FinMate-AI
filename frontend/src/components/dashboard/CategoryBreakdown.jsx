/**
 * Category Breakdown Component
 * HTML-dən köçürülmüş - Kateqoriyalar üzrə xərc kartı
 */

import React from 'react'
import { motion } from 'framer-motion'
import CategoryCard from './CategoryCard'

const CategoryBreakdown = ({ categoryData, totalSpending, currency = '₼' }) => {
  if (!categoryData || Object.keys(categoryData).length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-card p-4 sm:p-6 slide-up"
      style={{ gridColumn: 'span 12' }}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-white">Kateqoriyalar üzrə</h3>
        <span className="text-xs sm:text-sm text-white/60">
          {Object.keys(categoryData).length} kateqoriya
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {Object.entries(categoryData).map(([category, amount], index) => (
          <CategoryCard
            key={category}
            category={category}
            amount={amount}
            totalSpending={totalSpending}
            currency={currency}
            delay={index * 0.05}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default CategoryBreakdown

