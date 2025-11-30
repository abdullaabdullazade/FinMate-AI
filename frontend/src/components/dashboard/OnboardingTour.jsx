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
  const [isMobile, setIsMobile] = useState(false)
  const audioRef = useRef(null)

  // Mobil və desktop ayrımı
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px-dən kiçik = mobil
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998]"
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

          {/* Tour Card - Mobil və Desktop üçün tam mərkəzləşdirilmiş dizayn */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.96, x: '-50%', y: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed z-[9999]"
            style={{
              top: '50%',
              left: '50%',
              right: 'auto',
              bottom: 'auto',
              width: isMobile ? '92%' : '520px',
              maxWidth: isMobile ? '92%' : '520px',
              maxHeight: isMobile ? '85vh' : '600px',
              margin: '0',
              position: 'fixed',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="glass-card relative overflow-hidden border border-white/20 shadow-2xl backdrop-blur-xl" 
              style={{ 
                padding: isMobile ? '0.75rem' : '1.5rem',
                borderRadius: isMobile ? '0.875rem' : '1.25rem',
                maxHeight: isMobile ? '85vh' : '600px', 
                overflowY: 'auto',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
              }}
            >
              <div className="relative z-10">
                {/* Header - Mobil və Desktop üçün ayrı */}
                <div 
                  className="flex items-center justify-between border-b border-white/10"
                  style={{
                    marginBottom: isMobile ? '0.75rem' : '1rem',
                    paddingBottom: isMobile ? '0.75rem' : '1rem',
                  }}
                >
                  {/* Left side - Avatar & Title */}
                  <div 
                    className="flex items-center flex-1 min-w-0"
                    style={{ gap: isMobile ? '0.5rem' : '0.75rem' }}
                  >
                    {/* Robot Avatar - Mobil və Desktop üçün ayrı ölçülər */}
                    <div className="flex-shrink-0">
                      <div 
                        className="rounded-lg bg-gradient-to-br from-purple-500/50 to-pink-500/50 border border-white/30 flex items-center justify-center shadow-md"
                        style={{
                          width: isMobile ? '2rem' : '3rem',
                          height: isMobile ? '2rem' : '3rem',
                        }}
                      >
                        <div className="flex flex-col items-center" style={{ gap: isMobile ? '0.125rem' : '0.25rem' }}>
                          <div className="flex" style={{ gap: isMobile ? '0.125rem' : '0.25rem' }}>
                            <div 
                              className="bg-white rounded-full"
                              style={{ width: isMobile ? '0.25rem' : '0.375rem', height: isMobile ? '0.25rem' : '0.375rem' }}
                            />
                            <div 
                              className="bg-white rounded-full"
                              style={{ width: isMobile ? '0.25rem' : '0.375rem', height: isMobile ? '0.25rem' : '0.375rem' }}
                            />
                          </div>
                          <div 
                            className="bg-white rounded-full"
                            style={{ 
                              width: isMobile ? '0.5rem' : '0.75rem', 
                              height: isMobile ? '0.125rem' : '0.1875rem' 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Title & Step */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center" style={{ gap: isMobile ? '0.375rem' : '0.5rem' }}>
                        <span 
                          className="flex-shrink-0"
                          style={{ fontSize: isMobile ? '1rem' : '1.5rem' }}
                        >
                          {currentStepData.emoji}
                        </span>
                        <h3 
                          className="font-bold text-white truncate"
                          style={{ fontSize: isMobile ? '0.875rem' : '1.25rem' }}
                        >
                          {currentStepData.title}
                        </h3>
                      </div>
                      <p 
                        className="text-white/50"
                        style={{ 
                          fontSize: isMobile ? '0.625rem' : '0.75rem',
                          marginTop: isMobile ? '0.125rem' : '0.25rem'
                        }}
                      >
                        Addım {currentStep + 1} / {steps.length}
                      </p>
                    </div>
                  </div>

                  {/* Close Button - Mobil və Desktop üçün ayrı */}
                  <button
                    onClick={handleSkip}
                    className="text-white/50 hover:text-white transition-colors hover:bg-white/10 rounded-lg flex-shrink-0"
                    style={{
                      padding: isMobile ? '0.375rem' : '0.5rem',
                    }}
                    aria-label="Bağla"
                  >
                    <X style={{ width: isMobile ? '1rem' : '1.25rem', height: isMobile ? '1rem' : '1.25rem' }} />
                  </button>
                </div>

                {/* Progress Bar - Mobil və Desktop üçün ayrı */}
                <div style={{ marginBottom: isMobile ? '0.75rem' : '1rem' }}>
                  <div 
                    className="w-full bg-white/10 rounded-full overflow-hidden"
                    style={{ height: isMobile ? '0.25rem' : '0.375rem' }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Content - Mobil və Desktop üçün ayrı */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: isMobile ? '0.75rem' : '1rem' }}
                >
                  <div 
                    className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                    style={{
                      padding: isMobile ? '0.75rem' : '1rem',
                    }}
                  >
                    <p 
                      className="text-white/90 leading-relaxed"
                      style={{ 
                        fontSize: isMobile ? '0.75rem' : '0.9375rem',
                        lineHeight: isMobile ? '1.5' : '1.6'
                      }}
                    >
                      {currentStepData.description}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Actions - Mobil və Desktop üçün ayrı */}
              <div 
                className="flex items-center justify-between border-t border-white/10"
                style={{
                  paddingTop: isMobile ? '0.75rem' : '1rem',
                  gap: isMobile ? '0.5rem' : '0.75rem',
                }}
              >
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`flex items-center justify-center rounded-lg font-medium transition-all ${
                    currentStep === 0
                      ? 'bg-white/5 text-white/20 cursor-not-allowed'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 active:scale-95'
                  }`}
                  style={{
                    width: isMobile ? '2.25rem' : '2.75rem',
                    height: isMobile ? '2.25rem' : '2.75rem',
                  }}
                  aria-label="Geri"
                >
                  <ArrowLeft style={{ width: isMobile ? '1rem' : '1.25rem', height: isMobile ? '1rem' : '1.25rem' }} />
                </button>

                <button
                  onClick={handleSkip}
                  className="flex-1 text-white/60 hover:text-white/80 transition-colors rounded-lg hover:bg-white/5"
                  style={{
                    padding: isMobile ? '0.5rem 0.75rem' : '0.625rem 1rem',
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                  }}
                >
                  Keç
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl active:scale-95"
                  style={{
                    padding: isMobile ? '0.5rem 0.75rem' : '0.625rem 1.25rem',
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    gap: isMobile ? '0.375rem' : '0.5rem',
                  }}
                >
                  <span>{currentStep === steps.length - 1 ? 'Bitir' : 'Növbəti'}</span>
                  {currentStep < steps.length - 1 && (
                    <ArrowRight style={{ width: isMobile ? '0.875rem' : '1rem', height: isMobile ? '0.875rem' : '1rem' }} />
                  )}
                </button>
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

