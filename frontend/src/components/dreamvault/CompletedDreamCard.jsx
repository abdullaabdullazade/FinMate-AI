/**
 * Completed Dream Card Component
 */

import React from 'react'
import '../../styles/components/dreamvault/completed-dream-card.css'

const CompletedDreamCard = ({ dream }) => {
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

  const completedDate = dream.updated_at 
    ? new Date(dream.updated_at).toLocaleDateString('az-AZ')
    : ''

  return (
    <div className="completed-dream-card dream-card glass-card p-4 sm:p-6 relative overflow-hidden group">
      {/* Success Gradient Background */}
      <div className="completed-dream-background" />

      <div className="relative z-10">
        {/* Dream Image or Icon */}
        {dream.image_url ? (
          <div className="completed-dream-image-container">
            <img
              src={dream.image_url}
              alt={dream.title}
              className="completed-dream-image"
            />
            <div className="completed-dream-image-overlay" />
            <div className="completed-dream-image-content">
              <h3 className="completed-dream-title">{dream.title}</h3>
              <p className="completed-dream-category">{dream.category || 'Digər'}</p>
            </div>
          </div>
        ) : (
          <div className="completed-dream-icon-container">
            <div className="category-icon completed-category-icon">
              {getCategoryIcon(dream.category)}
            </div>
            <div className="completed-dream-title-group">
              <h3 className="completed-dream-title">{dream.title}</h3>
              <p className="completed-dream-category">{dream.category || 'Digər'}</p>
            </div>
          </div>
        )}

        {/* Achievement Info */}
        <div className="completed-dream-achievement">
          <div className="achievement-header">
            <span className="achievement-label">Tamamlanan Məbləğ</span>
            <span className="achievement-badge">100%</span>
          </div>
          <p className="achievement-amount">{dream.target_amount.toFixed(2)} AZN</p>
          <div className="achievement-date">
            <svg className="achievement-date-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span>Tamamlandı: {completedDate}</span>
          </div>
        </div>

        {/* Success Message */}
        <div className="completed-dream-message">
          <p className="completed-message-text">🎊 Təbriklər! Arzunuza çatdınız!</p>
        </div>
      </div>
    </div>
  )
}

export default CompletedDreamCard

