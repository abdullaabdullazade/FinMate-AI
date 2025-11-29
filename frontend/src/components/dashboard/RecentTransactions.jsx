/**
 * Recent Transactions Component
 * HTML-dən köçürülmüş - Son əməliyyatlar kartı
 */

import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import TransactionRow from './TransactionRow'

const RecentTransactions = ({ transactions, currency = '₼', onEdit, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="glass-card p-4 sm:p-6 slide-up"
      style={{ gridColumn: 'span 12' }}
    >
      <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Son əməliyyatlar</h3>
      <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
        {!transactions || transactions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-2xl">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-white/60 text-sm">Hələ əməliyyat yoxdur</p>
            <Link
              to="/scan"
              className="inline-block mt-4 text-sm text-blue-300 hover:text-blue-200 font-medium"
            >
              İlk çekini skan et →
            </Link>
          </div>
        ) : (
          transactions.map((expense, index) => (
            <TransactionRow
              key={expense.id || index}
              expense={expense}
              onEdit={onEdit}
              onDelete={onDelete}
              currency={currency}
            />
          ))
        )}
      </div>
    </motion.div>
  )
}

export default RecentTransactions

