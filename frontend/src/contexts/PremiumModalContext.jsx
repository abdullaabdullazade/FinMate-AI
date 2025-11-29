/**
 * Premium Modal Context
 * Global premium modal state idarəetməsi
 */

import React, { createContext, useContext, useState } from 'react'
import PremiumModal from '../components/common/PremiumModal'

const PremiumModalContext = createContext(null)

export const usePremiumModal = () => {
  const context = useContext(PremiumModalContext)
  if (!context) {
    throw new Error('usePremiumModal must be used within PremiumModalProvider')
  }
  return context
}

export const PremiumModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openModal = () => {
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  // Global function for backward compatibility
  if (typeof window !== 'undefined') {
    window.openPremiumModal = openModal
    window.closePremiumModal = closeModal
  }

  const value = {
    isOpen,
    openModal,
    closeModal,
  }

  return (
    <PremiumModalContext.Provider value={value}>
      {children}
      <PremiumModal isOpen={isOpen} onClose={closeModal} />
    </PremiumModalContext.Provider>
  )
}

