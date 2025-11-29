/**
 * Dream Empty State Component
 */

import React from 'react'
import '../../styles/components/dreamvault/dream-empty-state.css'

const DreamEmptyState = ({ onAddDream }) => {
  return (
    <div className="dream-empty-state glass-card p-6 sm:p-12 text-center col-span-full">
      <div className="empty-state-emoji">💭</div>
      <h3 className="empty-state-title">Hələ arzu yoxdur</h3>
      <p className="empty-state-description">
        İlk arzunuzu əlavə edin və qənaət etməyə başlayın!
      </p>
      <button onClick={onAddDream} className="empty-state-button">
        + İlk Arzunu Əlavə Et
      </button>
    </div>
  )
}

export default DreamEmptyState

