/**
 * Date Filter Component - Premium Glassmorphism Design
 * Kreativ və gözəl tarix filteri
 */

import React, { useState } from 'react'
import { Calendar, X, ChevronDown, Clock, CalendarDays, CalendarRange } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const DateFilter = ({
  filterType,
  setFilterType,
  dateFilter,
  setDateFilter,
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  yearFilterInput,
  setYearFilterInput,
  startDateFilter,
  setStartDateFilter,
  endDateFilter,
  setEndDateFilter,
  dashboardData,
  currency,
  onApplyFilter
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const filterOptions = [
    { value: 'none', label: 'Filter yoxdur', icon: '📊', color: 'from-gray-500 to-gray-600' },
    { value: 'day', label: 'Günə görə', icon: '📅', color: 'from-blue-500 to-cyan-500' },
    { value: 'month', label: 'Aya görə', icon: '📆', color: 'from-purple-500 to-pink-500' },
    { value: 'year', label: 'İlə görə', icon: '🗓️', color: 'from-orange-500 to-red-500' },
    { value: 'range', label: 'Aralığa görə', icon: '📊', color: 'from-green-500 to-emerald-500' }
  ]

  const currentFilter = filterOptions.find(opt => opt.value === filterType)

  const handleFilterChange = (newType) => {
    setFilterType(newType)
    setDateFilter(null)
    setMonthFilter(null)
    setYearFilter(null)
    setYearFilterInput('')
    setStartDateFilter(null)
    setEndDateFilter(null)
    setIsExpanded(false)
  }

  const clearFilter = () => {
    handleFilterChange('none')
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('az-AZ', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long' 
    })
  }

  const formatMonth = (monthString) => {
    if (!monthString) return ''
    const date = new Date(monthString + '-01')
    return date.toLocaleDateString('az-AZ', { year: 'numeric', month: 'long' })
  }

  const hasActiveFilter = filterType !== 'none' && (
    dateFilter || monthFilter || yearFilter || (startDateFilter && endDateFilter)
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-4 sm:p-6 slide-up relative overflow-hidden"
      style={{ gridColumn: 'span 12' }}
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-br ${currentFilter?.color || 'from-gray-500 to-gray-600'} blur-3xl`} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${currentFilter?.color || 'from-gray-500 to-gray-600'} shadow-lg`}>
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Tarixə görə filter</h3>
              <p className="text-xs text-white/60">Məlumatları filtrləyin</p>
            </div>
          </div>
          
          {hasActiveFilter && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={clearFilter}
              className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all group"
              title="Filteri təmizlə"
            >
              <X className="w-4 h-4 text-red-400 group-hover:text-red-300" />
            </motion.button>
          )}
        </div>

        {/* Filter Type Selector - Beautiful Cards */}
        <div className="mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {filterOptions.map((option) => {
              const isActive = filterType === option.value
              return (
                <motion.button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-3 rounded-xl border-2 transition-all overflow-hidden group ${
                    isActive
                      ? `border-transparent bg-gradient-to-br ${option.color} shadow-lg`
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  {/* Background gradient for active */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-20`}
                    />
                  )}
                  
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <span className="text-2xl">{option.icon}</span>
                    <span className={`text-xs font-medium ${
                      isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                    }`}>
                      {option.label}
                    </span>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full shadow-lg"
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Filter Inputs - Animated */}
        <AnimatePresence mode="wait">
          {filterType === 'day' && (
            <motion.div
              key="day"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                <CalendarDays className="w-4 h-4" />
                Gün seçin
              </label>
              <input
                type="date"
                value={dateFilter || ''}
                onChange={(e) => setDateFilter(e.target.value || null)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'var(--glass-border)',
                  color: 'var(--text-primary)'
                }}
              />
            </motion.div>
          )}

          {filterType === 'month' && (
            <motion.div
              key="month"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Calendar className="w-4 h-4" />
                Ay seçin
              </label>
              <input
                type="month"
                value={monthFilter || ''}
                onChange={(e) => setMonthFilter(e.target.value || null)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'var(--glass-border)',
                  color: 'var(--text-primary)'
                }}
              />
            </motion.div>
          )}

          {filterType === 'year' && (
            <motion.div
              key="year"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Clock className="w-4 h-4" />
                İl yazın (2020-2030)
              </label>
              <input
                type="number"
                min="2020"
                max="2030"
                value={yearFilterInput}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === '' || /^\d+$/.test(value)) {
                    setYearFilterInput(value)
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value
                  if (value.length === 4) {
                    const year = parseInt(value)
                    if (year >= 2020 && year <= 2030) {
                      setYearFilter(value)
                    } else {
                      setYearFilterInput('')
                      setYearFilter(null)
                    }
                  } else if (value.length > 0 && value.length < 4) {
                    setYearFilterInput('')
                    setYearFilter(null)
                  }
                }}
                placeholder="Məs: 2025"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'var(--glass-border)',
                  color: 'var(--text-primary)'
                }}
              />
            </motion.div>
          )}

          {filterType === 'range' && (
            <motion.div
              key="range"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                <CalendarRange className="w-4 h-4" />
                Tarix aralığı seçin
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Başlanğıc</label>
                  <input
                    type="date"
                    value={startDateFilter || ''}
                    onChange={(e) => setStartDateFilter(e.target.value || null)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'var(--glass-border)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Son</label>
                  <input
                    type="date"
                    value={endDateFilter || ''}
                    onChange={(e) => setEndDateFilter(e.target.value || null)}
                    min={startDateFilter || undefined}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'var(--glass-border)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Apply Filter Button - Yalnız filter aktiv olduqda və dəyər seçildikdə göstər */}
        <AnimatePresence>
          {hasActiveFilter && filterType !== 'none' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4"
            >
              <button
                onClick={() => {
                  if (onApplyFilter) {
                    onApplyFilter()
                  }
                }}
                className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${currentFilter?.color || 'from-gray-500 to-gray-600'} text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]`}
                type="button"
              >
                🔍 Filteri tətbiq et
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filter Info - Beautiful Cards */}
        <AnimatePresence>
          {hasActiveFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/10"
            >
              <div className={`p-4 rounded-xl bg-gradient-to-br ${currentFilter?.color || 'from-gray-500 to-gray-600'} bg-opacity-20 border border-white/20`}>
                {filterType === 'day' && dateFilter && (
                  <div>
                    <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      Seçilmiş gün
                    </p>
                    <p className="text-lg font-bold text-white mb-1">
                      {formatDate(dateFilter)}
                    </p>
                    {dashboardData?.context && (
                      <p className="text-xs text-white/80">
                        Ümumi xərc: <span className="font-bold">{dashboardData.context.total_spend?.toFixed(2) || '0.00'} {currency}</span>
                      </p>
                    )}
                  </div>
                )}

                {filterType === 'month' && monthFilter && (
                  <div>
                    <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Seçilmiş ay
                    </p>
                    <p className="text-lg font-bold text-white mb-1">
                      {formatMonth(monthFilter)}
                    </p>
                    {dashboardData?.context && (
                      <p className="text-xs text-white/80">
                        Ümumi xərc: <span className="font-bold">{dashboardData.context.total_spend?.toFixed(2) || '0.00'} {currency}</span>
                      </p>
                    )}
                  </div>
                )}

                {filterType === 'year' && yearFilter && (
                  <div>
                    <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Seçilmiş il
                    </p>
                    <p className="text-lg font-bold text-white mb-1">
                      {yearFilter}
                    </p>
                    {dashboardData?.context && (
                      <p className="text-xs text-white/80">
                        Ümumi xərc: <span className="font-bold">{dashboardData.context.total_spend?.toFixed(2) || '0.00'} {currency}</span>
                      </p>
                    )}
                  </div>
                )}

                {filterType === 'range' && startDateFilter && endDateFilter && (
                  <div>
                    <p className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <CalendarRange className="w-4 h-4" />
                      Seçilmiş aralıq
                    </p>
                    <p className="text-lg font-bold text-white mb-1">
                      {formatDate(startDateFilter)} - {formatDate(endDateFilter)}
                    </p>
                    {dashboardData?.context && (
                      <p className="text-xs text-white/80">
                        Ümumi xərc: <span className="font-bold">{dashboardData.context.total_spend?.toFixed(2) || '0.00'} {currency}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default DateFilter

