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

// React 18 ilə yeni root API istifadə edirik
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

