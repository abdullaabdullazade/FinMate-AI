/**
 * Chat Hook
 * Chat məntiqini idarə edir - chat.js-dəki funksiyalar
 */

import { useState, useEffect, useRef } from 'react'
import { chatAPI } from '../services/api'
import { toast } from 'react-toastify'

export const useChat = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  const chatContainerRef = useRef(null)
  const inputRef = useRef(null)

  /**
   * Scroll to bottom funksiyası - chat.js-dən
   */
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  /**
   * TTS Function - chat.js-dən
   */
  const speakMessage = (text) => {
    if (typeof window.queueVoiceNotification === 'function') {
      const cleanText = text
        .replace(/\u003c[^\u003e]*\u003e/g, '')
        .replace(/\s+/g, ' ')
        .trim()

      if (cleanText.length > 0) {
        window.queueVoiceNotification(cleanText, 1, 'az')
      }
    }
  }

  /**
   * Component mount olduqda əvvəlki mesajları yüklə
   */
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await chatAPI.getChatHistory()
        if (response.data.success && response.data.messages) {
          setMessages(response.data.messages)
        }
      } catch (error) {
        console.error('Chat history fetch error:', error)
      }
    }

    fetchMessages()
  }, [])

  /**
   * Component mount olduqda scroll to bottom və focus input - chat.js-dəki kimi
   */
  useEffect(() => {
    // Add chat-page class to body - chat.html-dəki kimi
    document.body.classList.add('chat-page')

    // Scroll to bottom on page load - chat.js-dəki kimi
    scrollToBottom()

    // Focus input on page load - chat.js-dəki kimi
    setTimeout(() => {
      inputRef.current?.focus()
    }, 300)

    return () => {
      document.body.classList.remove('chat-page')
    }
  }, [])

  /**
   * Scroll to bottom when new message arrives
   */
  useEffect(() => {
    scrollToBottom()
  }, [messages, showTyping])

  /**
   * Mesaj göndər - chat.js-dəki HTMX məntiqinə uyğun
   */
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || loading) return

    const userMessage = inputMessage.trim()

    // Clear input immediately after capturing the message (chat.js-dəki kimi)
    setInputMessage('')

    // Append user bubble instantly before request (chat.js-dəki kimi)
    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
    }
    setMessages((prev) => [...prev, newUserMessage])

    // Remove existing typing indicator if any
    setShowTyping(true)
    setLoading(true)

    try {
      // AI-yə göndər
      const response = await chatAPI.sendMessage(userMessage)
      if (response.data.success) {
        // Remove typing indicator
        setShowTyping(false)

        const aiMessage = {
          id: Date.now() + 1,
          role: 'ai',
          content: response.data.response || response.data.message || '',
        }
        setMessages((prev) => [...prev, aiMessage])

        // Auto-speak the new message if it's from AI (chat.js-dəki kimi)
        if (aiMessage.content) {
          const text = aiMessage.content.replace(/<[^>]*>/g, '')
          speakMessage(text)
        }
      } else {
        setShowTyping(false)
        toast.error('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.', {
          position: 'top-right',
          autoClose: 5000,
        })
        const errorMessage = {
          id: Date.now() + 1,
          role: 'ai',
          content: 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.',
        }
        setMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      setShowTyping(false)
      toast.error('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.', {
        position: 'top-right',
        autoClose: 5000,
      })
      const errorMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return {
    messages,
    inputMessage,
    loading,
    showTyping,
    chatContainerRef,
    inputRef,
    setInputMessage,
    handleSendMessage,
  }
}

