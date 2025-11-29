/**
 * Chat Page Component
 * chat.html, chat.css və chat.js-ə bir-bir uyğun
 * Səliqəli strukturlaşdırılmış
 */

import React from 'react'
import { useChat } from '../hooks/useChat'
import { useAuth } from '../contexts/AuthContext'
import ChatContainer from '../components/chat/ChatContainer'
import ChatEmptyState from '../components/chat/ChatEmptyState'
import ChatInput from '../components/chat/ChatInput'

const Chat = () => {
  const { user } = useAuth()
  const {
    messages,
    inputMessage,
    loading,
    showTyping,
    dailyMessages,
    dailyLimit,
    chatContainerRef,
    inputRef,
    setInputMessage,
    handleSendMessage,
  } = useChat()

  // Premium olmayan istifadəçilər üçün gündəlik mesaj limiti göstər
  const showDailyLimit = !user?.is_premium && dailyLimit && dailyMessages !== null
  const remainingMessages = showDailyLimit ? dailyLimit - dailyMessages : null

  return (
    <>
      {/* Daily Message Limit Banner - Premium olmayan istifadəçilər üçün */}
      {showDailyLimit && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 glass-card px-4 py-2 rounded-lg border-2 border-yellow-500/50 bg-yellow-500/10 backdrop-blur-xl">
          <p className="text-white text-sm font-medium text-center">
            📊 Gündəlik mesaj limiti: <strong>{dailyMessages}/{dailyLimit}</strong>
            {remainingMessages !== null && (
              <span className="ml-2">(Qalan: <strong>{remainingMessages}</strong>)</span>
            )}
          </p>
        </div>
      )}

      {/* Chat Messages Container - chat.html-dəki struktur */}
      <ChatContainer
        messages={messages}
        showTyping={showTyping}
        chatContainerRef={chatContainerRef}
        isEmpty={messages.length === 0}
      />

      {/* Chat Input - chat.html-dəki struktur */}
      <ChatInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleSendMessage={handleSendMessage}
        loading={loading}
        inputRef={inputRef}
        disabled={showDailyLimit && remainingMessages !== null && remainingMessages < 0}
      />
    </>
  )
}

export default Chat
