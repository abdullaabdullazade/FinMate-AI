/**
 * Financial Pet Component
 * Emotional pet widget - spending-ə görə dəyişir
 * framer-motion ilə animasiyalar
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FinancialPet = ({ budgetPercentage, delay = 0 }) => {
  const [petState, setPetState] = useState('happy')
  const [message, setMessage] = useState('')
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    let newState = 'happy'
    let newMessage = ''
    let particles = false

    if (budgetPercentage < 50) {
      newState = 'veryHappy'
      newMessage = 'Əla! Çox yaxşı qənaət edirsən! ❤️'
      particles = true
    } else if (budgetPercentage < 80) {
      newState = 'happy'
      newMessage = 'Yaxşı gedir! Davam et! 👍'
    } else if (budgetPercentage < 100) {
      newState = 'neutral'
      newMessage = 'Diqqətli ol, limit yaxınlaşır...'
    } else if (budgetPercentage < 120) {
      newState = 'sad'
      newMessage = 'Çox xərcləyirsən... Kədərlənirəm 😢'
    } else {
      newState = 'crying'
      newMessage = 'Zəhmət olmasa qənaət et! 💔'
    }

    setPetState(newState)
    setMessage(newMessage)
    setShowParticles(particles)
  }, [budgetPercentage])

  const getEmoji = () => {
    switch (petState) {
      case 'veryHappy':
        return '😊'
      case 'happy':
        return '🐶'
      case 'neutral':
        return '😐'
      case 'sad':
        return '😢'
      case 'crying':
        return '😭'
      default:
        return '😊'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.98, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="fixed pet-container pointer-events-auto"
      style={{ zIndex: 120, bottom: '110px', right: '20px' }}
    >
      <div className="glass-card p-4 rounded-2xl shadow-2xl max-w-[220px] border border-white/15 bg-white/10">
        {/* Pet Character */}
        <div className="text-center mb-2">
          <motion.div
            id="petEmoji"
            className="text-6xl pet-bounce"
            animate={{
              y: [0, -8, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {getEmoji()}
          </motion.div>
        </div>

        {/* Speech Bubble */}
        <motion.div
          className="speech-bubble relative bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          <p id="petMessage" className="text-xs text-white font-medium text-center leading-tight">
            {message}
          </p>
        </motion.div>

        {/* Particles */}
        <AnimatePresence>
          {showParticles && (
            <div id="petParticles" className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="floating-heart"
                  initial={{ opacity: 1, y: 0, scale: 0.5 }}
                  animate={{ opacity: 0, y: -100, scale: 1.2 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    ease: 'easeOut',
                  }}
                  style={{
                    position: 'absolute',
                    left: `${20 + Math.random() * 60}%`,
                    top: '40%',
                    fontSize: '24px',
                  }}
                >
                  ❤️
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default FinancialPet

