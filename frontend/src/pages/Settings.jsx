/**
 * Settings Page Component
 * Tam funksionallıqla settings səhifəsi
 * HTML/CSS/JS-dən React-ə köçürülmüş versiya
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { settingsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

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
  
  // Form state
  const [formData, setFormData] = useState({
    monthly_budget: user?.monthly_budget || 1000,
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
          
          setFormData({
            monthly_budget: userData.monthly_budget || 1000,
            daily_budget_limit: userData.daily_budget_limit || null,
            voice_enabled: userData.voice_enabled || false,
            voice_mode: localStorage.getItem('voice-mode') === 'enabled',
            readability_mode: readabilityMode,
            ai_persona_mode: userData.ai_persona_mode || 'Auto',
            ai_name: userData.ai_name || 'FinMate',
            ai_attitude: userData.ai_attitude || 'Professional',
            ai_style: userData.ai_style || 'Formal',
            incognito_mode: userData.incognito_mode || false,
            premium_theme: localStorage.getItem('premium-theme') || 'default',
          })
        }
      } catch (error) {
        console.error('Settings load error:', error)
        toast.error('Ayarlar yüklənə bilmədi')
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
    setSaving(true)

    try {
      // FormData yaradırıq (backend FormData gözləyir)
      const formDataToSend = new FormData()
      
      formDataToSend.append('monthly_budget', formData.monthly_budget)
      
      if (formData.daily_budget_limit !== null && formData.daily_budget_limit !== '') {
        formDataToSend.append('daily_budget_limit', formData.daily_budget_limit)
      }
      
      formDataToSend.append('voice_enabled', formData.voice_enabled ? 'true' : 'false')
      formDataToSend.append('readability_mode', formData.readability_mode ? 'true' : 'false')
      formDataToSend.append('ai_persona_mode', formData.ai_persona_mode)
      formDataToSend.append('ai_name', formData.ai_name)
      
      if (formData.ai_persona_mode === 'Manual') {
        formDataToSend.append('ai_attitude', formData.ai_attitude)
        formDataToSend.append('ai_style', formData.ai_style)
      }
      
      if (user?.is_premium) {
        formDataToSend.append('incognito_mode', formData.incognito_mode)
      }

      const response = await settingsAPI.updateSettings(formDataToSend)
      
      if (response.data.success) {
        toast.success(response.data.message || 'Tənzimləmələr yadda saxlanıldı')
        
        // Voice mode localStorage-da saxlanır
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
        
        // Short delay sonra reload (optional)
        setTimeout(() => {
          // window.location.reload() // İstəsəniz reload edə bilərsiniz
        }, 1500)
      } else {
        toast.error(response.data.error || 'Xəta baş verdi')
      }
    } catch (error) {
      console.error('Settings save error:', error)
      toast.error(error.response?.data?.error || 'Xəta baş verdi')
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
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div className="settings-header-content">
          <h1 className="settings-title">Tənzimləmələr</h1>
          <p className="settings-subtitle">Şəxsi seçimlərinizi və büdcənizi idarə edin</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="settings-back-button"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          <span>Geri</span>
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="settings-form">
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
          onVoiceEnabledChange={(value) => updateFormData('voice_enabled', value)}
          onVoiceModeChange={(value) => {
            updateFormData('voice_mode', value)
            localStorage.setItem('voice-mode', value ? 'enabled' : 'disabled')
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

        {/* Submit Button */}
        <div className="slide-up" style={{ animationDelay: '0.5s' }}>
          <button
            type="submit"
            disabled={saving}
            className="settings-submit-button"
          >
            <span>{saving ? 'Saxlanılır...' : 'Yadda Saxla'}</span>
            {!saving && (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
