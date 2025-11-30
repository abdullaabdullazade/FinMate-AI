/**
 * Rewards Page Component
 * Gamification rewards və achievements - Professional dizayn ilə
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { rewardsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import '../styles/pages/rewards.css'

const Rewards = () => {
  const { user } = useAuth()
  const [coins, setCoins] = useState(user?.coins || 0)
  const [claimedRewards, setClaimedRewards] = useState([])
  const [rewardCounts, setRewardCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [currentReward, setCurrentReward] = useState(null)
  const carouselRef = useRef(null)
  const couponCanvasRef = useRef(null)

  /**
   * Component mount olduqda rewards data yüklə
   */
  useEffect(() => {
    const fetchRewardsData = async () => {
      try {
        const response = await rewardsAPI.getRewardsData()
        if (response.data.success) {
          setCoins(response.data.user.coins)
          setClaimedRewards(response.data.claimed_rewards || [])
          setRewardCounts(response.data.reward_counts || {})
        }
      } catch (error) {
        console.error('Rewards data fetch error:', error)
        toast.error('Məlumat yüklənərkən xəta baş verdi', { autoClose: 5000 })
      } finally {
        setLoading(false)
      }
    }

    fetchRewardsData()
  }, [])

  /**
   * Scroll rewards carousel - rewards.html-dəki kimi
   */
  const scrollRewards = (direction) => {
    if (!carouselRef.current) return
    const cardWidth = 288 + 12
    if (direction === 'left') {
      carouselRef.current.scrollLeft -= cardWidth
    } else {
      carouselRef.current.scrollLeft += cardWidth
    }
  }

  /**
   * Open claim modal - rewards.html-dəki kimi
   */
  const openClaimModal = (rewardType, cost, icon, name) => {
    if (coins < cost) {
      toast.error(`Kifayət qədər coin yoxdur. Lazım: ${cost}, Sizin: ${coins}`, { autoClose: 5000 })
      return
    }
    setCurrentReward({ rewardType, cost, icon, name })
    setShowClaimModal(true)
    document.body.style.overflow = 'hidden'
  }

  /**
   * Close claim modal
   */
  const closeClaimModal = () => {
    setShowClaimModal(false)
    setCurrentReward(null)
    document.body.style.overflow = ''
  }

  /**
   * Confirm claim - rewards.html-dəki kimi
   */
  const confirmClaim = async () => {
    if (!currentReward) return

    try {
      const response = await rewardsAPI.claimReward(currentReward.rewardType)
      if (response.data.success) {
        // Close modal first
        closeClaimModal()

        // Update coin balance
        if (response.data.new_balance !== undefined) {
          setCoins(response.data.new_balance)
        }

        // Show success message
        const successMessage = `${currentReward.name} uğurla alındı!`
        toast.success(successMessage, { autoClose: 5000 })

        // Voice notification
        if (typeof window.queueVoiceNotification === 'function') {
          const cleanRewardName = currentReward.name.replace(/[🥉🥈🥇💎🎁]/g, '').trim()
          const voiceMessage = `${cleanRewardName} uğurla alındı. Təbriklər!`
          window.queueVoiceNotification(voiceMessage, 0, 'az')
        }

        // Show coupon if applicable
        if (response.data.show_coupon) {
          setTimeout(() => {
            showCouponModalFunc()
          }, 500)
        } else {
          // Reload rewards data
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        }
      } else {
        toast.error(response.data.error || 'Xəta baş verdi', { autoClose: 5000 })
      }
    } catch (error) {
      console.error('Claim reward error:', error)
      toast.error('Xəta baş verdi', { autoClose: 5000 })
    }
  }

  /**
   * Show coupon modal - rewards.html-dəki kimi
   */
  const showCouponModalFunc = () => {
    setShowCouponModal(true)
    // Launch confetti
    setTimeout(() => {
      if (couponCanvasRef.current && window.confetti) {
        const myConfetti = window.confetti.create(couponCanvasRef.current, {
          resize: true,
          useWorker: true,
        })
        myConfetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C48B60', '#ffffff', '#FFD700'],
        })
      }
    }, 100)
  }

  /**
   * Close coupon modal
   */
  const closeCouponModal = () => {
    setShowCouponModal(false)
    setTimeout(() => {
      window.location.reload()
    }, 300)
  }

  /**
   * Get reward emoji
   */
  const getRewardEmoji = (rewardType) => {
    const emojiMap = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
      platinum: '💎',
    }
    return emojiMap[rewardType] || '🎁'
  }

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Yüklənir...</div>
      </div>
    )
  }

  const currentCoins = coins

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:ml-64" style={{ overflow: 'visible !important' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">🎁 Mükafat Mağazası</h1>
        <p className="text-white/60 text-sm">Coin toplayın, hədiyyələr qazanın!</p>
      </div>

      {/* Current Balance Card - rewards.html-dəki kimi + Animations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6 mb-8 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-2xl"
        style={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 pl-4">
            <p className="text-white/60 text-sm mb-2">Balansınız</p>
            <div className="flex items-center gap-4">
              <motion.span
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-4xl"
              >
                🪙
              </motion.span>
              <motion.span
                key={currentCoins}
                initial={{ scale: 1.2, color: '#fbbf24' }}
                animate={{ scale: 1, color: '#facc15' }}
                transition={{ duration: 0.3 }}
                id="coin-balance"
                className="text-5xl font-bold text-yellow-400"
              >
                {currentCoins}
              </motion.span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 pl-4">
          <p className="text-white/50 text-xs">💡 Qəbz məbləğinə görə coin: 0-49 AZN = 1 coin, 50-99 AZN = 5 coin, 100-500 AZN = 10 coin, 500-999 AZN = 15 coin</p>
        </div>
      </motion.div>

      {/* Available Rewards - REDESIGNED CAROUSEL */}
      <div className="mb-8" style={{ overflow: 'visible' }}>
        <h2 className="text-xl font-bold text-white mb-6 px-1">🛒 Hədiyyə Seçimləri</h2>

        {/* Carousel Container */}
        <div className="relative" style={{ overflow: 'visible', padding: '1rem 0.5rem' }}>
          {/* Scroll Buttons */}
          <button
            onClick={() => scrollRewards('left')}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/15 hover:bg-white/25 backdrop-blur-md p-2.5 md:p-3 rounded-full transition-all duration-200 shadow-lg border border-white/20 hidden md:flex items-center justify-center"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scrollRewards('right')}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/15 hover:bg-white/25 backdrop-blur-md p-2.5 md:p-3 rounded-full transition-all duration-200 shadow-lg border border-white/20 hidden md:flex items-center justify-center"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Scrollable Rewards */}
          <div
            ref={carouselRef}
            id="rewards-carousel"
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-6 px-4 md:px-12"
            style={{ scrollBehavior: 'smooth', overflowY: 'visible !important' }}
          >
            {/* 150 Coins - Coffee Kuponu (Bronze) */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-shrink-0 w-72 sm:w-80 snap-center reward-card-wrapper"
            >
              <div
                className="glass-card p-5 sm:p-6 h-full border border-amber-400/30 hover:border-amber-400/60 transition-all duration-300 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 rounded-2xl relative reward-card-hover"
                style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(251, 191, 36, 0.1)' }}
              >
                <div className="flex justify-between items-center mb-5 min-h-[28px]">
                  <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-200 text-[11px] font-bold uppercase tracking-wider border border-amber-400/30 flex-shrink-0">
                    Bronz
                  </span>
                  {rewardCounts.bronze > 0 ? (
                    <span className="px-2.5 py-1 rounded-lg bg-green-500/25 text-green-200 text-[11px] font-semibold border border-green-400/30 flex items-center gap-1 flex-shrink-0">
                      <span>✓</span>
                      <span>{rewardCounts.bronze}x</span>
                    </span>
                  ) : (
                    <span className="flex-shrink-0"></span>
                  )}
                </div>
                <div className="text-center mb-6">
                  <div className="text-6xl sm:text-7xl mb-5 flex justify-center items-center leading-none">☕</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight leading-tight">Coffee Kuponu</h3>
                  <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-400/40 to-transparent mb-4 mx-auto max-w-[120px]"></div>
                  <p className="text-white/60 text-sm font-medium">1 ədəd pulsuz kofe</p>
                </div>
                <div className="bg-black/25 rounded-2xl p-4 mb-6 border border-amber-400/25 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2.5">
                    <span className="text-yellow-400 text-xl sm:text-2xl leading-none">🪙</span>
                    <span className="text-yellow-400 font-bold text-2xl sm:text-3xl leading-none tracking-tight">150</span>
                    <span className="text-white/40 text-xs sm:text-sm font-medium ml-0.5">coin</span>
                  </div>
                </div>
                <button
                  onClick={() => openClaimModal('bronze', 150, '☕', 'Coffee Kuponu')}
                  disabled={currentCoins < 150}
                  className={`w-full px-5 py-3.5 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                    currentCoins >= 150
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black shadow-lg shadow-amber-500/50'
                      : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                  }`}
                >
                  {currentCoins >= 150 ? (
                    <>
                      <span>🛒</span>
                      <span>Al İndi</span>
                    </>
                  ) : (
                    <>
                      <span>🔒</span>
                      <span>Kiliddə</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* 300 Coins - Coffee Paket (Silver) */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-shrink-0 w-72 sm:w-80 snap-center reward-card-wrapper"
            >
              <div
                className="glass-card p-6 h-full border border-gray-300/30 hover:border-gray-300/60 transition-all duration-300 bg-gradient-to-br from-gray-300/5 to-gray-400/5 rounded-2xl reward-card-hover"
                style={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-300/15 text-gray-200 text-[10px] font-bold uppercase tracking-wide">
                    Gümüş
                  </span>
                  {rewardCounts.silver > 0 && (
                    <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-300 text-xs">
                      ✓ {rewardCounts.silver}x
                    </span>
                  )}
                </div>
                <div className="text-center mb-5">
                  <div className="text-7xl mb-4 flex justify-center items-center">🥈</div>
                  <h3 className="text-2xl font-semibold text-white mb-2 tracking-tight">Coffee Paket</h3>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300/30 to-transparent mb-3"></div>
                  <p className="text-white/70 text-sm">3 ədəd pulsuz kofe</p>
                </div>
                <div className="bg-black/30 rounded-xl p-4 mb-5 border border-gray-300/20">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-yellow-400 text-2xl">🪙</span>
                    <span className="text-yellow-400 font-bold text-3xl">300</span>
                    <span className="text-white/50 text-sm">coin</span>
                  </div>
                </div>
                <button
                  onClick={() => openClaimModal('silver', 300, '🥈', 'Coffee Paket')}
                  disabled={currentCoins < 300}
                  className={`w-full px-5 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 ${
                    currentCoins >= 300
                      ? 'bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-black shadow-lg shadow-gray-300/40'
                      : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                  }`}
                >
                  {currentCoins >= 300 ? (
                    <>
                      <span>🛒</span>
                      <span>Al İndi</span>
                    </>
                  ) : (
                    <>
                      <span>🔒</span>
                      <span>Kiliddə</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* 500 Coins - Pul Mükafatı (Gold) */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex-shrink-0 w-72 sm:w-80 snap-center reward-card-wrapper"
            >
              <div
                className="glass-card p-6 h-full border border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 bg-gradient-to-br from-yellow-400/5 to-amber-500/5 rounded-2xl reward-card-hover"
                style={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-yellow-400/15 text-yellow-200 text-[10px] font-bold uppercase tracking-wide">
                    Qızıl
                  </span>
                  {rewardCounts.gold > 0 && (
                    <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-300 text-xs">✓ {rewardCounts.gold}x</span>
                  )}
                </div>
                <div className="text-center mb-5">
                  <div className="text-7xl mb-4 flex justify-center items-center">🥇</div>
                  <h3 className="text-2xl font-semibold text-white mb-2 tracking-tight">Pul Mükafatı</h3>
                  <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent mb-3"></div>
                  <p className="text-white/70 text-sm">10 AZN bank hesabınıza</p>
                </div>
                <div className="bg-black/30 rounded-xl p-4 mb-5 border border-yellow-400/20">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-yellow-400 text-2xl">🪙</span>
                    <span className="text-yellow-400 font-bold text-3xl">500</span>
                    <span className="text-white/50 text-sm">coin</span>
                  </div>
                </div>
                <button
                  onClick={() => openClaimModal('gold', 500, '🥇', 'Pul Mükafatı - 10 AZN')}
                  disabled={currentCoins < 500}
                  className={`w-full px-5 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 ${
                    currentCoins >= 500
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black shadow-lg shadow-yellow-400/40'
                      : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                  }`}
                >
                  {currentCoins >= 500 ? (
                    <>
                      <span>🛒</span>
                      <span>Al İndi</span>
                    </>
                  ) : (
                    <>
                      <span>🔒</span>
                      <span>Kiliddə</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* 2000 Coins - Premium Paket (Platinum) */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex-shrink-0 w-72 sm:w-80 snap-center reward-card-wrapper"
            >
              <div
                className="glass-card p-6 h-full border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl reward-card-hover relative overflow-hidden"
                style={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' }}
              >
                {/* Premium Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-blue-600/10 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-200 text-[10px] font-bold uppercase tracking-wide border border-blue-400/40">
                      Platin
                    </span>
                    {rewardCounts.platinum > 0 && (
                      <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-300 text-xs">✓ {rewardCounts.platinum}x</span>
                    )}
                  </div>
                  <div className="text-center mb-5">
                    <div className="text-7xl mb-4 flex justify-center items-center">💎</div>
                    <h3 className="text-2xl font-semibold text-white mb-2 tracking-tight">Premium Paket</h3>
                    <div className="h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent mb-3"></div>
                    <p className="text-white/70 text-sm">1 ay Premium + 30 AZN</p>
                  </div>
                  <div className="bg-black/30 rounded-xl p-4 mb-5 border border-blue-400/20">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-yellow-400 text-2xl">🪙</span>
                      <span className="text-yellow-400 font-bold text-3xl">2000</span>
                      <span className="text-white/50 text-sm">coin</span>
                    </div>
                  </div>
                  <button
                    onClick={() => openClaimModal('platinum', 2000, '💎', 'Premium Paket')}
                    disabled={currentCoins < 2000}
                    className={`w-full px-5 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 ${
                      currentCoins >= 2000
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                    }`}
                  >
                    {currentCoins >= 2000 ? (
                      <>
                        <span>🛒</span>
                        <span>Al İndi</span>
                      </>
                    ) : (
                      <>
                        <span>🔒</span>
                        <span>Kiliddə</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scroll Indicator Dots */}
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
          </div>
        </div>
      </div>

      {/* Claimed Rewards History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-6 px-1">📜 Alınmış Hədiyyələr</h2>
        {claimedRewards.length > 0 ? (
          <div className="space-y-3">
            {claimedRewards.map((reward) => (
              <div
                key={reward.id}
                className="glass-card p-5 flex items-center justify-between hover:bg-white/5 transition rounded-xl"
                style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{getRewardEmoji(reward.reward_type)}</span>
                  <div>
                    <p className="text-white font-semibold text-base">{reward.reward_name}</p>
                    <p className="text-white/50 text-xs mt-0.5">{formatDate(reward.claimed_at)}</p>
                  </div>
                </div>
                <span className="text-red-400 font-bold text-base">-{reward.coins_spent} 🪙</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center rounded-xl" style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
            <p className="text-white/50 text-base">Hələ hədiyyə almamısınız</p>
            <p className="text-white/30 text-sm mt-1">Coin toplayın və yuxarıdan seçin!</p>
          </div>
        )}
      </div>

      {/* Claim Confirmation Modal */}
      <AnimatePresence>
        {showClaimModal && currentReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="claim-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target.id === 'claim-modal') closeClaimModal()
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="glass-card max-w-md w-full p-8 mx-4 rounded-2xl"
              style={{ boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)' }}
            >
            <div className="text-center mb-8">
              <div id="modal-icon" className="text-7xl mb-5">
                {currentReward.icon}
              </div>
              <h3 id="modal-title" className="text-2xl font-bold text-white mb-3">
                {currentReward.name}
              </h3>
              <p id="modal-description" className="text-white/70 text-sm">
                Bu hədiyyəni almaq istəyirsiniz?
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-5 mb-8 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/70 text-sm">Cari Balans:</span>
                <span id="modal-current-coins" className="text-yellow-400 font-bold text-lg">
                  🪙 {coins}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/70 text-sm">Qiymət:</span>
                <span id="modal-cost" className="text-red-400 font-bold text-lg">
                  -🪙 {currentReward.cost}
                </span>
              </div>
              <div className="border-t border-white/10 my-3"></div>
              <div className="flex items-center justify-between">
                <span className="text-white font-medium text-base">Qalacaq:</span>
                <span id="modal-remaining" className="text-green-400 font-bold text-xl">
                  🪙 {coins - currentReward.cost}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeClaimModal}
                className="flex-1 px-5 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all active:scale-95"
              >
                ❌ İmtina
              </button>
              <button
                id="confirm-claim-btn"
                onClick={confirmClaim}
                className="flex-1 px-5 py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-all active:scale-95"
              >
                ✅ Təsdiq Et
              </button>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Coffee Coupon Modal */}
      <AnimatePresence>
        {showCouponModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            id="coupon-modal"
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-card max-w-sm w-full p-0 mx-4 rounded-3xl overflow-hidden relative"
              id="coupon-content"
              style={{ boxShadow: '0 0 50px rgba(196, 139, 96, 0.3)' }}
            >
              {/* Confetti Canvas */}
              <canvas ref={couponCanvasRef} id="coupon-confetti" className="absolute inset-0 w-full h-full pointer-events-none z-10"></canvas>

              <div className="bg-gradient-to-br from-[#C48B60] to-[#A06B45] p-6 text-center relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 w-full h-full opacity-10"
                  style={{
                    backgroundImage:
                      "url('data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E')",
                  }}
                ></div>

                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border border-white/30">
                  <span className="text-5xl">☕</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">Coffee Kuponu</h3>
                <p className="text-white/80 text-sm font-medium">Təbriklər! Dadını çıxarın.</p>
              </div>

              <div className="p-6 bg-[#1a1a1a] relative">
                {/* Ticket Cutout Effect */}
                <div className="absolute -top-3 left-0 w-6 h-6 bg-[#1a1a1a] rounded-full -ml-3"></div>
                <div className="absolute -top-3 right-0 w-6 h-6 bg-[#1a1a1a] rounded-full -mr-3"></div>
                <div className="border-t-2 border-dashed border-white/10 absolute top-0 left-4 right-4"></div>

                <div className="text-center space-y-4 pt-2">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-white/40 text-xs uppercase tracking-widest mb-1">KOD</p>
                    <p className="text-2xl font-mono font-bold text-white tracking-wider" id="coupon-code">
                      FREE-COFFEE
                    </p>
                  </div>

                  <p className="text-white/50 text-xs">Bu kuponu kassaya təqdim edin.</p>

                  <button
                    onClick={closeCouponModal}
                    className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition transform hover:scale-[1.02]"
                  >
                    Bağla
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Rewards
