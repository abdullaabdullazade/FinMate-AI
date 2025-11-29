/**
 * Delete Receipt Confirmation Modal
 * Resepti silmək üçün təsdiq modalı
 */

import React from 'react'
import { X } from 'lucide-react'

const DeleteReceiptModal = ({ isOpen, onClose, onConfirm, receiptInfo }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        background: 'var(--glass-shadow)'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card p-4 sm:p-6 md:p-8 max-w-md w-full rounded-3xl relative transform transition-transform duration-300 mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'var(--glass-bg)',
          borderColor: 'var(--glass-border)',
          boxShadow: '0 25px 50px -12px var(--glass-shadow)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <span className="text-6xl">🗑️</span>
          <h2 className="text-2xl font-bold text-white mt-4">Qəbzi Sil?</h2>
          <p className="text-white/60 mt-2">
            {receiptInfo && (
              <span className="block font-semibold text-white/80 mb-1">
                {receiptInfo.merchant} - {parseFloat(receiptInfo.total || 0).toFixed(2)} AZN
              </span>
            )}
            Bu qəbz silinəcək. Bunu geri qaytarmaq mümkün olmayacaq.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'var(--glass-border)'
            }}
          >
            Xeyr, Saxla
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-3 rounded-xl font-bold shadow-lg transition"
            style={{
              background: 'linear-gradient(135deg, rgb(239, 68, 68) 0%, rgb(236, 72, 153) 100%)'
            }}
          >
            Bəli, Sil
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteReceiptModal

