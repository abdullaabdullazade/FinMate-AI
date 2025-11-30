/**
 * Toast Utility
 * Köhnə react-toastify çağırışlarını yeni sistemə uyğunlaşdırır
 */

let toastProvider = null

export const setToastProvider = (provider) => {
  toastProvider = provider
}

export const toast = {
  success: (message, options = {}) => {
    if (toastProvider) {
      return toastProvider.showToast(message, 'success', options.autoClose || 5000)
    } else if (window.showCustomToast) {
      return window.showCustomToast(message, 'success', options.autoClose || 5000)
    }
    console.warn('Toast provider not initialized')
  },
  error: (message, options = {}) => {
    if (toastProvider) {
      return toastProvider.showToast(message, 'error', options.autoClose || 5000)
    } else if (window.showCustomToast) {
      return window.showCustomToast(message, 'error', options.autoClose || 5000)
    }
    console.warn('Toast provider not initialized')
  },
  warning: (message, options = {}) => {
    if (toastProvider) {
      return toastProvider.showToast(message, 'warning', options.autoClose || 5000)
    } else if (window.showCustomToast) {
      return window.showCustomToast(message, 'warning', options.autoClose || 5000)
    }
    console.warn('Toast provider not initialized')
  },
  info: (message, options = {}) => {
    if (toastProvider) {
      return toastProvider.showToast(message, 'info', options.autoClose || 5000)
    } else if (window.showCustomToast) {
      return window.showCustomToast(message, 'info', options.autoClose || 5000)
    }
    console.warn('Toast provider not initialized')
  },
  dismiss: (toastId) => {
    // Dismiss functionality if needed
  },
}

