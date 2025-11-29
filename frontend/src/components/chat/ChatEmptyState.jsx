/**
 * Chat Empty State Component
 * Shows when no messages - Mərkəzdə və aşağıda
 */

import React from 'react'

const ChatEmptyState = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-6xl mb-4">💬</div>
        <p className="text-lg text-white/80 mb-2">AI Chat-a xoş gəlmisiniz!</p>
        <p className="text-sm text-white/60">Sualınızı yazın və AI CFO cavab versin</p>
      </div>
    </div>
  )
}

export default ChatEmptyState

