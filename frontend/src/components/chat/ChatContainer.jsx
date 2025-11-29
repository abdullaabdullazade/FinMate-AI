/**
 * Chat Container Component
 * Messages container - chat.html-dəki struktur
 */

import React from 'react'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'
import ChatEmptyState from './ChatEmptyState'
import '../../styles/components/chat/chat-container.css'

const ChatContainer = ({ messages, showTyping, chatContainerRef, isEmpty }) => {
  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4">
      <div className="glass-card p-4 sm:p-6 mb-32 lg:mb-16">
        <div className="chat-container" id="chatContainer" ref={chatContainerRef}>
          <div id="messages" className="space-y-6 sm:space-y-8">
            {isEmpty ? (
              <ChatEmptyState />
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {showTyping && <TypingIndicator />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatContainer

