/**
 * 404 Not Found Page Component
 * templates/404.html-dən bir-bir köçürülmüş
 * CSS və animasiyalar daxildir
 */

import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/pages/404.css'

const NotFound = () => {
  useEffect(() => {
    // Falling tears animation - CSS-də təyin olunub
    const tears = document.querySelectorAll('.tear')
    tears.forEach((tear, index) => {
      tear.style.animationDelay = `${index * 0.3}s`
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Crying Pet - templates/404.html sətir 8-23 */}
        <div className="mb-8">
          <div className="inline-block relative">
            {/* Main Pet Emoji */}
            <div className="text-9xl mb-4 animate-bounce">
              😭
            </div>

            {/* Falling Tears Animation */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
              <div className="tear tear-1">💧</div>
              <div className="tear tear-2">💧</div>
              <div className="tear tear-3">💧</div>
            </div>
          </div>
        </div>

        {/* Error Code - templates/404.html sətir 25-28 */}
        <h1 className="text-8xl font-black text-white mb-6 drop-shadow-2xl">
          404
        </h1>

        {/* Main Message - templates/404.html sətir 30-41 */}
        <div className="glass-card p-8 rounded-3xl mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ups! Deyəsən pulun bitdiyi kimi, bu səhifə də bitib! 💸
          </h2>
          <p className="text-white/80 text-lg mb-6">
            Axtardığınız səhifə mövcud deyil və ya başqa yerə köçüb.
          </p>
          <p className="text-white/60 text-sm">
            Belə olsun, gəl Dashboard-a qayıdaq və maliyyəmizə baxaq! 📊
          </p>
        </div>

        {/* Action Buttons - templates/404.html sətir 43-66 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard-a Qayıt
          </Link>

          <Link
            to="/scan"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-2xl border-2 border-white/30 transition-all flex items-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Çek Skan Et
          </Link>
        </div>

        {/* Fun Fact - templates/404.html sətir 68-76 */}
        <div className="mt-12 glass-card p-6 rounded-2xl bg-white/5">
          <p className="text-white/70 text-sm mb-2">
            💡 <strong>Bilirdinizmi?</strong>
          </p>
          <p className="text-white/60 text-sm">
            404 səhifəsi tapmaq heç də pis deyil - ən azı sistemin işlədiyini göstərir! 😊
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound

