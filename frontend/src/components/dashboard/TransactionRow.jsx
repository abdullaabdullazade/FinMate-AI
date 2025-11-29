/**
 * Transaction Row Component
 * transaction_row.html-dən köçürülmüşdür
 * framer-motion ilə animasiya
 */

import React, { useState, useContext } from 'react'
import { motion } from 'framer-motion'
import { Edit2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { TransactionContext } from './RecentTransactions'

const TransactionRow = ({ expense, onEdit, onDelete, currency = '₼' }) => {
  const { expandedId, setExpandedId } = useContext(TransactionContext) || { expandedId: null, setExpandedId: () => {} }
  const isExpanded = expandedId === expense.id

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
    const category = expense.category || expense.category_name || ''
    if (
      category?.includes('Qənaət') ||
      category?.toLowerCase().includes('qənaət') ||
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

  const hasItems = expense.items && Array.isArray(expense.items) && expense.items.length > 0
  const isIncome = expense.type === 'income'

  // Handle accordion effect - close others when opening this one
  const handleToggle = () => {
    if (!hasItems || isIncome) return // Income-lar expand olunmur
    
    if (isExpanded) {
      setExpandedId(null)
    } else {
      // Close any other expanded transaction
      setExpandedId(expense.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-2 sm:py-3 border-b border-white/10 rounded-lg transition group"
      id={`expense-${expense.id}`}
    >
      <div
        className={`flex items-center justify-between hover:bg-white/5 px-2 py-2 rounded-lg transition ${
          hasItems && !isIncome ? 'cursor-pointer' : ''
        } transaction-header`}
        onClick={hasItems && !isIncome ? handleToggle : undefined}
        data-transaction-id={`txn-${expense.id}`}
        data-target={`items-txn-${expense.id}`}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className={`merchant-logo ${getCategoryClass(expense.category || expense.category_name, expense.merchant)}`}>
            <span className="money-icon-display">
              {expense.type === 'income' ? '💰' : getIcon()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm sm:text-base truncate">{expense.merchant}</p>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <p className="text-xs text-white/60 truncate">
                {expense.category || expense.category_name || 'Digər'} • {formatDate(expense.date)}
              </p>
              {expense.type === 'income' && expense.description && (
                <span className="text-xs bg-green-500/30 text-green-200 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                  {expense.description}
                </span>
              )}
              {hasItems && (
                <span className="text-xs bg-purple-500/30 text-purple-200 px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                  {expense.items.length} məhsul
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <span
            className={`font-bold text-sm sm:text-base incognito-hidden ${
              expense.type === 'income' ? 'text-green-400' : 'text-white'
            }`}
          >
            {expense.type === 'income' ? '+' : ''}
            {expense.amount?.toFixed(2) || '0.00'} {currency}
          </span>

          {expense.type !== 'income' && (
            <>
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
            </>
          )}

          {hasItems && (
            <svg
              className={`w-4 h-4 sm:w-5 sm:h-5 text-white/50 transition-transform expand-icon flex-shrink-0 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          )}
        </div>
      </div>

      {hasItems && (
        <div
          className={`transaction-items mt-2 sm:mt-3 pl-0 md:pl-[60px] transition-all duration-300 ${
            isExpanded ? '' : 'hidden'
          }`}
          id={`items-txn-${expense.id}`}
          data-parent={`txn-${expense.id}`}
        >
          <div className="bg-white/5 rounded-lg p-2 sm:p-3 text-xs border border-white/10 animate-slideDown">
            <p className="text-white/50 mb-2 font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                ></path>
              </svg>
              Məhsullar ({expense.items.length})
            </p>
            <ul className="space-y-1.5" id={`items-list-txn-${expense.id}`}>
              {expense.items.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between text-white/70 py-1 border-b border-white/5 last:border-0"
                >
                  <span className="flex-1">
                    {index + 1}. {item.name || item.item_name || 'Naməlum məhsul'}
                  </span>
                  <span className="font-medium text-white">
                    {(item.price || item.item_price || 0).toFixed(2)} {currency}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default TransactionRow

