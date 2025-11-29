/**
 * Scan Page Component
 * Receipt scanner - Səliqəli strukturlaşdırılmış
 * Mobile responsive və clean code
 */

import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'

// Components
import ScanningModal from '../components/scan/ScanningModal'
import ScanHeader from '../components/scan/ScanHeader'
import UploadButtons from '../components/scan/UploadButtons'
import ScanInstructions from '../components/scan/ScanInstructions'
import ScanResult from '../components/scan/ScanResult'
import ScanError from '../components/scan/ScanError'
import VoiceCommandButton from '../components/scan/VoiceCommandButton'

const Scan = () => {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [showInitialState, setShowInitialState] = useState(true)
  const [error, setError] = useState(null)

  /**
   * Bakı vaxtını ISO formatında qaytaran funksiya
   */
  const getAzTime = () => {
    try {
      const now = new Date()
      const utc = now.getTime() + now.getTimezoneOffset() * 60000
      return new Date(utc + 4 * 3600000).toISOString()
    } catch (e) {
      console.error('getAzTime error:', e)
      return new Date().toISOString()
    }
  }

  /**
   * Upload file function
   */
  const uploadFile = async (inputElement) => {
    if (!inputElement || !inputElement.files || !inputElement.files[0]) return

    const file = inputElement.files[0]
    setScanning(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/api/scan-receipt', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Client-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
          'X-Client-Date': getAzTime(),
          'Accept': 'application/json',
          'X-Client-Appended': 'true',
        },
        credentials: 'include',
      })

      // Check if response is JSON
      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        const text = await response.text()
        console.error('Expected JSON but got HTML:', text.substring(0, 200))
        setError({
          error: 'Server HTML cavab qaytardı. Zəhmət olmasa backend-i yoxlayın.',
          is_not_receipt: false,
        })
        setShowInitialState(false)
        return
      }

      if (!response.ok) {
        let errorMessage = `Server xətası: ${response.status}`
        try {
          const errorData = await response.json()
          if (errorData.error || errorData.message) {
            errorMessage = errorData.error || errorData.message
          }
        } catch {
          // If not JSON, just use status
        }

        console.error('SERVER ERROR:', response.status, errorMessage)
        setError({
          error: errorMessage,
          is_not_receipt: false,
        })
        setShowInitialState(false)
        return
      }

      // Parse JSON response
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error('JSON Parse Error:', jsonError)
        const text = await response.text()
        console.error('Response was (first 500 chars):', text.substring(0, 500))
        setError({
          error: 'Server cavabını parse etmək mümkün olmadı. Zəhmət olmasa yenidən cəhd edin.',
          is_not_receipt: false,
        })
        setShowInitialState(false)
        return
      }

      if (data.success) {
        setScanResult({
          receipt_data: data.receipt_data,
          conversion_note: data.conversion_note,
          xp_result: data.xp_result,
          coins: data.coins,
          milestone_reached: data.milestone_reached,
          daily_limit_alert: data.daily_limit_alert,
          expense_id: data.expense_id || data.receipt_data?.expense_id || null
        })
        setShowInitialState(false)

        // Dispatch event for dashboard refresh
        window.dispatchEvent(new CustomEvent('scanCompleted'))
        window.dispatchEvent(new CustomEvent('expenseUpdated'))

        // Voice notification
        if (typeof window.queueVoiceNotification === 'function') {
          const total = parseFloat(data.receipt_data.total) || 0
          const itemCount = data.receipt_data.items?.length || 0

          let amountText = total.toFixed(2) + ' manat'
          if (typeof window.numberToAzerbaijani === 'function') {
            amountText = window.numberToAzerbaijani(total)
          }

          const message = `Qəbz oxundu! ${itemCount} məhsul tapıldı. Ümumi ${amountText}`
          window.queueVoiceNotification(message, 0, 'az')
        }

        // Show XP and Coin rewards
        if (data.xp_result?.xp_awarded) {
          setTimeout(() => {
            toast.success(`+${data.xp_result.xp_awarded} XP qazandınız!`, {
              position: 'top-right',
              autoClose: 3000,
              className: 'xp-toast-success',
            })
          }, 500)
        }
        if (data.coins !== undefined) {
          setTimeout(() => {
            toast.success(`+1 🪙 Coin qazandınız! Toplam: ${data.coins} coin`, {
              position: 'top-right',
              autoClose: 3000,
              className: 'coin-toast-success',
            })
          }, 800)
        }

        // Milestone celebration
        if (data.milestone_reached) {
          setTimeout(() => {
            toast.success(
              `${data.milestone_reached.name} mükafatı qazandınız! ${data.milestone_reached.reward}`,
              {
                position: 'top-center',
                autoClose: 5000,
                hideProgressBar: false,
                className: 'milestone-toast',
              }
            )
            if (typeof window.queueVoiceNotification === 'function') {
              const message = `${data.milestone_reached.name} mükafatı qazandınız! ${data.milestone_reached.reward}`
              window.queueVoiceNotification(message, 0, 'az')
            }
          }, 1500)
        }

        // Daily limit alert
        if (data.daily_limit_alert) {
          setTimeout(() => {
            toast.warning(data.daily_limit_alert.message, {
              position: 'top-center',
              autoClose: 6000,
              hideProgressBar: false,
            })
            if (typeof window.speakNotification === 'function') {
              window.speakNotification(data.daily_limit_alert.message, 'warning')
            }
          }, 1500)
        }
      } else {
        setError(data.receipt_data || { error: 'Naməlum xəta' })
        setShowInitialState(false)
        toast.error(data.receipt_data?.error || 'Qəbzi oxumaq alınmadı', {
          position: 'top-right',
          autoClose: 4000,
        })
      }
    } catch (error) {
      console.error('Upload Error:', error)
      toast.error('Xəta: İnternet bağlantısı və ya server çalışmır', {
        position: 'top-right',
        autoClose: 4000,
      })
      setError({
        error: 'İnternet bağlantısı və ya server çalışmır',
        is_not_receipt: false,
      })
      setShowInitialState(false)
    } finally {
      if (inputElement) inputElement.value = ''
      setScanning(false)
    }
  }

  /**
   * Reset function
   */
  const resetScan = () => {
    if (sessionStorage.getItem('reloadAfterReceipt') === 'true') {
      sessionStorage.removeItem('reloadAfterReceipt')
      window.location.reload()
      return
    }

    setScanResult(null)
    setError(null)
    setShowInitialState(true)
  }

  /**
   * Go to dashboard
   */
  const goToDashboard = () => {
    if (window.location.pathname === '/scan' || window.location.pathname.includes('scan')) {
      sessionStorage.setItem('reloadAfterReceipt', 'true')
      navigate('/')
    }
  }

  return (
    <div className="max-w-2xl mx-auto pt-2 relative z-10">
      {/* Scanning Modal */}
      {scanning && <ScanningModal />}

      {/* Initial State */}
      {showInitialState && (
        <div id="initial-state">
          <ScanHeader />
          <UploadButtons onFileSelect={uploadFile} />
          <ScanInstructions />
        </div>
      )}

      {/* Success Result */}
      {scanResult && !showInitialState && (
        <ScanResult 
          scanResult={scanResult} 
          onReset={resetScan} 
          onGoToDashboard={goToDashboard}
          expenseId={scanResult.expense_id}
        />
      )}

      {/* Error Result */}
      {error && !showInitialState && <ScanError error={error} onReset={resetScan} />}

      {/* Voice Command Button */}
      <VoiceCommandButton />
    </div>
  )
}

export default Scan
