/**
 * React App Entry Point
 * Bu fayl React aplikasiyasının başlanğıc nöqtəsidir
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import './utils/readability' // Initialize readability mode

// CRITICAL: Apply theme BEFORE React renders to prevent flash
(function() {
  'use strict';
  
  // Add preload class to disable transitions
  document.documentElement.classList.add('preload');
  
  // Get saved theme from localStorage or default to 'dark'
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  // Ensure color-scheme is set
  if (savedTheme === 'dark') {
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.style.colorScheme = 'light';
  }
  
  // Apply premium theme immediately (before page render)
  const savedPremiumTheme = localStorage.getItem('premium-theme');
  const validThemes = ['gold', 'midnight', 'ocean', 'forest', 'sunset', 'royal'];
  const themes = ['theme-gold', 'theme-midnight', 'theme-ocean', 'theme-forest', 'theme-sunset', 'theme-royal'];
  
  // Remove any existing theme classes from html
  document.documentElement.classList.remove(...themes);
  
  if (savedPremiumTheme && validThemes.includes(savedPremiumTheme)) {
    document.documentElement.classList.add('theme-' + savedPremiumTheme);
  }
  
  // Remove preload class after a short delay to enable transitions
  window.addEventListener('load', function() {
    setTimeout(function() {
      document.documentElement.classList.remove('preload');
    }, 100);
  });
})();

// React 18 ilə yeni root API istifadə edirik
const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found!')
} else {
  try {
    ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
  } catch (error) {
    console.error('React render error:', error)
    rootElement.innerHTML = `
      <div style="padding: 20px; color: white; text-align: center;">
        <h1>Xəta baş verdi</h1>
        <p>Sayt yüklənərkən xəta baş verdi. Zəhmət olmasa səhifəni yeniləyin.</p>
        <p style="color: #999; font-size: 12px;">${error.message}</p>
      </div>
    `
  }
}

