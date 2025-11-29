/**
 * Dream Stats Component
 * Ümumi qənaət, məqsəd və tərəqqi göstəriciləri
 */

import React, { useState, useEffect, useRef } from 'react'
import '../../styles/components/dreamvault/dream-stats.css'

const DreamStats = ({ totalSaved, totalTarget, totalProgress }) => {
  const [animatedSaved, setAnimatedSaved] = useState(totalSaved || 0)
  const [animatedTarget, setAnimatedTarget] = useState(totalTarget || 0)
  const [animatedProgress, setAnimatedProgress] = useState(totalProgress || 0)
  const statsRef = useRef(null)
  const hasAnimated = useRef(false)
  const animationFrameRef = useRef(null)
  // Cari animasiya olunan dəyərləri ref-də saxlayırıq ki, dəyişikliklərdə düzgün başlanğıc dəyər olsun
  const currentAnimatedSaved = useRef(totalSaved || 0)
  const currentAnimatedTarget = useRef(totalTarget || 0)
  const currentAnimatedProgress = useRef(totalProgress || 0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            // İlk dəfə görünəndə animasiya başlat
            animateNumbers()
          }
        })
      },
      { threshold: 0.1, rootMargin: '50px' }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    // Stats dəyişəndə yenilə - hər dəfə yeni animasiya
    if (hasAnimated.current) {
      // Əvvəlki animasiyanı dayandır
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      // Cari animasiya olunan dəyərləri ref-dən götür (son animasiya dəyəri)
      currentAnimatedSaved.current = animatedSaved
      currentAnimatedTarget.current = animatedTarget
      currentAnimatedProgress.current = animatedProgress
      // Yeni animasiya başlat - cari dəyərdən yeni dəyərə
      animateNumbers()
    } else {
      // İlk dəfə - dəyərləri birbaşa təyin et
      const saved = totalSaved || 0
      const target = totalTarget || 0
      const progress = totalProgress || 0
      setAnimatedSaved(saved)
      setAnimatedTarget(target)
      setAnimatedProgress(progress)
      // Ref-ləri də yenilə
      currentAnimatedSaved.current = saved
      currentAnimatedTarget.current = target
      currentAnimatedProgress.current = progress
    }
  }, [totalSaved, totalTarget, totalProgress])

  const animateNumbers = () => {
    // Əvvəlki animasiyanı dayandır
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    const duration = 1000
    const startTime = Date.now()
    // Cari animasiya olunan dəyərlərdən başla (ref-dən götürürük ki, dəqiq olsun)
    const startSaved = currentAnimatedSaved.current
    const startTarget = currentAnimatedTarget.current
    const startProgress = currentAnimatedProgress.current
    // Hədəf dəyərlər
    const targetSaved = totalSaved || 0
    const targetTarget = totalTarget || 0
    const targetProgress = totalProgress || 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)

      const newSaved = startSaved + (targetSaved - startSaved) * easeOut
      const newTarget = startTarget + (targetTarget - startTarget) * easeOut
      const newProgress = startProgress + (targetProgress - startProgress) * easeOut

      setAnimatedSaved(newSaved)
      setAnimatedTarget(newTarget)
      setAnimatedProgress(newProgress)

      // Ref-ləri də yenilə
      currentAnimatedSaved.current = newSaved
      currentAnimatedTarget.current = newTarget
      currentAnimatedProgress.current = newProgress

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Animasiya bitdikdə dəqiq dəyərləri təyin et
        setAnimatedSaved(targetSaved)
        setAnimatedTarget(targetTarget)
        setAnimatedProgress(targetProgress)
        // Ref-ləri də yenilə
        currentAnimatedSaved.current = targetSaved
        currentAnimatedTarget.current = targetTarget
        currentAnimatedProgress.current = targetProgress
        animationFrameRef.current = null
      }
    }

    animate()
  }

  // Check incognito mode
  const isIncognito = typeof window !== 'undefined' && localStorage.getItem('incognito-mode') === 'enabled'

  return (
    <div ref={statsRef} className="dream-stats glass-card p-4 sm:p-6 mb-4 sm:mb-6 slide-up">
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-header">
            <div className="stat-icon stat-icon-green">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p className="stat-label">Ümumi Qənaət</p>
          </div>
          <p className="stat-value">
            {isIncognito ? '**** AZN' : `${animatedSaved.toFixed(2)} AZN`}
          </p>
        </div>

        <div className="stat-item">
          <div className="stat-header">
            <div className="stat-icon stat-icon-blue">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <p className="stat-label">Ümumi Məqsəd</p>
          </div>
          <p className="stat-value">
            {isIncognito ? '**** AZN' : `${animatedTarget.toFixed(2)} AZN`}
          </p>
        </div>

        <div className="stat-item">
          <div className="stat-header">
            <div className="stat-icon stat-icon-purple">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <p className="stat-label">Ümumi Tərəqqi</p>
          </div>
          <p className="stat-value stat-value-progress">
            {isIncognito ? '****%' : `${animatedProgress.toFixed(1)}%`}
          </p>
        </div>
      </div>

      <div className="stats-progress-section">
        <div className="progress-header">
          <span className="progress-label">Ümumi Tərəqqi Barı</span>
          <span className="progress-percentage">
            {isIncognito ? '****%' : `${totalProgress.toFixed(1)}%`}
          </span>
        </div>
        <div className="dream-progress-bar">
          <div 
            className="dream-progress-fill shimmer"
            style={{ width: `${Math.min(totalProgress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default DreamStats
