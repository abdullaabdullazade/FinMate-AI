/**
 * Upload Buttons Component
 * File upload and camera capture buttons - Mobile responsive
 */

import React, { useRef } from 'react'

const UploadButtons = ({ onFileSelect }) => {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 slide-up" style={{ animationDelay: '0.1s' }}>
      {/* Fayl Yüklə */}
      <label className="group cursor-pointer border-2 border-dashed border-white/30 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/5 hover:border-green-500 transition-all duration-300 relative z-20 block bg-black/20">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-green-500/20 transition-all">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        </div>
        <p className="text-white font-bold text-base sm:text-lg mb-1">Fayl Yüklə</p>
        <p className="text-white/40 text-xs uppercase tracking-wider">PNG, JPG, PDF</p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => onFileSelect(e.target)}
        />
      </label>

      {/* Kamera */}
      <label className="group cursor-pointer border-2 border-dashed border-white/30 rounded-2xl p-6 sm:p-8 text-center hover:bg-white/5 hover:border-purple-500 transition-all duration-300 relative z-20 block bg-black/20">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-white font-bold text-base sm:text-lg mb-1">Kamera</p>
        <p className="text-white/40 text-xs uppercase tracking-wider">Şəkil Çək</p>
        <input
          ref={cameraInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          capture="environment"
          onChange={(e) => onFileSelect(e.target)}
        />
      </label>
    </div>
  )
}

export default UploadButtons

