/**
 * Network Status Component
 * İnternet bağlantısını yoxlayır və offline/online status göstərir
 * Yalnız toast bildirişləri istifadə edir
 */

import React, { useEffect, useRef } from 'react'
import { toast } from '../../utils/toast'

const NetworkStatus = () => {
  const lastStatusRef = useRef(null) // null ilə başla ki ilk dəfə mütləq bildiriş göstərsin
  const checkIntervalRef = useRef(null)
  const toastIdRef = useRef(null)

  // Real network check - xarici server-ə request göndərir (real internet yoxlaması)
  const checkNetworkStatus = async () => {
    try {
      // Real internet yoxlaması - xarici server-ə request
      // Image yükləməyə cəhd et (CORS problemi olmayacaq)
      let isActuallyOnline = false
      
      // Bir neçə yoxlama et - ən azı biri uğurlu olsa, online say
      const checkPromises = [
        // Google favicon (kiçik və sürətli)
        new Promise((resolve) => {
          const img = new Image()
          const timeoutId = setTimeout(() => {
            img.onload = null
            img.onerror = null
            resolve(false)
          }, 2000)
          
          img.onload = () => {
            clearTimeout(timeoutId)
            resolve(true)
          }
          img.onerror = () => {
            clearTimeout(timeoutId)
            resolve(false)
          }
          img.src = 'https://www.google.com/favicon.ico?t=' + Date.now() // Cache bypass
        }),
        
        // Cloudflare favicon
        new Promise((resolve) => {
          const img = new Image()
          const timeoutId = setTimeout(() => {
            img.onload = null
            img.onerror = null
            resolve(false)
          }, 2000)
          
          img.onload = () => {
            clearTimeout(timeoutId)
            resolve(true)
          }
          img.onerror = () => {
            clearTimeout(timeoutId)
            resolve(false)
          }
          img.src = 'https://www.cloudflare.com/favicon.ico?t=' + Date.now()
        }),
      ]
      
      // Ən azı biri uğurlu olsa, online say
      const results = await Promise.allSettled(checkPromises)
      isActuallyOnline = results.some(result => result.status === 'fulfilled' && result.value === true)
      
      // Əgər xarici yoxlama işləmədisə, local API-yə də yoxla (WiFi bağlı ola bilər, amma internet yoxdur)
      if (!isActuallyOnline) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 2000)
          
          const response = await fetch('/api/dashboard-data', {
            method: 'GET',
            cache: 'no-cache',
            signal: controller.signal,
            credentials: 'include',
          })
          
          clearTimeout(timeoutId)
          // Local API işləyirsə, amma xarici internet yoxdursa, hələ də offline say
          // Çünki real internet yoxdur
          isActuallyOnline = false
        } catch (localError) {
          // Local API də işləmir - tam offline
          isActuallyOnline = false
        }
      }
      
      // Status dəyişibsə, bildiriş göstər
      if (lastStatusRef.current === null) {
        // İlk dəfə - status-u set et
        lastStatusRef.current = isActuallyOnline
        // İlk dəfə offline-dursa, bildiriş göstər
        if (!isActuallyOnline) {
          handleOffline()
        }
        // İlk dəfə online-dursa, bildiriş göstərmə (çünki hələ internet olmamışdır)
        return
      }
      
      // Status dəyişibsə, bildiriş göstər
      if (isActuallyOnline !== lastStatusRef.current) {
        lastStatusRef.current = isActuallyOnline
        
        if (isActuallyOnline) {
          // İnternet gəldi - yalnız əgər əvvəllər offline idisə bildiriş göstər
          handleOnline()
        } else {
          // İnternet getdi - bildiriş göstər
          handleOffline()
        }
      }
    } catch (error) {
      // Network error - offline (AbortError, NetworkError, və s.)
      // navigator.onLine false-dursa, dərhal bildiriş göstər
      if (!navigator.onLine) {
        // İnternet bağlandıqda dərhal bildiriş göstər
        if (lastStatusRef.current === null || lastStatusRef.current === true) {
          lastStatusRef.current = false
          handleOffline()
        }
      } else {
        // WiFi bağlı olsa belə, real internet yoxdursa
        if (lastStatusRef.current === null) {
          // İlk dəfə - status-u set et və offline bildirişi göstər
          lastStatusRef.current = false
          handleOffline()
          return
        }
        
        // Əgər əvvəllər online idisə, offline bildirişi göstər
        if (lastStatusRef.current === true) {
          lastStatusRef.current = false
          handleOffline()
        }
      }
    }
  }

  const handleOnline = () => {
    // Köhnə toast-u sil
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current)
    }
    
    // Yeni toast göstər - 5 saniyə sonra avtomatik yox olacaq
    toastIdRef.current = toast.success('✅ Qoşulun! İnternet bağlantısı mövcuddur.', {
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      position: 'top-right',
      closeButton: true, // X buttonu göstər
    })
  }

  const handleOffline = () => {
    // Köhnə toast-u sil
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current)
    }
    
    // Yeni toast göstər - 5 saniyə sonra avtomatik yox olacaq
    toastIdRef.current = toast.error('📡 İnternet bağlantısı kəsildi! Zəhmət olmasa interneti yoxlayın.', {
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      position: 'top-right',
      closeButton: true, // X buttonu göstər
    })
  }

  useEffect(() => {
    // Browser events
    const handleOnlineEvent = () => {
      // Browser online event - real check edək
      // İnternet bərpa olduqda bildiriş göstər
      setTimeout(() => {
        checkNetworkStatus()
      }, 500)
    }

    const handleOfflineEvent = () => {
      // İnternet bağlandıqda dərhal offline bildirişi göstər
      // navigator.onLine false-dursa, dərhal bildiriş göstər
      if (!navigator.onLine) {
        // İnternet bağlandıqda dərhal bildiriş göstər (qəsdən bağlasa da)
        // Təqdimat zamanı internet getsə, dərhal bildiriş göstər
        if (lastStatusRef.current === null || lastStatusRef.current === true) {
          lastStatusRef.current = false
          handleOffline()
        }
      } else {
        // WiFi bağlı olsa belə, real internet yoxdursa bildiriş göstərmə
        // Real network check gözlə
        setTimeout(() => {
          checkNetworkStatus()
        }, 500)
      }
    }

    window.addEventListener('online', handleOnlineEvent)
    window.addEventListener('offline', handleOfflineEvent)

    // Real network check - təqdimat zamanı internet status-u yoxla
    checkNetworkStatus()

    // Periodic check - hər 3 saniyədə bir (daha tez aşkarlamaq üçün)
    checkIntervalRef.current = setInterval(() => {
      checkNetworkStatus()
    }, 3000)

    return () => {
      window.removeEventListener('online', handleOnlineEvent)
      window.removeEventListener('offline', handleOfflineEvent)
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
      // Cleanup toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current)
      }
    }
  }, [])

  // Bu komponent heç bir UI render etmir, yalnız toast göstərir
  return null
}

export default NetworkStatus

