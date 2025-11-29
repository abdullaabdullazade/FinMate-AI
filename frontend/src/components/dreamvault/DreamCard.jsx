/**
 * Dream Card Component
 * Tək bir dream kartı
 */

import React, { useState } from 'react'
import '../../styles/components/dreamvault/dream-card.css'
import AddSavingsModal from './AddSavingsModal'

const DreamCard = ({ dream, onEdit, onDelete, onAddSavings }) => {
  const [showAddSavings, setShowAddSavings] = useState(false)
  
  const progress = dream.target_amount > 0 
    ? (dream.saved_amount / dream.target_amount) * 100 
    : 0
  
  const blurAmount = Math.max(0, 12 - (progress / 100 * 12))
  const brightnessValue = 0.5 + (progress / 100 * 0.5)
  const isCompleted = progress >= 100

  const getCategoryIcon = (category) => {
    const icons = {
      'Səyahət': (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
        </svg>
      ),
      'Gadget': (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      ),
      'Maşın': (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
        </svg>
      ),
      'Ev': (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      ),
      'Təhsil': (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      ),
    }
    return icons[category] || (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
      </svg>
    )
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      5: { emoji: '🔥', text: 'Çox Yüksək', short: 'Çox Y.' },
      4: { emoji: '⚡', text: 'Yüksək', short: 'Yük.' },
      3: { emoji: '⭐', text: 'Orta', short: 'Orta' },
      2: { emoji: '💫', text: 'Aşağı', short: 'Aşağı' },
      1: { emoji: '✨', text: 'Çox Aşağı', short: 'Çox A.' },
    }
    return badges[priority] || badges[3]
  }

  const priorityBadge = getPriorityBadge(dream.priority || 3)
  const isIncognito = typeof window !== 'undefined' && localStorage.getItem('incognito-mode') === 'enabled'

  return (
    <>
      <div className="dream-card glass-card p-4 sm:p-6 relative" id={`dream-${dream.id}`}>
        {/* Priority Badge */}
        <div className={`priority-badge priority-${dream.priority || 3}`}>
          {priorityBadge.emoji} <span className="hidden sm:inline">{priorityBadge.text}</span>
          <span className="sm:hidden">{priorityBadge.short}</span>
        </div>

        {/* Dream Image or Placeholder */}
        {dream.image_url ? (
          <div className="dream-image-container group">
            <img
              src={dream.image_url}
              alt={dream.title}
              className="dream-image"
              style={{
                filter: `blur(${blurAmount}px) brightness(${brightnessValue})`,
              }}
              onError={(e) => {
                e.target.style.display = 'none'
                if (e.target.nextElementSibling) {
                  e.target.nextElementSibling.style.display = 'flex'
                }
              }}
            />
            <div
              className="dream-image-overlay"
              style={{ opacity: (100 - progress) / 100 }}
            />
            <div className="dream-image-placeholder" style={{ display: 'none' }}>
              <div className="category-icon">
                {getCategoryIcon(dream.category)}
              </div>
            </div>
            <div className="dream-progress-overlay">
              <div className="dream-progress-text">{progress.toFixed(1)}%</div>
            </div>
          </div>
        ) : (
          <div className="dream-image-placeholder-container">
            <div className="category-icon">
              {getCategoryIcon(dream.category)}
            </div>
          </div>
        )}

        {/* Dream Info */}
        <div className="dream-info">
          <h3 className="dream-title">{dream.title}</h3>
          {dream.description && (
            <p className="dream-description">{dream.description}</p>
          )}
          <div className="dream-tags">
            <span className="dream-tag">{dream.category || 'Digər'}</span>
            {dream.target_date && (
              <span className="dream-tag dream-tag-date">
                {new Date(dream.target_date) > new Date() 
                  ? `${Math.ceil((new Date(dream.target_date) - new Date()) / (1000 * 60 * 60 * 24))} gün`
                  : 'Vaxt keçib'}
              </span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="dream-progress-section">
          <div className="progress-header">
            <span className="progress-label">Tərəqqi</span>
            <span className="progress-amount">
              {isIncognito ? '**** / **** AZN' : `${dream.saved_amount.toFixed(2)} / ${dream.target_amount.toFixed(2)} AZN`}
            </span>
          </div>
          <div className="dream-progress-bar">
            <div
              className="dream-progress-fill shimmer"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          {isCompleted ? (
            <div className="dream-completed">
              <span className="dream-completed-text">🎉 Arzu tamamlandı!</span>
            </div>
          ) : (
            <div className="dream-remaining">
              {isIncognito ? '**** AZN qalıb' : `${(dream.target_amount - dream.saved_amount).toFixed(2)} AZN qalıb`}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isCompleted && (
          <div className="dream-actions">
            <button
              onClick={() => setShowAddSavings(true)}
              className="dream-action-button dream-action-primary"
            >
              <span className="money-icon">💰</span>
              <span className="hidden sm:inline">Qənaət Əlavə Et</span>
              <span className="sm:hidden">Əlavə Et</span>
            </button>
            <button
              onClick={() => onEdit(dream)}
              className="dream-action-button dream-action-secondary"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(dream.id)}
              className="dream-action-button dream-action-danger"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Add Savings Modal */}
      <AddSavingsModal
        dream={dream}
        isOpen={showAddSavings}
        onClose={() => setShowAddSavings(false)}
        onSuccess={(amount) => {
          setShowAddSavings(false)
          onAddSavings(dream.id, amount)
        }}
      />
    </>
  )
}

export default DreamCard

