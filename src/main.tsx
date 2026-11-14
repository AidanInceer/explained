import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/source-sans-3'
import '@fontsource-variable/jetbrains-mono'
import './styles.css'
import './figures/figures.css'
import './figures/figures-more.css'
import './figures/figures-subjects.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* BASE_URL is "/" in development, and the sub-path when the site is built for one (see README, Deploy). */}
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
