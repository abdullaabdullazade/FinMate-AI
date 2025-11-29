/**
 * Chat Page Component
 * chat.html, chat.css və chat.js-ə bir-bir uyğun
 * Səliqəli strukturlaşdırılmış
 */

import React from 'react'
import { useChat } from '../hooks/useChat'
import ChatContainer from '../components/chat/ChatContainer'
import ChatEmptyState from '../components/chat/ChatEmptyState'
import ChatInput from '../components/chat/ChatInput'

const Chat = () => {
  const {
    messages,
    inputMessage,
    loading,
    showTyping,
    chatContainerRef,
    inputRef,
    setInputMessage,
    handleSendMessage,
  } = useChat()

  return (
    <>
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
      />
    </>
  )
}

export default Chat
