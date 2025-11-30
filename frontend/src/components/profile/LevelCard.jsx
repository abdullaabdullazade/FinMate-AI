/**
 * Level Card Component
 */

import React, { useEffect, useRef } from 'react'

const LevelCard = ({ levelInfo, nextLevel, userXP }) => {
  const levelCardRef = useRef(null)
  const progressBarRef = useRef(null)

  useEffect(() => {
    // Fast level transition on mount/update - profile.js-dəki kimi
    if (levelCardRef.current && progressBarRef.current) {
      levelCardRef.current.style.transition = 'background 0.2s ease-in-out, border-color 0.2s ease-in-out'
      progressBarRef.current.style.transition = 'width 0.3s ease-out, background 0.2s ease-in-out'

      // Trigger reflow to ensure styles are applied
      void levelCardRef.current.offsetHeight
      void progressBarRef.current.offsetHeight
    }
  }, [levelInfo])

  if (!levelInfo) return null

  const getLevelClass = (title) => {
    if (title === 'Manager') return 'level-manager'
    if (title === 'Rookie') return 'level-rookie'
    if (title === 'Saver') return 'level-saver'
    if (title === 'Analyst') return 'level-analyst'
    if (title === 'CFO') return 'level-cfo'
    return 'level-master'
  }

  const getLevelSubtitle = (title) => {
    if (title === 'Rookie') return 'Level 1 • Yeni başlayan'
    if (title === 'Saver') return 'Level 2 • Qənaətkar'
    if (title === 'Analyst') return 'Level 3 • Analitik'
    if (title === 'Manager') return 'Level 4 • Menecer'
    if (title === 'CFO') return 'Level 5 • Maliyyə direktoru'
    return 'Level 6 • Ustad'
  }

  const getProgressBarGradient = (title) => {
    if (title === 'Manager') return 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400'
    if (title === 'Rookie') return 'bg-gradient-to-r from-green-300 via-emerald-400 to-teal-400'
    if (title === 'Saver') return 'bg-gradient-to-r from-blue-300 via-cyan-400 to-sky-400'
    if (title === 'Analyst') return 'bg-gradient-to-r from-purple-300 via-violet-400 to-fuchsia-400'
    if (title === 'CFO') return 'bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400'
    return 'bg-gradient-to-r from-pink-300 via-rose-400 to-red-400'
  }

  const progressPercentage = Math.round(levelInfo.progress_percentage || 0)

  return (
    <div
      ref={levelCardRef}
      className={`relative overflow-hidden rounded-3xl p-4 md:p-8 mb-6 slide-up level-card ${getLevelClass(levelInfo.title)}`}
      id="level-card"
      style={{ animationDelay: '0.05s' }}
    >
      {/* Animated Background Pattern */}
      <div
        className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-20"
      ></div>

      {/* Floating Orbs */}
      <div className="absolute top-4 right-4 w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-4 left-4 w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
          <div className="flex items-center gap-3 md:gap-4 flex-1">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl md:text-5xl shadow-2xl border-2 border-white/30 flex-shrink-0">
              {levelInfo.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-xs md:text-sm mb-1">Səviyyən</p>
              <h3 className="text-2xl md:text-3xl font-black text-white drop-shadow-lg truncate">
                {levelInfo.title}
              </h3>
              <p className="text-white/90 text-xs md:text-sm font-medium">{getLevelSubtitle(levelInfo.title)}</p>
            </div>
          </div>

          {/* XP Badge */}
          <div className="text-center bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl px-4 py-3 md:px-6 md:py-4 border-2 border-white/40 shadow-2xl w-full md:w-auto">
            <p className="text-4xl md:text-5xl font-black text-white drop-shadow-md">{userXP || 0}</p>
            <p className="text-xs md:text-sm text-white/90 font-bold mt-1">XP</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-5 border border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-2 md:gap-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-white/90 text-xs md:text-sm font-medium">Növbəti səviyyə:</span>
              <div className="inline-flex items-center gap-2 px-2 py-1 md:px-3 md:py-1 rounded-full bg-white/20 border border-white/30">
                <span className="text-base md:text-lg">{nextLevel?.next_level_emoji || '⭐'}</span>
                <span className="text-white font-bold text-xs md:text-sm">
                  {nextLevel?.next_level_title || 'Növbəti'}
                </span>
              </div>
            </div>
            <span className="text-xl md:text-2xl font-black text-white drop-shadow">{progressPercentage}%</span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-3 md:h-4 bg-white/20 rounded-full overflow-hidden border-2 border-white/30">
            <div
              ref={progressBarRef}
              className={`h-full rounded-full transition-all duration-300 ease-out progress-bar-theme ${getProgressBarGradient(levelInfo.title)} shadow-lg`}
              id="level-progress-bar"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Next Level Info */}
          <div className="mt-3 md:mt-4 text-center">
            {nextLevel?.xp_needed > 0 ? (
              <p className="text-white/90 font-medium text-sm md:text-base">
                🎯 <span className="font-black text-yellow-200">{nextLevel.xp_needed} XP</span> qalıb!
              </p>
            ) : (
              <p className="text-yellow-200 font-black flex items-center justify-center gap-2 text-sm md:text-base">
                <span className="text-xl md:text-2xl">🏆</span> Maksimum səviyyədəsən!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LevelCard
