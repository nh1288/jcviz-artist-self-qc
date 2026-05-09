import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Apply persisted theme to <html> BEFORE React mounts to avoid light-flash on dark.
try {
  const stored = localStorage.getItem('jcviz-self-qc-theme-v1')
  if (stored !== 'light') document.documentElement.classList.add('dark')
} catch {
  document.documentElement.classList.add('dark')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
