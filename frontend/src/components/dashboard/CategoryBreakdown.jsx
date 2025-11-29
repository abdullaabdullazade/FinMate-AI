/**
 * Category Breakdown Component
 * HTML-dən köçürülmüş - Kateqoriyalar üzrə xərc kartı
 * "Daha çox göstər" funksiyası ilə
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import CategoryCard from './CategoryCard'

const CategoryBreakdown = ({ categoryData, totalSpending, currency = '₼' }) => {
  const [showAll, setShowAll] = useState(false)
  
  if (!categoryData || Object.keys(categoryData).length === 0) return null

  const categories = Object.entries(categoryData)
  const initialCount = 6
  const hasMore = categories.length > initialCount
  const displayedCategories = showAll ? categories : categories.slice(0, initialCount)

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
        <AnimatePresence mode="wait">
          {displayedCategories.map(([category, amount], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              <CategoryCard
                category={category}
                amount={amount}
                totalSpending={totalSpending}
                currency={currency}
                delay={index * 0.05}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex justify-center"
        >
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 hover:border-purple-500/50 rounded-xl text-white font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
          >
            <span>{showAll ? 'Daha az göstər' : `Daha çox göstər (+${categories.length - initialCount})`}</span>
            {showAll ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default CategoryBreakdown

