/**
 * Dream Vault Header Component
 */

import React from 'react'
import '../../styles/components/dreamvault/dream-vault-header.css'

const DreamVaultHeader = ({ onAddDream }) => {
  return (
    <div className="dream-vault-header glass-card p-4 sm:p-6 mb-4 sm:mb-6 slide-up">
      <div className="header-content">
        <div className="header-title-group">
          <h1 className="header-title">
            <span className="header-emoji">💎</span>
            <span className="header-text">Dream Vault</span>
          </h1>
          <p className="header-subtitle">
            Arzularınızı həyata keçirmək üçün qənaət edin
          </p>
        </div>
        <button
          onClick={onAddDream}
          className="add-dream-button"
        >
          + Arzu Əlavə Et
        </button>
      </div>
    </div>
  )
}

export default DreamVaultHeader

