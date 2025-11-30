/**
 * Typing Indicator Component
 */

import React from 'react'
import '../../styles/components/chat/typing-indicator.css'

const TypingIndicator = () => {
  return (
    <div className="flex justify-start" id="typing-indicator">
      <div className="message-bubble glass p-3 rounded-2xl rounded-tl-sm">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator

