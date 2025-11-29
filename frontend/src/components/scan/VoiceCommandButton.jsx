/**
 * Voice Command Button Component
 * Scan səhifəsində səsli əmr düyməsi
 */

import React, { useState, useEffect } from 'react'
import { Mic, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { usePremiumModal } from '../../contexts/PremiumModalContext'
import VoiceConfirmationModal from './VoiceConfirmationModal'

const VoiceCommandButton = () => {
  const { openModal: openPremiumModal } = usePremiumModal()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState('Hazıram')
  const [language, setLanguage] = useState('az')
  const [result, setResult] = useState(null)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioChunks, setAudioChunks] = useState([])
  const [stream, setStream] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationData, setConfirmationData] = useState(null)

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }
    }
  }, [stream, mediaRecorder])

  const startRecording = async () => {
    if (isRecording) {
      stopRecording()
      return
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setStream(mediaStream)

      let options = { mimeType: 'audio/webm' }
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/mp4' }
      }

      const recorder = new MediaRecorder(mediaStream, options)
      const chunks = []

      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      })

      recorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(chunks, { type: recorder.mimeType })
        await sendAudioToServer(audioBlob)
      })

      recorder.start()
      setMediaRecorder(recorder)
      setAudioChunks(chunks)
      setIsRecording(true)
      setStatus('Dinləyirəm... Danışın 🎙️')
    } catch (error) {
      console.error('Mikrofon xətası:', error)
      toast.error('Mikrofona icazə verilmədi', { autoClose: 5000 })
      setStatus('Hazıram')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      setIsRecording(false)
      setIsProcessing(true)
      setStatus('AI Analiz edir... 🧠')
    }
  }

  const sendAudioToServer = async (audioBlob) => {
    try {
      const { voiceAPI } = await import('../../services/api')
      const response = await voiceAPI.sendVoiceCommand(audioBlob, language)
      const data = response.data

      if (data.success) {
        // Backend JSON qaytarır - confirmation data
          setConfirmationData({
          amount: data.expense_data?.amount || '',
          merchant: data.expense_data?.merchant || '',
          category: data.expense_data?.category || '',
          transcribed_text: data.transcribed_text || ''
          })
          setIsModalOpen(false)
          setShowConfirmation(true)
        } else {
          // Check if premium is required
          if (data.requires_premium) {
            openPremiumModal()
            toast.error('AI tokenlarınız bitib. Premium alın', { autoClose: 5000 })
          } else {
            setResult({ type: 'error', message: data.error || 'Xəta baş verdi' })
            setStatus('Xəta baş verdi')
            toast.error(data.error || 'Xəta baş verdi', { autoClose: 5000 })
          }
      }
    } catch (error) {
      console.error('Server xətası:', error)
      setResult({ type: 'error', message: 'Serverlə əlaqə kəsildi' })
      setStatus('Xəta baş verdi')
      toast.error('Serverlə əlaqə kəsildi', { autoClose: 5000 })
    } finally {
      setIsProcessing(false)
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }
      setMediaRecorder(null)
      setAudioChunks([])
    }
  }

  const closeModal = () => {
    if (isRecording && mediaRecorder) {
      mediaRecorder.stop()
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsModalOpen(false)
    setIsRecording(false)
    setIsProcessing(false)
    setStatus('Hazıram')
    setResult(null)
  }

  return (
    <>
      {/* Floating Voice Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-4 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 glass-card bg-gradient-to-br from-blue-500 to-cyan-500 backdrop-blur-xl border-2 border-white/30 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all z-40 md:bottom-20 md:right-8 group"
        style={{
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          borderColor: 'var(--glass-border)',
          boxShadow: '0 10px 30px var(--glass-shadow)'
        }}
        title="Səsli Əmr"
      >
        <Mic className="w-6 h-6 sm:w-7 sm:h-7 group-hover:scale-110 transition-transform" />
      </button>

      {/* Voice Confirmation Modal */}
      {showConfirmation && confirmationData && (
        <VoiceConfirmationModal
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false)
            setConfirmationData(null)
            setIsModalOpen(true)
          }}
          transcribedText={confirmationData.transcribed_text}
          expenseData={confirmationData}
          onConfirm={(data) => {
            setShowConfirmation(false)
            setConfirmationData(null)
            window.dispatchEvent(new CustomEvent('expenseUpdated'))
          }}
        />
      )}

      {/* Voice Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-sm transition-all"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              background: 'var(--glass-shadow)'
            }}
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div
            className="relative glass-card rounded-3xl p-4 sm:p-6 md:p-8 max-w-md w-full mx-auto shadow-2xl transform transition-all"
            style={{
              background: 'var(--glass-bg)',
              borderColor: 'var(--glass-border)',
              boxShadow: '0 25px 50px -12px var(--glass-shadow)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition z-10"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div
                className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mb-3 sm:mb-4 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                }}
              >
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Səsli Əmr</h2>
              <p className="text-xs sm:text-sm text-white/70">AI səsi dinləyir</p>
            </div>

            {/* Language Selector */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-white/80 mb-2">Dil seçin</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'var(--glass-border)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="az" className="bg-gray-900">🇦🇿 Azərbaycan</option>
                <option value="en" className="bg-gray-900">🇺🇸 English</option>
                <option value="ru" className="bg-gray-900">🇷🇺 Русский</option>
              </select>
            </div>

            {/* Status */}
            <p className="text-center text-sm sm:text-base text-white/90 mb-4 sm:mb-6 min-h-[24px]">{status}</p>

            {/* Record Button */}
            <div className="flex flex-col items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
              {!isProcessing && (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all ${
                    isRecording
                      ? 'bg-gradient-to-br from-red-500 to-red-600 animate-pulse'
                      : 'bg-gradient-to-br from-blue-500 to-cyan-500 hover:scale-110'
                  }`}
                  style={
                    !isRecording
                      ? {
                          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                          boxShadow: '0 10px 30px var(--glass-shadow)'
                        }
                      : {}
                  }
                >
                  <Mic className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                </button>
              )}

              {isProcessing && (
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-blue-500"></div>
              )}
            </div>

            {/* Result Display */}
            {result && (
              <div
                className={`mt-4 sm:mt-6 p-4 rounded-xl border ${
                  result.type === 'success'
                    ? 'bg-green-500/10 border-green-500/50'
                    : 'bg-red-500/10 border-red-500/50'
                }`}
              >
                {result.type === 'success' ? (
                  <div className="text-white">
                    <p className="font-bold mb-2">✅ Əlavə Edildi!</p>
                    {result.data.expense_data && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-white/70">Məbləğ:</span>
                          <p className="font-bold">{result.data.expense_data.amount} AZN</p>
                        </div>
                        <div>
                          <span className="text-white/70">Kateqoriya:</span>
                          <p className="font-bold">{result.data.expense_data.category}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-400">
                    <p className="font-bold">❌ {result.message}</p>
                    <button
                      onClick={startRecording}
                      className="mt-2 w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-medium transition"
                    >
                      Yenidən Cəhd Et
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Help Text */}
            <div
              className="bg-white/5 rounded-xl p-3 sm:p-4 mt-4 sm:mt-6 border border-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'var(--glass-border)'
              }}
            >
              <p className="text-xs sm:text-sm text-white/70">
                <strong className="text-white/90">Nümunələr:</strong>
                <br />
                🇦🇿 "Taksi üçün 10 manat xərcləmişəm"
                <br />
                🇺🇸 "Spent 15 AZN on lunch"
                <br />
                🇷🇺 "Потратил 20 манат на кофе"
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default VoiceCommandButton

