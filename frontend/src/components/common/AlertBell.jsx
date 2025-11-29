/**
 * Alert Bell Component
 * alerts.js-dən köçürülmüşdür
 * Alert panel və counter
 */

import React, { useState, useEffect, useRef } from 'react'
import { BellIcon, CloseIcon } from '../icons/Icons'

const AlertBell = () => {
  const [showPanel, setShowPanel] = useState(false)
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'Diqqət: Keçən aya görə 15% çox xərcləmisən.', icon: '⚠️' },
    { id: 2, type: 'info', message: 'Netflix abunəliyin sabah bitir.', icon: '🎬' },
    { id: 3, type: 'forecast', message: '28-ində büdcə limitini keçə bilərsən.', icon: '📈' },
  ])
  const panelRef = useRef(null)
  const bellRef = useRef(null)

  // Alert sayını hesabla
  const alertCount = alerts.length

  // Alert sil
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

      {/* Alert Panel */}
      {showPanel && (
        <div
          ref={panelRef}
          id="alert-panel"
          className="absolute right-14 top-10 w-64 bg-white text-gray-900 rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          onClick={handlePanelClick}
        >
          <div className="px-4 py-3 border-b text-sm font-semibold">Bildirişlər (AI)</div>
          <ul className="divide-y text-sm">
            {alerts.length === 0 ? (
              <li className="px-4 py-3 text-center text-gray-500">Bildiriş yoxdur</li>
            ) : (
              alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="px-4 py-3 flex gap-2 items-start group hover:bg-gray-50 transition-colors"
                >
                  <span className="flex-shrink-0">{alert.icon}</span>
                  <div className="flex-1">{alert.message}</div>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
                    aria-label="Bağla"
                    title="Ləğv et"
                  >
                    <CloseIcon className="w-4 h-4" />
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
