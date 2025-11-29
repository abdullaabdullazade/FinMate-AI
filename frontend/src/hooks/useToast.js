/**
 * Toast Hook
 * base.js-dəki showToast funksiyasını React hook-a çevirdik
 * Swipe to dismiss, auto-remove, və s. funksiyaları daxildir
 */

import { useState, useCallback } from 'react'

export const useToast = () => {
  const [toasts, setToasts] = useState([])

  /**
   * Toast göstər
   * @param {string} message - Toast mesajı
   * @param {string} type - 'success', 'error', 'info'
   */
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      message,
      type,
      visible: true,
    }

    setToasts((prev) => [...prev, newToast])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)

    // Voice notification (TTS)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = 'az-AZ'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      window.speechSynthesis.speak(utterance)
    }

    return id
  }, [])

  /**
   * Toast sil
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return { toasts, showToast, removeToast }
}

