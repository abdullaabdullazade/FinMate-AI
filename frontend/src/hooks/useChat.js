/**
 * Chat Hook
 */

import { useState, useEffect, useRef } from 'react'
import { chatAPI } from '../services/api'
import { toast } from '../utils/toast'
import { useAuth } from '../contexts/AuthContext'

// Premium modal açmaq üçün helper
const openPremiumModal = () => {
  if (typeof window.openPremiumModal === 'function') {
    window.openPremiumModal()
  }
}

export const useChat = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  const [dailyMessages, setDailyMessages] = useState(null)
  const [dailyLimit, setDailyLimit] = useState(null)
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
   * TTS Function - chat.js-dən - Premium yoxlaması ilə
   */
  const speakMessage = (text) => {
    // Premium yoxlaması - səsləndirmə yalnız premium üçün
    if (!user?.is_premium) {
      return
    }

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
   * Component mount olduqda əvvəlki mesajları yüklə və gündəlik limiti yoxla
   */
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await chatAPI.getChatHistory()
        if (response.data.success && response.data.messages) {
          setMessages(response.data.messages)
        }
        
        // Premium olmayan istifadəçilər üçün gündəlik mesaj sayını yüklə
        if (!user?.is_premium) {
          // İlk mesaj göndərmədən əvvəl gündəlik limiti yoxla
          // Bu, backend-dən gündəlik mesaj sayını alır
          // Həqiqi say backend-də mesaj göndərildikdə yenilənir
        }
      } catch (error) {
        console.error('Chat history fetch error:', error)
      }
    }

    fetchMessages()
  }, [user])

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

        // Update daily message count for non-premium users (hər mesaj yazıldıqca azalır)
        if (!user?.is_premium && response.data.daily_messages !== undefined && response.data.daily_limit) {
          setDailyMessages(response.data.daily_messages)
          setDailyLimit(response.data.daily_limit)
          const remaining = response.data.daily_limit - response.data.daily_messages
          
          // Qalan mesaj sayı 5 və ya daha az olduqda xəbərdarlıq
          if (remaining <= 5 && remaining > 0) {
            toast.warning(`⚠️ Gündəlik mesaj limiti: ${response.data.daily_messages}/${response.data.daily_limit}. Qalan: ${remaining} mesaj`, {
              position: 'top-right',
              autoClose: 4000,
            })
          }
        }

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
        // Check if error is due to daily message limit
        if (response.data.error && response.data.error.includes('limit')) {
          toast.error(response.data.error, {
            position: 'top-right',
            autoClose: 5000,
            onClick: () => openPremiumModal(), // Toast-a klik edəndə premium modal aç
          })
          // Premium modal aç
          setTimeout(() => {
            openPremiumModal()
          }, 1000)
          // Remove the user message that was added
          setMessages((prev) => prev.slice(0, -1))
          // Update daily message count
          if (response.data.daily_messages !== undefined && response.data.daily_limit) {
            setDailyMessages(response.data.daily_messages)
            setDailyLimit(response.data.daily_limit)
          }
        } else {
          setShowTyping(false)
          toast.error(response.data.error || 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.', {
            position: 'top-right',
            autoClose: 5000,
          })
          const errorMessage = {
            id: Date.now() + 1,
            role: 'ai',
            content: response.data.error || 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.',
          }
          setMessages((prev) => [...prev, errorMessage])
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setShowTyping(false)
      
      // Remove the user message that was added
      setMessages((prev) => prev.slice(0, -1))
      
      // Check if it's a 400 or 429 error (limit reached)
      if (error.response?.status === 400 || error.response?.status === 429) {
        const errorMsg = error.response?.data?.error || 'Gündəlik mesaj limitinə çatdınız'
        toast.error(errorMsg, {
          position: 'top-right',
          autoClose: 5000,
        })
      } else {
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
    dailyMessages,
    dailyLimit,
    chatContainerRef,
    inputRef,
    setInputMessage,
    handleSendMessage,
  }
}

