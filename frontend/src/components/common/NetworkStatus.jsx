/**
 * Network Status Component
 * İnternet bağlantısını yoxlayır və offline/online status göstərir
 */

import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { WifiOff, Wifi } from 'lucide-react'

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineToast, setShowOfflineToast] = useState(false)
  const offlineToastIdRef = useRef(null)
  const onlineTimeoutIdRef = useRef(null)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      
      // Offline toast-u mütləq bağla
      toast.dismiss('offline-toast')
      if (offlineToastIdRef.current) {
        toast.dismiss(offlineToastIdRef.current)
        offlineToastIdRef.current = null
      }
      
      // Əvvəlki online toast-u və timeout-u bağla (əgər varsa)
      toast.dismiss('online-toast')
      if (onlineTimeoutIdRef.current) {
        clearTimeout(onlineTimeoutIdRef.current)
        onlineTimeoutIdRef.current = null
      }
      
      setShowOfflineToast(false)
      
      // Online mesajını göstər - 5 saniyə sonra avtomatik bağlanacaq
      toast.success('İnternet bağlantısı bərpa olundu', {
        position: 'top-center',
        autoClose: 5000, // 5 saniyə
        toastId: 'online-toast',
        closeOnClick: true,
        pauseOnHover: false,
        hideProgressBar: false,
      })
      
      // 5 saniyə sonra toast-u mütləq bağla (əlavə təhlükəsizlik)
      onlineTimeoutIdRef.current = setTimeout(() => {
        toast.dismiss('online-toast')
        onlineTimeoutIdRef.current = null
      }, 5000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineToast(true)
      
      // Online toast-u bağla
      toast.dismiss('online-toast')
      
      // Offline mesajını göstər
      const offlineToastId = toast.error('İnternet bağlantısı yoxdur', {
        position: 'top-center',
        autoClose: 5000,
        toastId: 'offline-toast',
      })
      
      offlineToastIdRef.current = offlineToastId
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    if (!navigator.onLine) {
      handleOffline()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (onlineTimeoutIdRef.current) {
        clearTimeout(onlineTimeoutIdRef.current)
        onlineTimeoutIdRef.current = null
      }
    }
  }, [])

  // Visual indicator (optional - can be hidden if not needed)
  if (isOnline) return null

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 glass-card p-3 rounded-xl flex items-center gap-2 animate-pulse">
      <WifiOff className="w-5 h-5 text-red-400" />
      <span className="text-white text-sm font-medium">Offline</span>
    </div>
  )
}

export default NetworkStatus

