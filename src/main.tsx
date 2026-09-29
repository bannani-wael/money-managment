import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LedgerProvider } from '@/context/LedgerContext'
import App from '@/App'
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LedgerProvider>
      <App />
    </LedgerProvider>
  </StrictMode>,
)
