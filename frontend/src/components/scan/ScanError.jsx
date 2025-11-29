/**
 * Scan Error Component
 * Displays error messages - receipt_result.html-dəki struktur
 * Mobile responsive
 */

import React from 'react'

const ScanError = ({ error, onReset }) => {
  return (
    <div id="error-result" className="w-full animate-fade-in">
      <div className="glass-card w-full max-w-2xl mx-auto p-4 sm:p-6 relative slide-up bg-red-500/10 border-red-500/30">
        <button onClick={onReset} className="absolute top-3 sm:top-4 right-3 sm:right-4 text-white/70 hover:text-white text-lg sm:text-xl">
          ✕
        </button>

        <div className="text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-red-500/30">
            {error.is_not_receipt ? (
              <span className="text-2xl sm:text-3xl">📄</span>
            ) : (
              <span className="text-2xl sm:text-3xl">❌</span>
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
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Xəta baş verdi</h3>
              <p className="text-white/70 text-sm sm:text-base mb-4 sm:mb-6">
                {error.error || 'Qəbzi oxumaq alınmadı, yenidən cəhd edin.'}
              </p>
            </>
          )}

          <button
            onClick={onReset}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 sm:py-3 rounded-xl font-medium transition text-sm sm:text-base"
          >
            Yenidən cəhd et
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScanError

