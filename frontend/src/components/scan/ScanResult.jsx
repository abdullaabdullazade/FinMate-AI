/**
 * Scan Result Component
 * Displays scanned receipt results - receipt_result.html-dəki struktur
 * Mobile responsive və səliqəli
 */

import React, { useState } from 'react'
import { toast } from '../../utils/toast'
import DeleteReceiptModal from './DeleteReceiptModal'

const ScanResult = ({ scanResult, onReset, onGoToDashboard, expenseId }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDelete = async () => {
    if (!expenseId) {
      toast.error('Qəbz ID tapılmadı', { autoClose: 5000 })
      return
    }

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      if (response.ok) {
        toast.success('✅ Qəbz uğurla silindi', { autoClose: 5000 })
        // Refresh dashboard
        window.dispatchEvent(new CustomEvent('expenseUpdated'))
        setShowDeleteModal(false)
        onReset()
      } else {
        toast.error('Xəta baş verdi', { autoClose: 5000 })
      }
    } catch (error) {
      console.error('Delete receipt error:', error)
      toast.error('Əlaqə xətası', { autoClose: 5000 })
    }
  }
  return (
    <div id="scanResult" className="w-full animate-fade-in">
      <div className="glass-card w-full max-w-2xl mx-auto relative slide-up flex flex-col">
        {/* Close Button */}
        <button
          onClick={onReset}
          className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition z-10"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-4 sm:p-6 pb-0 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-green-500/30">
            <span className="text-2xl sm:text-3xl">🧾</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Qəbz oxundu</h3>
          <p className="text-white/60 text-xs sm:text-sm">
            {scanResult.receipt_data.date_time ||
              (scanResult.receipt_data.date &&
                `${scanResult.receipt_data.date}${scanResult.receipt_data.time ? `, ${scanResult.receipt_data.time}` : ''}`) ||
              scanResult.receipt_data.date}
          </p>
        </div>

        {/* XP Award Banner */}
        {scanResult.xp_result?.xp_awarded && (
          <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">🏆</span>
              <div>
                <p className="text-white font-bold text-xs sm:text-sm">XP Awarded!</p>
                <p className="text-white/70 text-xs">For scanning receipt</p>
              </div>
            </div>
            <span className="text-lg sm:text-xl font-bold text-yellow-400">+{scanResult.xp_result.xp_awarded} XP</span>
          </div>
        )}

        {/* Coin Award Banner */}
        {scanResult.coins !== undefined && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-amber-400/20 to-yellow-500/20 border border-amber-400/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">🪙</span>
              <div>
                <p className="text-white font-bold text-xs sm:text-sm">FinMate Coin!</p>
                <p className="text-white/70 text-xs">Toplam: {scanResult.coins} coin</p>
              </div>
            </div>
            <span className="text-lg sm:text-xl font-bold text-yellow-400">+1 🪙</span>
          </div>
        )}

        {/* Milestone Celebration */}
        {scanResult.milestone_reached && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-4 sm:p-6 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-2 border-yellow-400 rounded-xl text-center animate-pulse">
            <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">{scanResult.milestone_reached.name.split(' ')[0]}</div>
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">
              {scanResult.milestone_reached.name.split(' ')[1]} Mükafat!
            </h4>
            <p className="text-white/90 text-base sm:text-lg mb-2 sm:mb-3">{scanResult.milestone_reached.reward}</p>
            <div className="flex items-center justify-center gap-2 text-yellow-300 font-bold">
              <span className="text-lg sm:text-xl">🪙</span>
              <span className="text-xl sm:text-2xl">{scanResult.milestone_reached.coins} coins</span>
            </div>
          </div>
        )}

        {/* Daily Limit Alert */}
        {scanResult.daily_limit_alert && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl">
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">🚨</span>
              <div className="flex-1">
                <p className="text-white font-bold text-xs sm:text-sm mb-1">Gündəlik Limit Keçildi!</p>
                <p className="text-white/80 text-xs">{scanResult.daily_limit_alert.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Total Amount */}
          <div className="text-center">
            <p className="text-white/60 text-xs sm:text-sm mb-1">Ümumi məbləğ</p>
            <p className="text-3xl sm:text-4xl font-bold text-white">
              {parseFloat(scanResult.receipt_data.total || 0).toFixed(2)}{' '}
              <span className="text-lg sm:text-xl text-white/60">AZN</span>
            </p>
            {scanResult.conversion_note && (
              <>
                <p className="text-xs text-white/50 mt-1">
                  Orijinal:{' '}
                  {parseFloat(
                    scanResult.receipt_data.total_original || scanResult.receipt_data.total || 0
                  ).toFixed(2)}{' '}
                  {scanResult.receipt_data.original_currency || scanResult.receipt_data.currency || 'AZN'}
                </p>
                <p className="text-xs text-green-300 mt-1">{scanResult.conversion_note}</p>
              </>
            )}
          </div>

          {/* Merchant & Category */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white/5 rounded-xl p-2 sm:p-3 border border-white/10">
              <p className="text-xs text-white/50 mb-1">Satıcı</p>
              <p className="text-white font-medium text-sm sm:text-base truncate">{scanResult.receipt_data.merchant}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 sm:p-3 border border-white/10">
              <p className="text-xs text-white/50 mb-1">Kateqoriya</p>
              <span className="inline-block px-2 py-0.5 bg-blue-500/30 text-blue-200 rounded text-xs font-medium truncate max-w-full">
                {scanResult.receipt_data.suggested_category}
              </span>
            </div>
          </div>

          {/* Items List */}
          {scanResult.receipt_data.items && scanResult.receipt_data.items.length > 0 && (
            <div>
              <p className="text-sm text-white/70 mb-2 sm:mb-3 font-medium">Məhsullar</p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                {scanResult.receipt_data.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-white/5 rounded-lg p-2 sm:p-3 hover:bg-white/10 transition"
                  >
                    <span className="text-white/90 text-xs sm:text-sm flex-1 mr-2 truncate">
                      {item.name || item.item || 'Məhsul'}
                    </span>
                    <span className="text-white font-bold text-xs sm:text-sm whitespace-nowrap">
                      {parseFloat(item.price || 0).toFixed(2)} AZN
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-6 pt-0 mt-auto">
          <button
            onClick={() => {
              if (typeof window.openSplitBill === 'function') {
                window.openSplitBill(
                  scanResult.receipt_data.total,
                  scanResult.receipt_data.items || []
                )
              } else {
                toast.info('Split bill funksiyası tezliklə əlavə olunacaq', {
                  position: 'top-right',
                  autoClose: 5000,
                })
              }
            }}
            className="block w-full mb-3 bg-white/10 hover:bg-white/20 text-white text-center py-3 sm:py-3.5 rounded-xl font-bold transition text-sm sm:text-base"
          >
            🤝 Dostlarla böl
          </button>
          <button
            onClick={onGoToDashboard}
            className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center py-3 sm:py-3.5 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition shadow-lg shadow-blue-500/25 text-sm sm:text-base mb-3"
          >
            Lövhəyə qayıt
          </button>
          {expenseId && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="block w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-center py-3 sm:py-3.5 rounded-xl font-bold transition text-sm sm:text-base mb-3"
            >
              🗑️ Qəbzi Sil
            </button>
          )}
          <button
            onClick={onReset}
            className="block w-full text-white/50 text-xs sm:text-sm text-center mt-3 sm:mt-4 hover:text-white transition"
          >
            Başqa qəbz skan et
          </button>
        </div>
      </div>

      {/* Delete Receipt Modal */}
      <DeleteReceiptModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        receiptInfo={{
          merchant: scanResult.receipt_data.merchant,
          total: scanResult.receipt_data.total
        }}
      />
    </div>
  )
}

export default ScanResult

