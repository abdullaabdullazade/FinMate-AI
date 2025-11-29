/**
 * Voice Notification Hook
 * ReactJS-də səsləndirmə üçün hook
 */

import { useEffect, useCallback } from 'react'

/**
 * Voice notification hook
 * @returns {Function} speak - Səsləndirmə funksiyası
 */
export const useVoiceNotification = () => {
  /**
   * Səsləndirmə funksiyası
   * @param {string} text - Danışılacaq mətn
   * @param {number} priority - Prioritet (0=urgent, 1=normal, 2=low)
   * @param {string} language - Dil kodu
   */
  const speak = useCallback((text, priority = 1, language = 'az') => {
    if (!text || !text.trim()) {
      console.warn('🔇 Empty text provided to speak function')
      return
    }

    // Voice mode yoxla
    const voiceMode = localStorage.getItem('voice-mode')
    if (voiceMode !== 'enabled') {
      console.log('🔇 Voice mode disabled, skipping:', text.substring(0, 50))
      return
    }

    console.log('🔊 Speaking:', text.substring(0, 50), 'Priority:', priority)

    // queueVoiceNotification funksiyası mövcuddursa istifadə et
    if (typeof window.queueVoiceNotification === 'function') {
      try {
        window.queueVoiceNotification(text, priority, language)
      } catch (error) {
        console.error('❌ Error calling queueVoiceNotification:', error)
        // Fallback to direct TTS
        directTTS(text, language)
      }
    } else {
      // Fallback - direkt TTS API çağır
      console.warn('⚠️ queueVoiceNotification not available, using direct TTS')
      directTTS(text, language)
    }
  }, [])

  /**
   * Direkt TTS API çağırışı (fallback)
   */
  const directTTS = useCallback((text, language) => {
    const formData = new FormData()
    formData.append('text', text)
    formData.append('language', language)

    fetch('/api/tts', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`TTS API error: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        if (data.success && data.audio_response) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audio_response}`)
          audio.play().catch((err) => {
            console.error('❌ Audio play error:', err)
          })
        } else {
          console.error('❌ TTS API returned error:', data.error)
        }
      })
      .catch((error) => {
        console.error('❌ TTS error:', error)
      })
  }, [])

  /**
   * Voice mode aktivdirmi yoxla
   */
  const isVoiceModeEnabled = useCallback(() => {
    return localStorage.getItem('voice-mode') === 'enabled'
  }, [])

  return { speak, isVoiceModeEnabled }
}

export default useVoiceNotification

