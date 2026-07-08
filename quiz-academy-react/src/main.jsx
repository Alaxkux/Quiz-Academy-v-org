import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/globals.css'

// Ensure 100% zoom on all devices
document.documentElement.style.zoom = '1'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background:   'var(--bg1)',
            color:        'var(--t1)',
            border:       '1px solid var(--border)',
            borderRadius: '16px',
            fontSize:     '14px',
            fontFamily:   'DM Sans, sans-serif',
            boxShadow:    '0 10px 40px rgba(0,0,0,0.3)',
            maxWidth:     '340px',
            padding:      '12px 16px',
          },
          success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg1)' } },
          error:   { iconTheme: { primary: 'var(--red)',   secondary: 'var(--bg1)' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
