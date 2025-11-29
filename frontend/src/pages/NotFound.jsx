/**
 * 404 Not Found Page Component
 */

import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-white/20">404</h1>
        <h2 className="text-3xl font-bold text-white mt-4">Səhifə tapılmadı</h2>
        <p className="text-white/70 mt-2">Axtardığınız səhifə mövcud deyil</p>
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
        >
          Ana səhifəyə qayıt
        </Link>
      </div>
    </div>
  )
}

export default NotFound

