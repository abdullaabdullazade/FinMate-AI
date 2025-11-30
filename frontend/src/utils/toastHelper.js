/**
 * Toast Helper Utility
 * Toast mesajlarının düzgün bağlanmasını təmin edir
 */

export const setupToastAutoClose = () => {
  // Progress bar bitdikdə toast-u avtomatik bağla
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const progressBar = mutation.target
        if (progressBar.classList.contains('Toastify__progress-bar')) {
          const width = progressBar.style.width
          if (width === '0%' || width === '0px' || !width) {
            const toast = progressBar.closest('.Toastify__toast')
            if (toast && !toast.classList.contains('toast-completed')) {
              toast.classList.add('toast-completed')
              // Force remove after animation
              setTimeout(() => {
                if (toast.parentNode) {
                  toast.style.display = 'none'
                  toast.remove()
                }
              }, 400)
            }
          }
        }
      }
    })
  })

  // Observe all progress bars
  const observeProgressBars = () => {
    document.querySelectorAll('.Toastify__progress-bar').forEach((bar) => {
      observer.observe(bar, {
        attributes: true,
        attributeFilter: ['style'],
      })
    })
  }

  // Initial observation
  observeProgressBars()

  // Observe new toasts being added
  const containerObserver = new MutationObserver(() => {
    observeProgressBars()
  })

  const container = document.querySelector('.Toastify__toast-container')
  if (container) {
    containerObserver.observe(container, {
      childList: true,
      subtree: true,
    })
  }

  // Cleanup function
  return () => {
    observer.disconnect()
    containerObserver.disconnect()
  }
}

