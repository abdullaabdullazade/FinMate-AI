/**
 * Chat Message Component
 * Single message bubble - chat.html-dəki struktur
 */

import React, { useMemo, useState } from 'react'
import { markdownToHtml } from '../../utils/markdown'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from '../../utils/toast'
import '../../styles/components/chat/message-bubbles.css'
import '../../styles/components/chat/markdown-content.css'

const ChatMessage = ({ message }) => {
  const { user } = useAuth()
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speakMessage = (text) => {
    // Premium yoxlaması - səsləndirmə yalnız premium üçün
    if (!user?.is_premium) {
      toast.error('🔒 Səsləndirmə funksiyası yalnız Premium istifadəçilər üçün əlçatandır.', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        closeButton: true,
      })
      return
    }

    if (isSpeaking) {
      // Stop speaking
      if (typeof window.stopVoicePlayback === 'function') {
        window.stopVoicePlayback()
        setIsSpeaking(false)
      }
      return
    }

    if (typeof window.queueVoiceNotification === 'function') {
      const cleanText = text
        .replace(/\u003c[^\u003e]*\u003e/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      if (cleanText.length > 0) {
        setIsSpeaking(true)
        window.queueVoiceNotification(cleanText, 1, 'az')
        
        // Reset speaking state after a delay (approximate)
        // Actual duration depends on text length, but we'll use a timeout
        const estimatedDuration = Math.max(cleanText.length * 50, 2000) // ~50ms per character, min 2s
        setTimeout(() => {
          setIsSpeaking(false)
        }, estimatedDuration)
      }
    }
  }

  // Convert markdown to HTML for AI messages
  const renderedContent = useMemo(() => {
    try {
      if (message.role === 'ai') {
        // Check if content is already HTML (contains <strong>, <em>, etc.)
        const isAlreadyHtml = /<[^>]+>/.test(message.content)
        
        if (isAlreadyHtml) {
          // Already HTML, use as is
          return message.content
        } else {
          // Convert markdown to HTML
          return markdownToHtml(message.content || '')
        }
      }
      return message.content || ''
    } catch (error) {
      console.error('Markdown rendering error:', error)
      return message.content || ''
    }
  }, [message.content, message.role])

  if (message.role === 'user') {
    // User Message - chat.html-dəki struktur
    return (
      <div className="flex justify-end">
        <div className="message-bubble bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-4 rounded-2xl rounded-tr-sm shadow-lg">
          {message.content}
        </div>
      </div>
    )
  } else {
    // AI Message - chat.html-dəki struktur
    return (
      <div className="flex justify-start group">
        <div className="message-bubble glass p-4 rounded-2xl rounded-tl-sm text-white shadow-lg relative markdown-content">
          <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
          <button
            onClick={() => speakMessage(message.content.replace(/<[^>]*>/g, ''))}
            className={`absolute -right-8 top-2 text-white/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full backdrop-blur-sm ${
              isSpeaking ? 'bg-red-500/30' : 'bg-white/20'
            }`}
            title={isSpeaking ? 'Dayandır' : 'Səslə oxu'}
          >
            {isSpeaking ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h12v12H6z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    )
  }
}

export default ChatMessage

