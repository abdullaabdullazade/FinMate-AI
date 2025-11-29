/**
 * Chat Container Component
 * Messages container - chat.html-dəki struktur
 * Resizeable chat area
 */

import React, { useState, useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'
import ChatEmptyState from './ChatEmptyState'
import { Maximize2, Minimize2 } from 'lucide-react'
import '../../styles/components/chat/chat-container.css'

const ChatContainer = ({ messages, showTyping, chatContainerRef, isEmpty }) => {
  const [chatHeight, setChatHeight] = useState(() => {
    const saved = localStorage.getItem('chatHeight')
    return saved ? parseInt(saved, 10) : null
  })
  const [isResizing, setIsResizing] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const containerRef = useRef(null)
  const resizeHandleRef = useRef(null)

  // Resize funksiyası
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return

      const container = containerRef.current
      if (!container) return

      const containerRect = container.getBoundingClientRect()
      const newHeight = window.innerHeight - e.clientY - 20 // 20px bottom padding
      const minHeight = 300
      const maxHeight = window.innerHeight - 150

      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setChatHeight(newHeight)
        localStorage.setItem('chatHeight', newHeight.toString())
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'row-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  // Maximize/Minimize funksiyası
  const toggleMaximize = () => {
    if (isMaximized) {
      // Restore
      const saved = localStorage.getItem('chatHeight')
      setChatHeight(saved ? parseInt(saved, 10) : null)
      setIsMaximized(false)
    } else {
      // Maximize
      const currentHeight = containerRef.current?.offsetHeight || 0
      localStorage.setItem('chatHeight', currentHeight.toString())
      setChatHeight(window.innerHeight - 150)
      setIsMaximized(true)
    }
  }

  // Reset funksiyası
  const resetHeight = () => {
    setChatHeight(null)
    setIsMaximized(false)
    localStorage.removeItem('chatHeight')
  }

  const containerStyle = chatHeight ? { height: `${chatHeight}px` } : {}

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4">
      <div className="glass-card p-4 sm:p-6 mb-32 lg:mb-16 relative">
        {/* Resize Controls */}
        <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
          <button
            onClick={toggleMaximize}
            className="chat-resize-btn"
            title={isMaximized ? 'Kiçilt' : 'Böyüt'}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        <div 
          className="chat-container" 
          id="chatContainer" 
          ref={(node) => {
            if (chatContainerRef) {
              if (typeof chatContainerRef === 'function') {
                chatContainerRef(node)
              } else {
                chatContainerRef.current = node
              }
            }
            containerRef.current = node
          }}
          style={containerStyle}
        >
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

        {/* Resize Handle */}
        <div
          ref={resizeHandleRef}
          className="chat-resize-handle"
          onMouseDown={(e) => {
            e.preventDefault()
            setIsResizing(true)
          }}
          title="Yuxarı-aşağı sürükləyin"
        />
      </div>
    </div>
  )
}

export default ChatContainer

