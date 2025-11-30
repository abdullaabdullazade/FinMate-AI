/**
 * Chat Page Component
 * Səliqəli strukturlaşdırılmış
 */

import React from 'react'
import { useChat } from '../hooks/useChat'
import { useAuth } from '../contexts/AuthContext'
import { usePremiumModal } from '../contexts/PremiumModalContext'
import ChatContainer from '../components/chat/ChatContainer'
import ChatEmptyState from '../components/chat/ChatEmptyState'
import ChatInput from '../components/chat/ChatInput'
import DailyLimitBanner from '../components/chat/DailyLimitBanner'

const Chat = () => {
  const { user } = useAuth()
  const { openModal } = usePremiumModal()
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
  const isLimitReached = showDailyLimit && remainingMessages !== null && remainingMessages <= 0

  return (
    <>
      {/* Daily Message Limit Banner - Super gözəl və kreativ - Mobile optimized */}
      {showDailyLimit && (
        <DailyLimitBanner
          dailyMessages={dailyMessages}
          dailyLimit={dailyLimit}
          isLimitReached={isLimitReached}
          user={user}
        />
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
