/**
 * Chat Input Component
 * Input form - chat.html-dəki struktur
 */

import React from 'react'
import '../../styles/components/chat/chat-input-container.css'
import '../../styles/components/chat/chat-input-field.css'
import '../../styles/components/chat/send-button.css'

const ChatInput = ({ inputMessage, setInputMessage, handleSendMessage, loading, inputRef }) => {
  return (
    <div className="chat-input-container fixed left-0 right-0 px-4 sm:px-6 transition-all duration-300 z-50" style={{ bottom: '16px' }}>
      <div className="w-full max-w-4xl mx-auto">
        <form
          onSubmit={handleSendMessage}
          className="glass-card p-3 sm:p-4 flex items-center gap-3 sm:gap-4 mx-auto"
          id="chat-form"
          style={{ maxWidth: '100%' }}
        >
          <input
            ref={inputRef}
            type="text"
            name="message"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="AI CFO-dan nə öyrənmək istəyirsən?"
            required
            className="chat-input-field flex-1"
            autoComplete="off"
            id="chat-input"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center hover:scale-110 transition shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatInput

