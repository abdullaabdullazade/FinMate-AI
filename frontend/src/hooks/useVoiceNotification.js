/**
 * useVoiceNotification Hook
 * Voice notification sistemini React-də istifadə etmək üçün hook
 * Premium istifadəçilər üçün
 */

import { useEffect, useCallback, useState } from 'react'
import { voiceAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export const useVoiceNotification = () => {
  const { user } = useAuth()
  const [isVoiceModeEnabled, setIsVoiceModeEnabled] = useState(false)

  /**
   * Voice mode-u yoxla
   */
  useEffect(() => {
    const checkVoiceMode = () => {
      const voiceMode = localStorage.getItem('voice-mode') === 'enabled'
      setIsVoiceModeEnabled(voiceMode)
    }

    checkVoiceMode()

    // Listen for voice mode changes
    const handleStorageChange = (e) => {
      if (e.key === 'voice-mode') {
        checkVoiceMode()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Custom event listener for voice mode changes
    const handleVoiceModeChange = () => {
      checkVoiceMode()
    }
    window.addEventListener('voiceModeChanged', handleVoiceModeChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('voiceModeChanged', handleVoiceModeChange)
    }
  }, [])

  /**
   * Səsləndirmə funksiyası - Premium yoxlaması ilə
   */
  const speak = useCallback(async (text, priority = 0, language = 'az') => {
    // Premium yoxlaması
    if (!user?.is_premium) {
      console.warn('Voice notification requires premium subscription')
      return
    }

    try {
      // Voice mode aktivdirsə
      if (isVoiceModeEnabled || localStorage.getItem('voice-mode') === 'enabled') {
        // window.queueVoiceNotification varsa istifadə et
        if (typeof window.queueVoiceNotification === 'function') {
          window.queueVoiceNotification(text, priority, language)
          return
        }
        
        // Fallback: TTS API istifadə et
        try {
          await voiceAPI.textToSpeech(text, language)
        } catch (error) {
          console.error('TTS API error:', error)
        }
      }
    } catch (error) {
      console.error('Speak error:', error)
    }
  }, [isVoiceModeEnabled, user])

  return {
    speak,
    isVoiceModeEnabled,
  }
}

export default useVoiceNotification
