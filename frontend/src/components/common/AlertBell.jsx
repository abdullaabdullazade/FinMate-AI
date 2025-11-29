/**
 * Alert Bell Component
 * base.html-dən bir-bir köçürülmüş - Alert panel və counter
 * Notifications-ı yaxşılaşdırılmış versiya
 */

import React, { useState, useEffect, useRef } from 'react'
import { BellIcon, CloseIcon } from '../icons/Icons'

const AlertBell = () => {
  const [showPanel, setShowPanel] = useState(false)
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'Diqqət: Keçən aya görə 15% çox xərcləmisən.', icon: '⚠️', color: 'text-amber-500' },
    { id: 2, type: 'info', message: 'Netflix abunəliyin sabah bitir.', icon: '🎬', color: 'text-blue-500' },
    { id: 3, type: 'forecast', message: '28-ində büdcə limitini keçə bilərsən.', icon: '📈', color: 'text-blue-500' },
  ])
  const panelRef = useRef(null)
  const bellRef = useRef(null)

  // Alert sayını hesabla
  const alertCount = alerts.length

  // Alert sil - base.html-dəki kimi
  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showPanel &&
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setShowPanel(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPanel])

  // Prevent panel clicks from closing
  const handlePanelClick = (e) => {
    e.stopPropagation()
  }

  return (
    <>
      <button
        ref={bellRef}
        id="alert-bell"
        className="relative text-white/80 hover:text-white transition p-1"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowPanel(!showPanel)
        }}
      >
        <BellIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        {alertCount > 0 && (
          <span
            id="alert-counter"
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg"
          ></span>
        )}
      </button>

      {/* Alert Panel - Altdan göstərilir (bottom notification) */}
      {showPanel && (
        <div
          ref={panelRef}
          id="alert-panel"
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-80 sm:w-96 max-w-[90vw] glass-card rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-50 max-h-[60vh] overflow-y-auto"
          style={{
            background: 'var(--glass-bg)',
            borderColor: 'var(--glass-border)',
            boxShadow: '0 25px 50px -12px var(--glass-shadow)',
          }}
          onClick={handlePanelClick}
        >
          <div className="px-4 py-3 border-b border-white/10 text-sm font-semibold text-white">Bildirişlər (AI)</div>
          <ul className="divide-y divide-white/10 text-sm">
            {alerts.length === 0 ? (
              <li className="px-4 py-3 text-center text-white/50">Bildiriş yoxdur</li>
            ) : (
              alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="px-4 py-3 flex gap-2 items-start group hover:bg-white/5 transition-colors"
                >
                  <span className={`flex-shrink-0 text-xl ${alert.color || 'text-white'}`}>{alert.icon}</span>
                  <div className="flex-1 incognito-hidden text-white/90" data-original={alert.message}>
                    {alert.message}
                  </div>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-white flex-shrink-0 p-1"
                    aria-label="Bağla"
                    title="Ləğv et"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </>
  )
}

export default AlertBell
