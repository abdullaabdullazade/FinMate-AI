/**
 * Main App Component
 * Routing və global context provider-ları burada quraşdırırıq
 * Sonner toast provider daxildir
 */

import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { PremiumModalProvider } from './contexts/PremiumModalContext'
import { ToastProvider, useToast } from './components/common/CustomToast'
import BaseLayout from './components/layout/BaseLayout'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Scan from './pages/Scan'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import DreamVault from './pages/DreamVault'
import Rewards from './pages/Rewards'
import Heatmap from './pages/Heatmap'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'
import NetworkStatus from './components/common/NetworkStatus'
import { setToastProvider } from './utils/toast'

const AppContent = () => {
  const toastContext = useToast()
  const { showToast } = toastContext

  useEffect(() => {
    // Global toast provider setup
    const provider = { showToast, removeToast: toastContext.removeToast }
    if (window.setToastProvider) {
      window.setToastProvider(provider)
    }
    // Set for toast utility
    setToastProvider(provider)
  }, [showToast, toastContext])

  return (
    <>
      {/* Network Status Monitor */}
      <NetworkStatus />

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes - BaseLayout içində */}
          <Route path="/" element={<BaseLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="chat" element={<Chat />} />
            <Route path="scan" element={<Scan />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="dream-vault" element={<DreamVault />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="heatmap" element={<Heatmap />} />
            {/* 404 - BaseLayout içində */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PremiumModalProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </PremiumModalProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
