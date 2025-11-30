/**
 * Alert Bell Component
 * WebSocket ilə real-time bildirişlər - Backend notifications.py-dən məlumat alır
 */

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { BellIcon, CloseIcon } from '../icons/Icons'
import { notificationsAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

const AlertBell = () => {
  const { user } = useAuth()
  const [showPanel, setShowPanel] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const panelRef = useRef(null)
  const bellRef = useRef(null)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  // Backend-dən notifications yüklə
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await notificationsAPI.getNotifications()
      
      if (response && response.notifications) {
        // Backend formatını frontend formatına çevir
        const formattedAlerts = response.notifications.map((notif, index) => ({
          id: index + 1,
          type: notif.color?.includes('red') ? 'error' : 
                notif.color?.includes('amber') ? 'warning' : 
                notif.color?.includes('green') ? 'success' : 'info',
          message: notif.message,
          icon: notif.icon || '📢',
          color: `text-${notif.color || 'blue-500'}`,
        }))
        
        setAlerts(formattedAlerts)
      }
    } catch (err) {
      console.error('Notifications fetch error:', err)
      setError('Bildirişlər yüklənə bilmədi')
      // Error olduqda boş array set et
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  // WebSocket connection - FIX: isConnected dependency-dən çıxardıq
  useEffect(() => {
    if (!user || !user.id) return

    // Əgər artıq bağlantı varsa, yeni bağlantı açma
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8200'
    const wsUrl = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://')
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5
    
    const connectWebSocket = () => {
      // Əgər artıq bağlantı varsa, yeni bağlantı açma
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        return
      }

      try {
        // Köhnə bağlantını bağla
        if (wsRef.current) {
          wsRef.current.close()
        }

        const ws = new WebSocket(`${wsUrl}/ws/notifications?user_id=${user.id}`)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('✅ WebSocket connected')
          setIsConnected(true)
          reconnectAttempts = 0 // Reset reconnect attempts
          // Clear reconnect timeout
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
          }
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            // Yeni tək bildiriş gəldi (scan, coin, və s.)
            if (data.type === 'new_notification' && data.notification) {
              const newNotif = data.notification
              const formattedAlert = {
                id: `new-${Date.now()}-${Math.random()}`,
                type: newNotif.color?.includes('red') ? 'error' : 
                      newNotif.color?.includes('amber') ? 'warning' : 
                      newNotif.color?.includes('green') ? 'success' : 'info',
                message: newNotif.message,
                icon: newNotif.icon || '📢',
                color: `text-${newNotif.color || 'blue-500'}`,
                timestamp: Date.now(),
                isNew: true,
              }
              
              // Yeni bildirişi əlavə et
              setAlerts(prev => {
                // Köhnə bildirişləri saxla, yenisini əlavə et
                const updated = [formattedAlert, ...prev]
                // Maksimum 20 bildiriş saxla
                return updated.slice(0, 20)
              })
              
              // Unread count artır
              setUnreadCount(prev => prev + 1)
              
              // Visual feedback - badge animasiyası
              if (!showPanel) {
                const badge = document.getElementById('alert-counter')
                if (badge) {
                  badge.classList.add('animate-pulse', 'scale-110')
                  setTimeout(() => {
                    badge.classList.remove('animate-pulse', 'scale-110')
                  }, 2000)
                }
              }
              
              setLoading(false)
            }
            // Bütün bildirişlər yeniləndi
            else if (data.type === 'notifications' && data.notifications) {
              // Backend formatını frontend formatına çevir
              const formattedAlerts = data.notifications.map((notif, index) => ({
                id: `${notif.icon}-${index}-${Date.now()}`,
                type: notif.color?.includes('red') ? 'error' : 
                      notif.color?.includes('amber') ? 'warning' : 
                      notif.color?.includes('green') ? 'success' : 'info',
                message: notif.message,
                icon: notif.icon || '📢',
                color: `text-${notif.color || 'blue-500'}`,
                timestamp: Date.now(),
                isNew: false,
              }))
              
              const newCount = data.count || formattedAlerts.length
              
              setAlerts(formattedAlerts)
              // Yalnız panel açıq deyilsə unread count artır
              if (!showPanel) {
                setUnreadCount(newCount)
              }
              
              setLoading(false)
            }
          } catch (err) {
            console.error('WebSocket message parse error:', err)
          }
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          setIsConnected(false)
        }

        ws.onclose = (event) => {
          console.log('WebSocket disconnected', event.code, event.reason)
          setIsConnected(false)
          
          // Yalnız normal bağlanma deyilsə reconnect et (code 1000 = normal close)
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++
            const delay = Math.min(3000 * reconnectAttempts, 30000) // Exponential backoff, max 30s
            console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})...`)
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connectWebSocket()
            }, delay)
          } else if (reconnectAttempts >= maxReconnectAttempts) {
            console.log('Max reconnect attempts reached, falling back to HTTP polling')
            // Fallback to HTTP polling
            fetchNotifications()
          }
        }
      } catch (err) {
        console.error('WebSocket connection error:', err)
        setIsConnected(false)
        // Fallback to HTTP polling
        fetchNotifications()
      }
    }

    // Initial connection
    connectWebSocket()

    // Fallback: HTTP polling every 30 seconds if WebSocket fails
    const interval = setInterval(() => {
      if (!isConnected && (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)) {
        fetchNotifications()
      }
    }, 30000)

    // Event listeners - dashboard refresh olduqda notifications-u yenilə
    const handleRefresh = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Send ping to trigger notification refresh
        wsRef.current.send('ping')
      } else {
        fetchNotifications()
      }
    }
    
    window.addEventListener('expenseUpdated', handleRefresh)
    window.addEventListener('incomeUpdated', handleRefresh)
    window.addEventListener('scanCompleted', handleRefresh)
    
    return () => {
      clearInterval(interval)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      if (wsRef.current) {
        try {
          wsRef.current.close(1000, 'Component unmounting')
        } catch (e) {
          // Ignore close errors
        }
        wsRef.current = null
      }
      window.removeEventListener('expenseUpdated', handleRefresh)
      window.removeEventListener('incomeUpdated', handleRefresh)
      window.removeEventListener('scanCompleted', handleRefresh)
    }
  }, [user]) // FIX: isConnected dependency-dən çıxardıq

  // Hamburger menu açıq olduqda panel-i bağla
  useEffect(() => {
    const menuPanel = document.getElementById('menu-panel')
    const checkMenuState = () => {
      if (menuPanel && menuPanel.classList.contains('active') && showPanel) {
        setShowPanel(false)
      }
    }

    const observer = new MutationObserver(checkMenuState)
    if (menuPanel) {
      observer.observe(menuPanel, {
        attributes: true,
        attributeFilter: ['class']
      })
    }

    return () => {
      observer.disconnect()
    }
  }, [showPanel])

  // Alert sayını hesabla - unread count istifadə et
  const alertCount = unreadCount > 0 ? unreadCount : alerts.length

  // Alert sil - local state-dən sil (backend-də silinməyəcək, yalnız UI-dan gizlədilir)
  const removeAlert = (id) => {
    setAlerts((prev) => {
      const filtered = prev.filter((alert) => alert.id !== id)
      // Unread count-u yenilə
      setUnreadCount(filtered.length)
      return filtered
    })
  }
  
  // Panel açıldıqda unread count-u sıfırla (bütün bildirişlər oxunmuş sayılır)
  useEffect(() => {
    if (showPanel) {
      // Panel açıldıqda unread count-u sıfırla - badge rəqəmi getsin
      setUnreadCount(0)
      // Alerts-dəki isNew flag-lərini false et
      setAlerts(prev => prev.map(alert => ({ ...alert, isNew: false })))
    }
  }, [showPanel])

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

    if (showPanel) {
      // setTimeout ilə əlavə et ki, click event-i düzgün işləsin
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)
    }

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
        className="relative text-white/80 hover:text-white transition p-1 sm:p-1.5 flex-shrink-0 touch-manipulation"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          // Hamburger menu açıq olduqda panel açma
          const menuPanel = document.getElementById('menu-panel')
          if (menuPanel && menuPanel.classList.contains('active')) {
            return
          }
          setShowPanel(prev => !prev)
        }}
        onMouseDown={(e) => {
          e.stopPropagation()
        }}
        aria-label="Bildirişlər"
        type="button"
      >
        <BellIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        {alertCount > 0 && (
          <span
            id="alert-counter"
            className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 bg-red-500 rounded-full shadow-lg flex items-center justify-center text-white text-[10px] font-bold"
            title={`${alertCount} yeni bildiriş`}
          >
            {alertCount > 99 ? '99+' : alertCount}
          </span>
        )}
        {/* WebSocket connection indicator */}
        {isConnected && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white/20"
            title="Real-time bağlantı aktiv"
          ></span>
        )}
      </button>

      {/* Alert Panel - React Portal ilə body-nin ən yuxarısında render olunur */}
      {showPanel && createPortal(
        <div
          ref={panelRef}
          id="alert-panel"
          className="glass-card rounded-xl shadow-2xl overflow-hidden max-h-[calc(100vh-6rem)] overflow-y-auto sm:w-80"
          style={{
            position: 'fixed',
            top: '3.5rem',
            right: '0.5rem',
            width: 'calc(100vw - 1rem)',
            maxWidth: '24rem',
            zIndex: 99999,
            background: 'var(--glass-bg)',
            borderColor: 'var(--glass-border)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 25px 50px -12px var(--glass-shadow)',
            pointerEvents: 'auto',
            opacity: 1,
            visibility: 'visible',
            display: 'block',
          }}
          onClick={(e) => {
            e.stopPropagation()
            handlePanelClick(e)
          }}
        >
          <div className="px-4 py-3 border-b border-white/10 text-sm font-semibold text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Bildirişlər (AI)</span>
              {alertCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded-full text-xs font-bold">
                  {alertCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isConnected && (
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Real-time bağlantı"></span>
              )}
              {loading && (
                <span className="text-xs text-white/50">Yenilənir...</span>
              )}
            </div>
          </div>
          <ul className="divide-y divide-white/10 text-sm">
            {loading && alerts.length === 0 ? (
              <li className="px-4 py-3 text-center text-white/50">Yüklənir...</li>
            ) : error && alerts.length === 0 ? (
              <li className="px-4 py-3 text-center text-red-400">{error}</li>
            ) : alerts.length === 0 ? (
              <li className="px-4 py-3 text-center text-white/50">Bildiriş yoxdur</li>
            ) : (
              alerts.map((alert) => (
                <li
                  key={alert.id}
                  className={`px-4 py-3 flex gap-2 items-start group hover:bg-white/5 transition-colors ${
                    alert.isNew ? 'bg-green-500/10 border-l-2 border-green-500' : ''
                  }`}
                >
                  <span className={`flex-shrink-0 text-xl ${alert.color || 'text-white'}`}>{alert.icon}</span>
                  <div className="flex-1 incognito-hidden text-white/90" data-original={alert.message}>
                    {alert.message}
                    {alert.isNew && (
                      <span className="ml-2 text-xs text-green-400 font-bold">YENİ</span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      removeAlert(alert.id)
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  className="opacity-70 hover:opacity-100 transition-opacity text-white/70 hover:text-white flex-shrink-0 p-1.5 cursor-pointer z-50 relative group-hover:bg-white/10 rounded-full"
  style={{ pointerEvents: 'auto' }}
  aria-label="Bağla"
  title="Ləğv et"
  type="button"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>,
        document.body
      )}
    </>
  )
}

export default AlertBell
