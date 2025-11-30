/**
 * Onboarding Tour Component
 * Yeni istifadəçilər üçün interaktiv təqdimat
 * Animasiyalı danışan AI robot ilə
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Sparkles, Bot, Volume2 } from 'lucide-react'

const OnboardingTour = ({ isOpen, onClose, onComplete, username }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [mouthOpen, setMouthOpen] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setCurrentStep(0)
      // Body scroll-u blokla
      document.body.style.overflow = 'hidden'
    } else {
      // Body scroll-u aktivləşdir
      document.body.style.overflow = ''
    }
    
    return () => {
      // Cleanup - body scroll-u aktivləşdir
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Danışan animasiyası
  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setMouthOpen(prev => !prev)
      }, 200) // Ağız açılıb-bağlanma sürəti
      return () => clearInterval(interval)
    } else {
      setMouthOpen(false)
    }
  }, [isSpeaking])

  // TTS funksiyası - Premium yoxlaması ilə (onboarding tour üçün pulsuz)
  const speakText = async (text) => {
    // Onboarding tour üçün səsləndirmə pulsuzdur
    if (typeof window.queueVoiceNotification === 'function') {
      setIsSpeaking(true)
      try {
        await window.queueVoiceNotification(text, 1, 'az')
        // Səs bitdikdən sonra animasiyanı dayandır
        setTimeout(() => {
          setIsSpeaking(false)
        }, text.length * 50) // Təxmini müddət
      } catch (error) {
        console.error('TTS error:', error)
        setIsSpeaking(false)
      }
    }
  }

  const steps = [
    {
      title: 'Xoş gəldiniz!',
      description: 'Salam! Mən FinMate AI-əm - sizin şəxsi maliyyə köməkçiniz. Bu qısa təqdimatda sizə əsas funksiyaları göstərəcəyəm. Gəlin birlikdə kəşf edək!',
      position: 'center',
      highlight: null,
      emoji: '🤖',
    },
    {
      title: 'Xərc Analizi',
      description: 'Burada bütün xərclərinizi kateqoriyalar üzrə görə bilərsiniz. Dairəvi cədvəl və detallı statistikalar sizə maliyyə vəziyyətinizi anlamağa kömək edir. Mən hər zaman burada olacağam ki, sizə kömək edim!',
      position: 'top',
      highlight: 'analysis-zone',
      emoji: '📊',
    },
    {
      title: 'Son Əməliyyatlar',
      description: 'Bu bölmədə ən son xərclərinizi görə bilərsiniz. Hər bir əməliyyatı redaktə edə və ya silə bilərsiniz. Mən sizin bütün əməliyyatlarınızı izləyirəm və lazım olduqda məsləhət verirəm.',
      position: 'right',
      highlight: 'transactions-zone',
      emoji: '💳',
    },
    {
      title: 'Büdcə Nəzarəti',
      description: 'Aylıq büdcənizi burada izləyə bilərsiniz. Limitə yaxınlaşdıqda sizə xəbərdarlıq göstərəcəyəm. Mən sizin maliyyə sağlamlığınız üçün buradayam!',
      position: 'top',
      highlight: 'budget-zone',
      emoji: '📈',
    },
    {
      title: 'Çek Skanla',
      description: 'Çeklərinizi skan edərək avtomatik xərc əlavə edin. Mən AI kimi məhsulları tanıyıram və kateqoriyalara bölürəm. Hər skan üçün coin qazanırsınız!',
      position: 'bottom',
      highlight: 'scan-button',
      emoji: '📸',
    },
    {
      title: 'Hədəflər',
      description: 'Dream Vault-da maliyyə hədəflərinizi qeyd edin və qənaət planı yaradın. Mən hər addımda sizə kömək edəcəyəm və motivasiya verəcəyəm!',
      position: 'center',
      highlight: null,
      emoji: '🎯',
    },
    {
      title: 'Hazırsınız!',
      description: 'Əla! Artıq hər şeyi bilirsiniz! İndi maliyyə hədəflərinizə çatmağa başlaya bilərsiniz. Mən həmişə yanınızda olacağam. Uğurlar! 🚀',
      position: 'center',
      highlight: null,
      emoji: '✨',
    },
  ]

  // Step dəyişdikdə səsləndirmə - DEACTIVATED (istifadəçi istəyi ilə)
  // useEffect(() => {
  //   if (isVisible && currentStep < steps.length) {
  //     const step = steps[currentStep]
  //     const fullText = `${step.title}. ${step.description}`
  //     speakText(fullText)
  //   }
  // }, [currentStep, isVisible])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    setIsSpeaking(false) // Stop speaking animation
    setTimeout(() => {
      // İstifadəçi adı ilə onboarding completed key yarat və qeyd et
      if (username) {
        const onboardingKey = `onboarding_completed_${username}`
        localStorage.setItem(onboardingKey, 'true')
      }
      
      onComplete?.()
      onClose?.()
      // Onboarding tour bitdikdən sonra event göndər ki, notification-lar görünsün
      window.dispatchEvent(new CustomEvent('onboardingCompleted'))
    }, 300)
  }

  const handleSkip = () => {
    // Skip zamanı da qeyd et ki, bir daha göstərilməsin
    setIsVisible(false)
    setIsSpeaking(false)
    // Body scroll-u aktivləşdir
    document.body.style.overflow = ''
    setTimeout(() => {
      // İstifadəçi adı ilə onboarding completed key yarat və qeyd et
      if (username) {
        const onboardingKey = `onboarding_completed_${username}`
        localStorage.setItem(onboardingKey, 'true')
      }
      
      onComplete?.()
      onClose?.()
    }, 300)
  }

  if (!isVisible) return null

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay - Tam ekranı örtür */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              position: 'fixed',
              overflow: 'hidden'
            }}
            onClick={handleSkip}
          />

          {/* Tour Card - Fixed Position (bir yerə dayanır) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-[9999] w-full max-w-md mx-4"
            style={{
              // Həmişə mərkəzdə olsun - bir yerə dayansın
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-card p-6 relative overflow-hidden">
              {/* Animated Background - Dashboard rəngləri ilə */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#5a5fb8]/20 via-[#6b5a8f]/20 to-[#7c6ba6]/20 animate-pulse"></div>
              
              <div className="relative z-10">
                {/* AI Robot Avatar - Danışan animasiya ilə */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Robot Avatar */}
                  <div className="flex-shrink-0 relative">
                    <motion.div
                      animate={{
                        scale: 1, // Səsləndirmə deaktiv olduğu üçün animasiya yoxdur
                        rotate: 0,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: 0,
                        ease: 'easeInOut',
                      }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#ec4899]/30 via-[#d81b60]/30 to-[#ec4899]/30 border border-white/20 flex items-center justify-center relative overflow-hidden"
                    >
                      {/* Robot Face */}
                      <div className="relative z-10">
                        {/* Eyes - Static (səsləndirmə deaktiv) */}
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-white rounded-full" />
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        {/* Mouth - Static (səsləndirmə deaktiv) */}
                        <div className="mx-auto bg-white rounded-full" style={{ height: '2px', width: '8px', borderRadius: '2px' }} />
                      </div>
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#ec4899]/40 to-[#d81b60]/40 blur-xl"></div>
                    </motion.div>
                    {/* Speaking Indicator - DEACTIVATED */}
                    {false && isSpeaking && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-full h-full bg-green-400 rounded-full"
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl flex-shrink-0" style={{ lineHeight: '1', display: 'inline-block' }}>{currentStepData.emoji}</span>
                        <span>{currentStepData.title}</span>
                      </h3>
                      <button
                        onClick={handleSkip}
                        className="text-white/70 hover:text-white transition-colors p-1 flex-shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-white/70 mb-1">
                      Addım {currentStep + 1} / {steps.length}
                    </p>
                  </div>
                </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-[#ec4899] to-[#d81b60] rounded-full"
                  />
                </div>
              </div>

                {/* Speech Bubble - AI danışır */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative mb-6"
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl rounded-tl-none p-4 border border-white/20 shadow-lg">
                    <p className="text-white/95 leading-relaxed text-sm sm:text-base">
                      {currentStepData.description}
                    </p>
                    {/* Speech bubble tail */}
                    <div className="absolute -left-2 top-0 w-0 h-0 border-t-[12px] border-t-transparent border-r-[12px] border-r-white/10"></div>
                  </div>
                  
                  {/* Typing indicator when speaking - DEACTIVATED */}
                  {false && isSpeaking && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-1 mt-2 text-white/60 text-xs"
                    >
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        ●
                      </motion.span>
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      >
                        ●
                      </motion.span>
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      >
                        ●
                      </motion.span>
                      <span className="ml-2">AI danışır...</span>
                    </motion.div>
                  )}
                </motion.div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    currentStep === 0
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Geri</span>
                </button>

                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors text-sm"
                >
                  Keç
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#ec4899] to-[#d81b60] text-white rounded-xl font-medium transition shadow-lg"
                >
                  <span>{currentStep === steps.length - 1 ? 'Bitir' : 'Növbəti'}</span>
                  {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
            </div>

            {/* Arrow Pointer - DEACTIVATED (bir yerə dayansın) */}
            {false && currentStepData.highlight && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute w-0 h-0 border-8 border-transparent"
                style={{
                  [currentStepData.position === 'top' ? 'bottom' : 'top']: '-16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  borderColor: currentStepData.position === 'top' 
                    ? 'transparent transparent rgba(139, 92, 246, 0.95) transparent'
                    : 'rgba(139, 92, 246, 0.95) transparent transparent transparent',
                }}
              />
            )}
          </motion.div>

          {/* Highlight Overlay for specific elements - Tam ekranı örtür */}
          {currentStepData.highlight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9997] pointer-events-none"
              style={{
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                position: 'fixed',
              }}
            >
              {/* This would highlight specific elements - implementation depends on element IDs */}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}

export default OnboardingTour

