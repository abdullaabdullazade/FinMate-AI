/**
 * AI Persona Section Component
 * AI xarakteri və persona ayarları
 */

import React, { useState } from 'react'
import '../../styles/components/settings/ai-persona-section.css'

const AIPersonaSection = ({
  aiPersonaMode,
  aiName,
  aiAttitude,
  aiStyle,
  onPersonaModeChange,
  onAiNameChange,
  onAttitudeChange,
  onStyleChange
}) => {
  const [showManualFields, setShowManualFields] = useState(aiPersonaMode === 'Manual')

  const handlePersonaModeChange = (e) => {
    const mode = e.target.value
    setShowManualFields(mode === 'Manual')
    onPersonaModeChange(mode)
  }

  return (
    <div className="glass-card p-4 sm:p-6 slide-up" style={{ animationDelay: '0.25s' }}>
      <div className="section-header">
        <div className="section-icon ai-persona-icon">
          🤖
        </div>
        <div className="section-title-group">
          <h2 className="section-title">AI Xarakteri</h2>
          <p className="section-subtitle">Maliyyə köməkçinizi özünüzə uyğunlaşdırın</p>
        </div>
      </div>

      <div className="ai-persona-content">
        {/* AI Persona Mode */}
        <div className="ai-persona-field">
          <label className="field-label">Persona Rejimi</label>
          <div className="select-wrapper">
            <select
              name="ai_persona_mode"
              value={aiPersonaMode}
              onChange={handlePersonaModeChange}
              className="select-input"
            >
              <option value="Auto">🎭 Avtomatik (Məsləhətli)</option>
              <option value="Manual">✍️ Əl ilə (Manual)</option>
            </select>
            <div className="select-arrow">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
          <p className="field-hint">
            <svg className="hint-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Avtomatik rejim büdcənizə əsasən AI xarakterini dəyişir
          </p>
        </div>

        {/* AI Name */}
        <div className="ai-persona-field">
          <label className="field-label">AI Adı</label>
          <input
            type="text"
            name="ai_name"
            value={aiName || 'FinMate'}
            onChange={(e) => onAiNameChange(e.target.value)}
            placeholder="FinMate"
            className="text-input"
          />
        </div>

        {/* Manual Mode Fields */}
        {showManualFields && (
          <div className="manual-mode-fields">
            {/* AI Attitude */}
            <div className="ai-persona-field">
              <label className="field-label">Münasibət</label>
              <div className="select-wrapper">
                <select
                  name="ai_attitude"
                  value={aiAttitude}
                  onChange={(e) => onAttitudeChange(e.target.value)}
                  className="select-input"
                >
                  <option value="Professional">💼 Professional</option>
                  <option value="Strict">😤 Sərt Ana</option>
                  <option value="Funny">😄 Zarafatcıl</option>
                  <option value="Sarcastic">😏 Sarkastik</option>
                  <option value="Supportive">🤗 Dəstəkləyici</option>
                </select>
                <div className="select-arrow">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* AI Style */}
            <div className="ai-persona-field">
              <label className="field-label">Danışıq Tərzi</label>
              <div className="select-wrapper">
                <select
                  name="ai_style"
                  value={aiStyle}
                  onChange={(e) => onStyleChange(e.target.value)}
                  className="select-input"
                >
                  <option value="Formal">🎩 Rəsmi</option>
                  <option value="Slang">😎 Jarqon / Slang</option>
                  <option value="Shakespearean">📜 Shakespearean</option>
                  <option value="Dialect">🗣️ Ləhcə</option>
                  <option value="Short">⚡ Qısa</option>
                </select>
                <div className="select-arrow">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Persona Examples */}
        <div className="ai-persona-examples">
          <p className="examples-text">
            <span className="examples-title">💡 Nümunələr:</span><br />
            <span className="examples-item">• Büdcənin 20%-dən azı qalıb → </span>
            <span className="examples-value">"Sərt Ana" avtomatik aktivləşir</span><br />
            <span className="examples-item">• Büdcənin 50%-dən çoxu qalıb → </span>
            <span className="examples-value">"Professional CFO" aktivləşir</span><br />
            <span className="examples-item">• Normal vəziyyət → </span>
            <span className="examples-value">"Dost/Kanka" rejimi</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AIPersonaSection

