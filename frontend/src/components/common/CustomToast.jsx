/**
 * Custom Toast Component
 * React-toastify əvəzinə öz toast sistemimiz
 * MÜTLƏQ 5 saniyədən sonra bağlanır
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const toastContext = React.createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'success', duration = 5000) => {
    const id = Date.now() + Math.random()
    const newToast = { id, message, type, duration }
    
    setToasts((prev) => [...prev, newToast])

    // MÜTLƏQ bağlanır - heç bir şey dayandıra bilməz
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, duration)

    return { id, timer }
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <toastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </toastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(toastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null
  
  return (
    <div className="fixed top-16 sm:top-20 right-2 sm:right-4 z-[10000] flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-1rem)] sm:max-w-sm w-full sm:w-auto">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

const ToastItem = ({ toast, onClose }) => {
  const progressRef = useRef(null)
  const [progress, setProgress] = useState(100)
  const timerRef = useRef(null)

  useEffect(() => {
    // Progress bar animasiyası
    const startTime = Date.now()
    const duration = toast.duration || 5000

    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)

      if (remaining > 0) {
        timerRef.current = requestAnimationFrame(updateProgress)
      } else {
        // MÜTLƏQ bağlanır
        onClose()
      }
    }

    timerRef.current = requestAnimationFrame(updateProgress)

    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current)
      }
    }
  }, [toast.duration, onClose])

  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-400" />,
          bg: 'bg-green-500/20 border-green-500/50',
          progress: 'bg-green-500',
          text: 'text-green-100',
        }
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-400" />,
          bg: 'bg-red-500/20 border-red-500/50',
          progress: 'bg-red-500',
          text: 'text-red-100',
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
          bg: 'bg-yellow-500/20 border-yellow-500/50',
          progress: 'bg-yellow-500',
          text: 'text-yellow-100',
        }
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-400" />,
          bg: 'bg-blue-500/20 border-blue-500/50',
          progress: 'bg-blue-500',
          text: 'text-blue-100',
        }
    }
  }

  const config = getToastConfig()

  return (
    <motion.div
      initial={{ opacity: 0, x: 400, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 400, scale: 0.8 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`pointer-events-auto ${config.bg} backdrop-blur-xl border-2 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden w-full sm:min-w-[280px] sm:max-w-[320px]`}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
          <div className="flex-1 min-w-0">
            <p className={`${config.text} text-sm sm:text-base font-medium break-words`}>
              {toast.message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Bağla"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>
      
      {/* Progress Bar - MÜTLƏQ bağlanır */}
      <div className="h-1 bg-white/10">
        <motion.div
          ref={progressRef}
          className={`h-full ${config.progress}`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>
    </motion.div>
  )
}

// Global function for backward compatibility
if (typeof window !== 'undefined') {
  let globalToastProvider = null
  window.setToastProvider = (provider) => {
    globalToastProvider = provider
    // Also set for toast utility
    if (window.setToastProviderUtil) {
      window.setToastProviderUtil(provider)
    }
  }
  
  window.showCustomToast = (message, type = 'success', duration = 5000) => {
    if (globalToastProvider) {
      return globalToastProvider.showToast(message, type, duration)
    }
  }
}

