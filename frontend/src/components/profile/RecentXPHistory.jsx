/**
 * Recent XP History Component
 * profile.html-dəki recent XP history strukturunu təkrarlayır
 */

import React from 'react'

const RecentXPHistory = ({ xpLogs }) => {
  const getActionIcon = (actionType) => {
    if (actionType === 'manual_expense') return '📝'
    if (actionType === 'scan_receipt') return '🧾'
    if (actionType === 'chat_message') return '💬'
    if (actionType === 'login_streak') return '🔥'
    if (actionType?.includes('dream')) return '✨'
    return '⭐'
  }

  const getActionLabel = (actionType) => {
    if (actionType === 'manual_expense') return 'Xərc əlavə edildi'
    if (actionType === 'scan_receipt') return 'Çek skan edildi'
    if (actionType === 'chat_message') return 'AI söhbət'
    if (actionType === 'login_streak') return 'Giriş seriyası'
    if (actionType === 'create_dream') return 'Arzu yaradıldı'
    if (actionType === 'complete_dream') return 'Arzu tamamlandı'
    if (actionType === 'budget_set') return 'Büdcə təyin edildi'
    if (actionType === 'profile_update') return 'Profil yeniləndi'
    return actionType?.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Fəaliyyət'
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      const day = date.getDate().toString().padStart(2, '0')
      const monthNames = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek']
      const month = monthNames[date.getMonth()] || ''
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${day} ${month} ${hours}:${minutes}`
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="glass-card p-4 sm:p-6 slide-up" style={{ animationDelay: '0.15s' }}>
      <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Son aktivlik</h3>
      <div className="space-y-1.5 max-h-48 sm:max-h-64 overflow-y-auto custom-scrollbar pr-2">
        {xpLogs && xpLogs.length > 0 ? (
          xpLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors duration-200 group"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-base flex-shrink-0 group-hover:scale-110 transition-transform">
                  {getActionIcon(log.action_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{getActionLabel(log.action_type)}</p>
                  <p className="text-[10px] text-white/40">{formatDate(log.created_at)}</p>
                </div>
              </div>
              <span className="text-green-400 font-bold text-xs xp-amount-theme flex-shrink-0 ml-2">
                +{log.amount}
              </span>
            </div>
          ))
        ) : (
          <p className="text-white/50 text-center py-4 text-sm">Hələ aktivlik yoxdur.</p>
        )}
      </div>
    </div>
  )
}

export default RecentXPHistory
