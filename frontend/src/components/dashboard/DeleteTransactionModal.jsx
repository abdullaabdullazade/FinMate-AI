/**
 * Delete Transaction Modal Component
 * Gözəl UI ilə əməliyyat silmə təsdiq modalı
 */

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, X, AlertTriangle } from 'lucide-react'
import { toast } from 'react-toastify'

const DeleteTransactionModal = ({ isOpen, onClose, transaction, onConfirm, currency = '₼' }) => {
  const [deleting, setDeleting] = React.useState(false)

  if (!isOpen || !transaction) return null

  const handleDelete = async () => {
    setDeleting(true)
    try {
      // Income-lar üçün id fərqli ola bilər (income_ prefix ilə)
      let expenseId = transaction.id
      if (typeof expenseId === 'string' && expenseId.startsWith('income_')) {
        expenseId = expenseId.replace('income_', '')
      }
      
      await onConfirm(expenseId)
      toast.success('✅ Əməliyyat uğurla silindi', { autoClose: 5000 })
      onClose()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Xəta baş verdi', { autoClose: 5000 })
    } finally {
      setDeleting(false)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = date.getDate()
    const month = date.toLocaleString('az-AZ', { month: 'short' })
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  // Get transaction type - income-lar silinə bilməz
  const isIncome = transaction.type === 'income'
  
  // Income-lar üçün modal göstərmə
  if (isIncome) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass-card overflow-hidden shadow-2xl relative rounded-3xl"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition p-2 rounded-full hover:bg-white/10 z-10"
                aria-label="Bağla"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="p-6 sm:p-8">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
                  Əməliyyatı silmək istəyirsiniz?
                </h2>

                {/* Description */}
                <p className="text-white/70 text-center text-sm sm:text-base mb-6">
                  Bu əməliyyat silindikdən sonra geri qaytarıla bilməz.
                </p>

                {/* Transaction Details */}
                <div className="glass-card p-4 sm:p-5 rounded-2xl mb-6 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                      isIncome ? 'bg-green-500/20' : 'bg-blue-500/20'
                    }`}>
                      {isIncome ? '💰' : '💸'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-base sm:text-lg truncate">
                        {transaction.merchant}
                      </p>
                      <p className="text-white/60 text-xs sm:text-sm">
                        {transaction.category || transaction.category_name || 'Digər'} • {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-white/70 text-sm">Məbləğ:</span>
                    <span className={`font-bold text-lg sm:text-xl ${
                      isIncome ? 'text-green-400' : 'text-white'
                    }`}>
                      {isIncome ? '+' : ''}
                      {transaction.amount?.toFixed(2) || '0.00'} {currency}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={deleting}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 sm:py-4 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    Ləğv et
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white py-3 sm:py-4 rounded-xl font-bold shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    {deleting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Silinir...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" />
                        <span>Sil</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default DeleteTransactionModal

