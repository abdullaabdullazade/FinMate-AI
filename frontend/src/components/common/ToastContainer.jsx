/**
 * Toast Container Component
 * Bütün toast-ları göstərir
 */

import React from 'react'
import Toast from './Toast'

const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null

  return (
    <div
      id="toast-container"
      className="fixed top-24 right-4 sm:right-6 z-[100] flex flex-col gap-2 pointer-events-none transition-all duration-300"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

export default ToastContainer

