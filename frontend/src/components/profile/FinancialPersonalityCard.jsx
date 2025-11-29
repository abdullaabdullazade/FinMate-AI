/**
 * Financial Personality Card Component
 * profile.html-dəki personality-card strukturunu təkrarlayır
 */

import React from 'react'

const FinancialPersonalityCard = ({ personality }) => {
  if (!personality) return null

  return (
    <div
      id="personality-card"
      className="persona-card p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl slide-up text-center relative overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <p className="text-white/70 text-sm mb-2">Maliyyə Şəxsiyyətin</p>
        <div className="text-7xl mb-4">{personality.emoji}</div>
        <h2 className="text-4xl font-bold text-white mb-3">{personality.title}</h2>
        <p className="text-white/90 text-lg italic mb-6">"{personality.quote}"</p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{personality.top_category}</p>
            <p className="text-sm text-white/70">Ən çox xərclədiyin</p>
          </div>
          <div className="w-px h-12 bg-white/30"></div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{personality.spending_score}/10</p>
            <p className="text-sm text-white/70">Xərc reytinqi</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinancialPersonalityCard
