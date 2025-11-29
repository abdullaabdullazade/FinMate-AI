/**
 * Voice API
 */

import { api } from './index'

export const voiceAPI = {
  // Voice command
  sendVoiceCommand: async (audioFile) => {
    const formData = new FormData()
    formData.append('audio', audioFile)
    return api.post('/api/voice-command', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Confirm voice
  confirmVoice: async (voiceData) => {
    return api.post('/api/confirm-voice', voiceData)
  },

  // Text to speech
  textToSpeech: async (text, language = 'az') => {
    const formData = new FormData()
    formData.append('text', text)
    formData.append('language', language)
    return api.post('/api/tts', formData)
  },
}

