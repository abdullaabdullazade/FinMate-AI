/**
 * Readability Mode Utility
 * Orijinal readability.js-dən köçürülmüşdür
 */

export const toggleReadabilityMode = (enabled) => {
  console.log('👁️ Readability mode:', enabled)
  if (enabled) {
    document.body.classList.add('readability-mode')
    localStorage.setItem('readability-mode', 'enabled')
  } else {
    document.body.classList.remove('readability-mode')
    localStorage.setItem('readability-mode', 'disabled')
  }
}

// Global funksiya kimi də export et (window-a əlavə et)
if (typeof window !== 'undefined') {
  window.toggleReadabilityMode = toggleReadabilityMode
}

// Initialize on load
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const isReadabilityEnabled = localStorage.getItem('readability-mode') === 'enabled'
  if (isReadabilityEnabled) {
    toggleReadabilityMode(true)
  }
}

