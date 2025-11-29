/**
 * Transaction Row Component
 * transaction_row.html-dən köçürülmüşdür
 * framer-motion ilə animasiya
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, Trash2, ChevronDown, Package } from 'lucide-react'
import { toast } from 'sonner'

const TransactionRow = ({ expense, onEdit, onDelete, currency = '₼' }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Category class müəyyən et
  const getCategoryClass = (category, merchant) => {
    if (
      category?.includes('Qənaət') ||
      category?.toLowerCase().includes('qənaət') ||
      merchant?.includes('Arzu')
    ) {
      return 'category-savings'
    } else if (category?.includes('Market') || merchant?.includes('Bravo') || merchant?.includes('Araz')) {
      return 'category-market'
    } else if (category?.includes('Restoran') || merchant?.includes('KFC') || merchant?.includes('McDonald')) {
      return 'category-restoran'
    } else if (category?.includes('Kafe') || merchant?.includes('Coffee') || merchant?.includes('Starbucks')) {
      return 'category-kafe'
    } else if (category?.includes('Nəqliyyat') || merchant?.includes('Bolt') || merchant?.includes('Uber')) {
      return 'category-transport'
    } else if (category?.includes('Mobil') || category?.includes('İnternet')) {
      return 'category-mobile'
    } else if (category?.includes('Kommunal')) {
      return 'category-kommunal'
    } else if (category?.includes('Geyim') || category?.includes('Alış-veriş')) {
      return 'category-shopping'
    } else if (category?.includes('Online') || merchant?.includes('AliExpress')) {
      return 'category-online'
    } else if (category?.includes('Əyləncə') || merchant?.includes('Netflix')) {
      return 'category-entertainment'
    } else if (category?.includes('Aptək') || category?.includes('İdman')) {
      return 'category-health'
    } else if (category?.includes('Bank') || category?.includes('E-ödəniş') || merchant?.includes('Kapital')) {
      return 'category-bank'
    }
    return 'bg-gradient-to-br from-gray-400 to-gray-600'
  }

  // Icon müəyyən et
  const getIcon = () => {
    if (
      expense.category?.includes('Qənaət') ||
      expense.category?.toLowerCase().includes('qənaət') ||
      expense.merchant?.includes('Arzu')
    ) {
      return '💰'
    } else if (expense.notes && expense.notes.length <= 2) {
      return expense.notes
    } else if (expense.notes && expense.notes.length > 2 && /[💰💵💸💳💴💶💷💴🪙💎]/.test(expense.notes[0])) {
      return expense.notes[0]
    }
    return '💰'
  }

  // Tarix formatla
  const formatDate = (dateString) => {
    if (!dateString) return 'Tarix yoxdur'
    const date = new Date(dateString)
    return date.toLocaleDateString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const hasItems = expense.items && expense.items.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-2 sm:py-3 border-b border-white/10 rounded-lg transition group"
    >
      <div
        className="flex items-center justify-between hover:bg-white/5 px-2 py-2 rounded-lg transition cursor-pointer transaction-header"
        onClick={() => hasItems && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className={`merchant-logo ${getCategoryClass(expense.category, expense.merchant)}`}>
            <span className="money-icon-display">{getIcon()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm sm:text-base truncate">{expense.merchant}</p>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <p className="text-xs text-white/60 truncate">
                {expense.category} • {formatDate(expense.date)}
              </p>
              {hasItems && (
                <span className="text-xs bg-purple-500/30 text-purple-200 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                  {expense.items.length} məhsul
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <span className="text-white font-bold text-sm sm:text-base incognito-hidden">
            {expense.amount?.toFixed(2) || '0.00'} {currency}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(expense)
            }}
            className="transition-opacity text-blue-400 hover:text-blue-300 p-1.5 sm:p-2 rounded-lg hover:bg-blue-500/10 flex-shrink-0"
            title="Düzəliş et"
          >
            <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(expense.id)
            }}
            className="transition-opacity text-red-400 hover:text-red-300 p-1.5 sm:p-2 rounded-lg hover:bg-red-500/10 flex-shrink-0"
            title="Sil"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {hasItems && (
            <ChevronDown
              className={`w-4 h-4 sm:w-5 sm:h-5 text-white/50 transition-transform expand-icon flex-shrink-0 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && hasItems && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 sm:mt-3 pl-0 md:pl-[60px] overflow-hidden"
          >
            <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-xs border border-white/10 animate-slideDown">
              <p className="text-white/50 mb-2 font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Məhsullar ({expense.items.length})
              </p>
              <ul className="space-y-1.5">
                {expense.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-between text-white/70 py-1 border-b border-white/5 last:border-0"
                  >
                    <span className="flex-1">
                      {index + 1}. {item.name}
                    </span>
                    <span className="font-medium text-white">
                      {item.price?.toFixed(2) || '0.00'} {currency}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default TransactionRow

