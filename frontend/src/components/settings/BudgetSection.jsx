/**
 * Budget Section Component
 * Aylıq və gündəlik büdcə idarəetməsi
 */

import React, { useState, useEffect, useRef } from 'react'
import '../../styles/components/settings/budget-section.css'

const BudgetSection = ({ 
  monthlyBudget, 
  dailyBudgetLimit, 
  onBudgetChange, 
  onDailyLimitChange 
}) => {
  const [budgetValue, setBudgetValue] = useState(monthlyBudget || 1000)
  const [dailyLimit, setDailyLimit] = useState(dailyBudgetLimit || '')
  const [sliderMax, setSliderMax] = useState(Math.max(100000, monthlyBudget || 1000))
  const sliderRef = useRef(null)
  const progressRef = useRef(null)
  const thumbRef = useRef(null)

  useEffect(() => {
    setBudgetValue(monthlyBudget || 1000)
    setSliderMax(Math.max(100000, monthlyBudget || 1000))
  }, [monthlyBudget])

  useEffect(() => {
    setDailyLimit(dailyBudgetLimit || '')
  }, [dailyBudgetLimit])

  /**
   * Slider dəyişdikdə
   */
  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    setBudgetValue(value)
    updateProgress(value)
    onBudgetChange(value)
  }

  /**
   * Input dəyişdikdə
   */
  const handleInputChange = (e) => {
    const value = e.target.value
    setBudgetValue(value)
    
    if (value && value !== '') {
      const numVal = parseFloat(value.replace(/[^\d.]/g, '')) || 0
      if (!isNaN(numVal)) {
        // Slider max-ı artır lazım olsa
        if (numVal > sliderMax) {
          setSliderMax(numVal)
        }
        updateProgress(numVal)
        onBudgetChange(numVal)
      }
    } else {
      updateProgress(0)
    }
  }

  /**
   * Input blur olduqda validate et
   */
  const handleInputBlur = (e) => {
    let numVal = parseFloat(e.target.value) || 0
    
    if (isNaN(numVal) || numVal < 100) {
      numVal = 100
      setBudgetValue(100)
      updateProgress(100)
      onBudgetChange(100)
    } else {
      setBudgetValue(numVal)
      updateProgress(numVal)
      onBudgetChange(numVal)
    }
  }

  /**
   * Daily limit dəyişdikdə
   */
  const handleDailyLimitChange = (e) => {
    const value = e.target.value
    setDailyLimit(value)
    
    // Validate
    const cleaned = value.replace(/[^\d.]/g, '')
    if (cleaned === '' || cleaned === '.') {
      onDailyLimitChange('')
      return
    }
    
    const numVal = parseFloat(cleaned)
    if (!isNaN(numVal) && numVal >= 0) {
      onDailyLimitChange(numVal)
    }
  }

  /**
   * Daily limit blur olduqda format et
   */
  const handleDailyLimitBlur = (e) => {
    const value = e.target.value.trim()
    if (value === '') {
      onDailyLimitChange('')
      return
    }
    
    const cleaned = value.replace(/[^\d.]/g, '')
    const numVal = parseFloat(cleaned)
    
    if (!isNaN(numVal) && numVal >= 0) {
      const formatted = numVal.toFixed(2)
      setDailyLimit(formatted)
      onDailyLimitChange(parseFloat(formatted))
    } else {
      setDailyLimit('')
      onDailyLimitChange('')
    }
  }

  /**
   * Progress bar və thumb yenilə
   */
  const updateProgress = (value) => {
    if (!progressRef.current || !thumbRef.current || !sliderRef.current) return
    
    const max = parseFloat(sliderRef.current?.max) || sliderMax
    const percentage = Math.min((value / max) * 100, 100)
    
    progressRef.current.style.width = `${percentage}%`
    thumbRef.current.style.left = `${percentage}%`
  }

  // Initial progress update
  useEffect(() => {
    if (sliderRef.current) {
      const max = parseFloat(sliderRef.current.max) || sliderMax
      const value = typeof budgetValue === 'number' ? budgetValue : parseFloat(budgetValue) || 0
      updateProgress(value)
    }
  }, [sliderMax, budgetValue])

  const percentage = Math.min((budgetValue / sliderMax) * 100, 100)

  return (
    <div className="settings-section budget-section slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="section-header">
        <div className="section-icon budget-icon">
          💰
        </div>
        <div className="section-title-group">
          <h2 className="section-title">Büdcə İdarəetməsi</h2>
          <p className="section-subtitle">Aylıq və gündəlik limitlərinizi təyin edin</p>
        </div>
      </div>

      <div className="budget-content">
        {/* Monthly Budget */}
        <div className="budget-input-group">
          <div className="budget-input-header">
            <label className="budget-label">Aylıq Büdcə</label>
            <div className="budget-input-wrapper">
              <input
                type="number"
                id="monthly-budget-input"
                value={budgetValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                step="0.01"
                min="100"
                className="budget-input"
                placeholder="100"
                required
              />
              <span className="budget-currency">AZN</span>
            </div>
          </div>
          
          {/* Slider */}
          <div className="budget-slider-container">
            <input
              ref={sliderRef}
              type="range"
              id="monthly-budget-slider"
              min="100"
              max={sliderMax}
              step="50"
              value={budgetValue}
              onChange={handleSliderChange}
              className="budget-slider"
            />
            <div 
              ref={progressRef}
              className="budget-progress"
              style={{ width: `${percentage}%` }}
            />
            <div 
              ref={thumbRef}
              className="budget-thumb"
              style={{ left: `${percentage}%` }}
            />
          </div>
          
          <div className="budget-slider-labels">
            <span>100 AZN</span>
            <span>{Math.round(sliderMax).toLocaleString()}</span>
          </div>
        </div>

        {/* Daily Limit */}
        <div className="daily-limit-group">
          <label className="daily-limit-label">
            Gündəlik Xərc Limiti (Opsional)
          </label>
          <div className="daily-limit-input-wrapper">
            <input
              type="number"
              id="daily-budget-limit-input"
              value={dailyLimit}
              onChange={handleDailyLimitChange}
              onBlur={handleDailyLimitBlur}
              placeholder="Limit yoxdur"
              min="0"
              step="0.01"
              className="daily-limit-input"
            />
            <span className="daily-limit-currency">AZN</span>
          </div>
          <p className="daily-limit-hint">
            <svg className="hint-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Limit keçildikdə xəbərdarlıq alacaqsınız (İstənilən məbləğ AZN arası)
          </p>
        </div>
      </div>
    </div>
  )
}

export default BudgetSection

