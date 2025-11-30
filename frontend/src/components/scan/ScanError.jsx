/**
 * Scan Error Component
 * Mobile responsive - AI error zamanı "Yenidən yoxlayın" düyməsi ilə
 */

import React from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'

const ScanError = ({ error, onReset }) => {
  // AI error olub-olmadığını yoxla
  const isAIError = error?.error && (
    error.error.includes('AI') || 
    error.error.includes('oxumaq') || 
    error.error.includes('tanımaq') ||
    error.error.includes('naməlum') ||
    error.error.includes('xəta') ||
    !error.is_not_receipt
  )

  return (
    <div id="error-result" className="w-full animate-fade-in">
      <div className="glass-card w-full max-w-2xl mx-auto p-4 sm:p-6 relative slide-up bg-red-500/10 border-red-500/30">
        <button 
          onClick={onReset} 
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-white/70 hover:text-white text-lg sm:text-xl transition-colors"
          aria-label="Bağla"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-red-500/30">
            {error.is_not_receipt ? (
              <span className="text-2xl sm:text-3xl">📄</span>
            ) : (
              <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-400" />
            )}
          </div>
          
          {error.is_not_receipt ? (
            <>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Qəbz deyil</h3>
              <p className="text-white/70 text-sm sm:text-base mb-4 sm:mb-6">
                Bu şəkil qəbz kimi tanınmadı. Xahiş edirik qəbz şəkli yükləyin və yenidən cəhd edin.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">AI qəbzi oxuya bilmədi</h3>
              <p className="text-white/70 text-sm sm:text-base mb-3 sm:mb-4">
                {error.error || 'Qəbzi oxumaq alınmadı. Zəhmət olmasa yenidən yoxlayın.'}
              </p>
              {isAIError && (
                <p className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-6">
                  Şəkil keyfiyyəti aşağı ola bilər və ya qəbz formatı dəstəklənmir.
                </p>
              )}
            </>
          )}

          {/* Yenidən yoxlayın düyməsi - Daha görünən */}
          <button
            onClick={onReset}
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 sm:py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Zəhmət olmasa yenidən yoxlayın</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScanError

