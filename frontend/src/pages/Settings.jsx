/**
 * Settings Page Component
 * Tam funksionallıqla settings səhifəsi
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from '../utils/toast'
import { settingsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useVoiceNotification } from '../hooks/useVoiceNotification'

// Settings Components
import BudgetSection from '../components/settings/BudgetSection'
import PreferencesSection from '../components/settings/PreferencesSection'
import AIPersonaSection from '../components/settings/AIPersonaSection'
import PremiumThemesSection from '../components/settings/PremiumThemesSection'
import IncognitoSection from '../components/settings/IncognitoSection'
import QuickActionsSection from '../components/settings/QuickActionsSection'
import PremiumUpgradeCard from '../components/settings/PremiumUpgradeCard'
import GamificationCard from '../components/settings/GamificationCard'
import { usePremiumModal } from '../contexts/PremiumModalContext'

// Styles
import '../styles/pages/settings.css'

const Settings = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { openModal } = usePremiumModal()
  const { speak, isVoiceModeEnabled } = useVoiceNotification()
  
  // Form state
  const [formData, setFormData] = useState({
    monthly_budget: user?.monthly_budget ?? 0,
    daily_budget_limit: user?.daily_budget_limit || null,
    voice_enabled: user?.voice_enabled || false,
    voice_mode: false, // TTS mode - stored in localStorage
    readability_mode: user?.readability_mode || false,
    ai_persona_mode: user?.ai_persona_mode || 'Auto',
    ai_name: user?.ai_name || 'FinMate',
    ai_attitude: user?.ai_attitude || 'Professional',
    ai_style: user?.ai_style || 'Formal',
    incognito_mode: user?.incognito_mode || false,
    premium_theme: 'default',
  })

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Scroll performansı üçün - scroll zamanı animasiyaları dayandır
  useEffect(() => {
    let scrollTimeout
    const handleScroll = () => {
      document.body.classList.add('scrolling')
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('scrolling')
      }, 150)
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsAPI.getSettings()
        if (response.data && response.data.user) {
          const userData = response.data.user
          const readabilityMode = userData.readability_mode || localStorage.getItem('readability-mode') === 'enabled'
          
          // Apply readability mode immediately
          if (readabilityMode) {
            document.body.classList.add('readability-mode')
            localStorage.setItem('readability-mode', 'enabled')
          } else {
            document.body.classList.remove('readability-mode')
            localStorage.setItem('readability-mode', 'disabled')
          }
          
          // Voice mode - backend-dən götür, yoxdursa localStorage-dan
          const voiceModeFromBackend = userData.voice_mode !== undefined ? userData.voice_mode : (localStorage.getItem('voice-mode') === 'enabled')
          
          setFormData({
            monthly_budget: userData.monthly_budget ?? 0,
            daily_budget_limit: userData.daily_budget_limit || null,
            voice_enabled: userData.voice_enabled || false,
            voice_mode: voiceModeFromBackend,
            readability_mode: readabilityMode,
            ai_persona_mode: userData.ai_persona_mode || 'Auto',
            ai_name: userData.ai_name || 'FinMate',
            ai_attitude: userData.ai_attitude || 'Professional',
            ai_style: userData.ai_style || 'Formal',
            incognito_mode: userData.incognito_mode || false,
            premium_theme: localStorage.getItem('premium-theme') || 'default',
          })
          
          // Voice mode-u localStorage-da da saxla (backward compatibility)
          if (voiceModeFromBackend) {
            localStorage.setItem('voice-mode', 'enabled')
          } else {
            localStorage.removeItem('voice-mode')
          }
        }
      } catch (error) {
        console.error('Settings load error:', error)
        toast.error('Ayarlar yüklənə bilmədi', { autoClose: 5000 })
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  /**
   * Form data dəyişiklikləri
   */
  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  /**
   * Form submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('💾 Settings form submitting...', formData)
    setSaving(true)

    try {
      // FormData yaradırıq (backend FormData gözləyir)
      const formDataToSend = new FormData()
      
      formDataToSend.append('monthly_budget', String(formData.monthly_budget ?? 0))
      
      if (formData.daily_budget_limit !== null && formData.daily_budget_limit !== '') {
        formDataToSend.append('daily_budget_limit', String(formData.daily_budget_limit))
      }
      
      formDataToSend.append('voice_enabled', formData.voice_enabled ? 'true' : 'false')
      formDataToSend.append('voice_mode', formData.voice_mode ? 'true' : 'false') // TTS mode - backend-ə göndəririk
      formDataToSend.append('readability_mode', formData.readability_mode ? 'true' : 'false')
      formDataToSend.append('ai_persona_mode', formData.ai_persona_mode || 'Auto')
      formDataToSend.append('ai_name', formData.ai_name || 'FinMate')
      
      if (formData.ai_persona_mode === 'Manual') {
        formDataToSend.append('ai_attitude', formData.ai_attitude || 'Professional')
        formDataToSend.append('ai_style', formData.ai_style || 'Formal')
      }
      
      if (user?.is_premium) {
        formDataToSend.append('incognito_mode', formData.incognito_mode ? 'true' : 'false')
      }

      // Debug: FormData məzmununu yoxla
      console.log('📤 Sending FormData:')
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`   ${key}: ${value}`)
      }

      const response = await settingsAPI.updateSettings(formDataToSend)
      
      console.log('📥 Settings API response:', response)
      
      if (response && response.data && response.data.success) {
        const message = response.data.message || 'Tənzimləmələr yadda saxlanıldı'
        console.log('✅ Settings saved successfully:', message)
        toast.success(message, { autoClose: 5000 })
        
        // Voice mode localStorage-da da saxla (backward compatibility)
        // Backend-də artıq saxlanır, amma localStorage-da da saxlayırıq
        if (formData.voice_mode) {
          localStorage.setItem('voice-mode', 'enabled')
        } else {
          localStorage.removeItem('voice-mode')
        }
        
        // Readability mode - toggle funksiyasını çağır
        if (typeof window.toggleReadabilityMode === 'function') {
          window.toggleReadabilityMode(formData.readability_mode)
        } else {
          // Fallback - direkt class əlavə et/çıxar
          if (formData.readability_mode) {
            document.body.classList.add('readability-mode')
            localStorage.setItem('readability-mode', 'enabled')
          } else {
            document.body.classList.remove('readability-mode')
            localStorage.setItem('readability-mode', 'disabled')
          }
        }
        
        // Stats update trigger
        window.dispatchEvent(new CustomEvent('settingsUpdated'))
        
        // User context-i yenilə (əgər varsa)
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('userUpdated'))
        }
      } else {
        const errorMsg = response?.data?.error || 'Xəta baş verdi'
        console.error('❌ Settings save failed:', errorMsg)
        toast.error(errorMsg, { autoClose: 5000 })
      }
    } catch (error) {
      console.error('❌ Settings save error:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      const errorMsg = error.response?.data?.error || error.message || 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.'
      toast.error(errorMsg, { autoClose: 5000 })
    } finally {
      setSaving(false)
    }
  }

  /**
   * Premium modal aç
   */
  const handlePremiumUpgrade = () => {
    openModal()
  }

  if (loading) {
    return (
      <div className="settings-page">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">Yüklənir...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-2 sm:px-4 pb-24 sm:pb-32" style={{ 
      willChange: 'scroll-position',
      WebkitOverflowScrolling: 'touch',
      transform: 'translateZ(0)' // GPU acceleration
    }}>
      {/* Header - Dashboard kimi */}
      <div className="glass-card p-4 sm:p-6 mb-6 slide-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Tənzimləmələr</h1>
            <p className="text-white/70 text-sm sm:text-base">Şəxsi seçimlərinizi və büdcənizi idarə edin</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm transition"
          >
            <div className="flex items-center gap-2">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              <span>Geri</span>
            </div>
          </button>
        </div>
      </div>

      {/* Settings Form - Dashboard kimi */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Budget Section */}
        <BudgetSection
          monthlyBudget={formData.monthly_budget}
          dailyBudgetLimit={formData.daily_budget_limit}
          onBudgetChange={(value) => updateFormData('monthly_budget', value)}
          onDailyLimitChange={(value) => updateFormData('daily_budget_limit', value)}
        />

        {/* Preferences Section */}
        <PreferencesSection
          voiceEnabled={formData.voice_enabled}
          voiceMode={formData.voice_mode}
          readabilityMode={formData.readability_mode}
          isPremium={user?.is_premium || false}
          onVoiceEnabledChange={(value) => {
            // Səsli əmrlər premium funksiyadır
            if (!user?.is_premium) {
              toast.error('Səsli əmrlər Premium üçündür', { autoClose: 5000 })
              openModal()
              return
            }
            updateFormData('voice_enabled', value)
          }}
          onVoiceModeChange={(value) => {
            // TTS mode premium funksiyadır
            if (!user?.is_premium) {
              toast.error('Səsləndirmə rejimi Premium üçündür', { autoClose: 5000 })
              openModal()
              return
            }
            updateFormData('voice_mode', value)
            localStorage.setItem('voice-mode', value ? 'enabled' : 'disabled')
            
            // Voice mode aktiv edildikdə test səsləndirməsi
            if (value) {
              // Kiçik gecikmə - localStorage dəyişikliyi tətbiq olunsun
              setTimeout(() => {
                speak('Səsləndirmə aktivləşdirildi. Artıq bütün bildirişlər səslə oxunacaq.', 0, 'az')
              }, 300)
            } else {
              // Voice mode deaktiv edildikdə
              setTimeout(() => {
                if (typeof window.queueVoiceNotification !== 'undefined') {
                  // Queue-nu təmizlə
                  console.log('🔇 Voice mode disabled')
                }
              }, 100)
            }
          }}
          onReadabilityModeChange={(value) => updateFormData('readability_mode', value)}
        />

        {/* AI Persona Section */}
        <AIPersonaSection
          aiPersonaMode={formData.ai_persona_mode}
          aiName={formData.ai_name}
          aiAttitude={formData.ai_attitude}
          aiStyle={formData.ai_style}
          onPersonaModeChange={(value) => updateFormData('ai_persona_mode', value)}
          onAiNameChange={(value) => updateFormData('ai_name', value)}
          onAttitudeChange={(value) => updateFormData('ai_attitude', value)}
          onStyleChange={(value) => updateFormData('ai_style', value)}
        />

        {/* Premium Themes Section */}
        {user?.is_premium && (
          <PremiumThemesSection
            isPremium={user.is_premium}
            currentTheme={formData.premium_theme}
            onThemeChange={(theme) => updateFormData('premium_theme', theme)}
          />
        )}

        {/* Incognito Section */}
        {user?.is_premium && (
          <IncognitoSection
            isPremium={user.is_premium}
            incognitoMode={formData.incognito_mode}
            onIncognitoModeChange={(value) => updateFormData('incognito_mode', value)}
          />
        )}

        {/* Premium Upgrade Card */}
        {!user?.is_premium && (
          <PremiumUpgradeCard onUpgradeClick={handlePremiumUpgrade} />
        )}

        {/* Gamification Card */}
        <GamificationCard
          loginStreak={user?.login_streak || 0}
          levelTitle={user?.level_title}
        />

        {/* Quick Actions Section */}
        <QuickActionsSection
          isPremium={user?.is_premium || false}
          loginStreak={user?.login_streak || 0}
          levelTitle={user?.level_title}
        />

        {/* Submit Button - Dashboard kimi */}
        <div className="glass-card p-4 sm:p-6 slide-up" style={{ animationDelay: '0.5s' }}>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-[#ec4899] to-[#d81b60] text-white font-bold py-3 rounded-xl transition shadow-lg border border-white/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              // Ensure form submission
              const form = e.currentTarget.closest('form')
              if (form && !form.checkValidity()) {
                e.preventDefault()
                form.reportValidity()
                return
              }
            }}
          >
            <span>{saving ? 'Saxlanılır...' : 'Yadda Saxla'}</span>
            {!saving && (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Settings
