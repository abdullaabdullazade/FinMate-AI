/**
 * Toast Component
 * base.js-dəki toast sistemini React komponentinə çevirdik
 * Swipe to dismiss, drag to dismiss funksiyaları daxildir
 */

import React, { useState, useEffect, useRef } from 'react'
import { CloseIcon } from '../icons/Icons'

const Toast = ({ id, message, type, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const toastRef = useRef(null)
  const startXRef = useRef(0)

  // Type styles
  const typeStyles = {
    success: 'bg-green-500/90 border-green-400/50 shadow-green-500/20',
    error: 'bg-red-500/90 border-red-400/50 shadow-red-500/20',
    info: 'bg-blue-500/90 border-blue-400/50 shadow-blue-500/20',
  }

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  }

  /**
   * Toast sil
   */
  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => {
      onRemove(id)
    }, 500)
  }

  /**
   * Touch start
   */
  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX
    setIsDragging(true)
  }

  /**
   * Touch move
   */
  const handleTouchMove = (e) => {
    if (!isDragging) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startXRef.current

    if (diff > 0) {
      setDragOffset(Math.min(diff, 300))
    }
  }

  /**
   * Touch end
   */
  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    if (dragOffset > 50) {
      handleRemove()
    } else {
      setDragOffset(0)
    }
  }

  /**
   * Mouse drag
   */
  const handleMouseDown = (e) => {
    if (e.target.closest('.toast-close-btn')) return
    startXRef.current = e.clientX
    setIsDragging(true)
    e.preventDefault()
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const diff = e.clientX - startXRef.current
    if (diff > 0) {
      setDragOffset(Math.min(diff, 300))
    }
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)

    if (dragOffset > 50) {
      handleRemove()
    } else {
      setDragOffset(0)
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  const opacity = isRemoving ? 0 : Math.max(0, 1 - dragOffset / 200)
  const transform = isRemoving ? 'translateX(100%)' : `translateX(${dragOffset}px)`

  return (
    <div
      ref={toastRef}
      className={`pointer-events-auto backdrop-blur-md text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg border flex items-center gap-3 transform transition-all duration-500 select-none touch-pan-y ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } ${typeStyles[type] || typeStyles.info}`}
      style={{
        transform,
        opacity,
        transition: isDragging ? 'none' : 'all 0.5s ease',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <span className="text-xl flex-shrink-0">{icons[type] || icons.info}</span>
      <span className="font-medium text-sm sm:text-base flex-1">{message}</span>
      <button
        className="toast-close-btn p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0 cursor-pointer z-10"
        aria-label="Close"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleRemove()
        }}
        type="button"
      >
        <CloseIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

export default Toast

