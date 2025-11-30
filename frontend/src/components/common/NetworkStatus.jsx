/**
 * Network Status Component 
 */

import React, { useEffect, useRef } from 'react'
import { toast } from '../../utils/toast' 

const NetworkStatus = () => {
  const isOnlineRef = useRef(navigator.onLine)

  const showOnlineToast = () => {
    toast.dismiss() // Köhnə toastları sil
    toast.success('✅ İnternet bağlantısı bərpa olundu!', {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  }

  const showOfflineToast = () => {
    toast.dismiss() // Köhnə toastları sil
    toast.error('📡 İnternet bağlantısı kəsildi!', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    })
  }

  // Real interneti yoxlamaq üçün kiçik funksiya (sadəcə 'online' olanda əmin olmaq üçün)
  const checkRealConnection = async () => {
    try {
      // Google-a kiçik bir sorğu göndəririk (cache-siz)
      await fetch('https://www.google.com/favicon.ico?' + new Date().getTime(), {
        mode: 'no-cors', 
      })
      return true
    } catch (e) {
      return false
    }
  }

  useEffect(() => {
    // 1. İnternet gələndə (WiFi qoşulanda)
    const handleOnline = async () => {
      // Brauzer "online" deyən kimi dərhal yoxla
      const hasInternet = await checkRealConnection()
      
      if (hasInternet && !isOnlineRef.current) {
        isOnlineRef.current = true
        showOnlineToast()
      }
    }

    // 2. İnternet gedəndə (WiFi sönəndə) - BU ANİ İŞLƏYİR
    const handleOffline = () => {
      // WiFi sönən kimi bura düşür
      if (isOnlineRef.current) {
        isOnlineRef.current = false
        showOfflineToast()
      }
    }

    // Hadisələri dinlə
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // İlk açılışda yoxlama
    if (!navigator.onLine) {
        isOnlineRef.current = false
        showOfflineToast()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return null
}

export default NetworkStatus