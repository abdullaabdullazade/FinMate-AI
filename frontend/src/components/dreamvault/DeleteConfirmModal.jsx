/**
 * Delete Confirmation Modal Component
 * HTML/CSS-dən bir-bir köçürülmüş versiya - theme-ə uyğun
 */

import React from 'react'

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, dreamTitle }) => {
  if (!isOpen) return null

  return (
    <div 
      className={`fixed inset-0 z-[60] backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center p-4 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}
      style={{ backgroundColor: 'var(--glass-shadow)' }}
      onClick={onClose}
    >
      <div 
        className="glass-card p-6 sm:p-8 max-w-md w-full rounded-3xl relative transform transition-transform duration-300"
        style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <span className="text-6xl">🗑️</span>
          <h2 className="text-2xl font-bold text-white mt-4">Arzunu Sil?</h2>
          <p className="text-white/60 mt-2">
            {dreamTitle && (
              <span className="block font-semibold text-white/80 mb-1">"{dreamTitle}"</span>
            )}
            Bu arzu silinəcək. Bunu geri qaytarmaq mümkün olmayacaq.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition"
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

export default DeleteConfirmModal

