import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { lazy, Suspense } from 'react'

const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const isAboutPage = /^\/about\/?$/.test(window.location.pathname)
const isContactPage = /^\/contact\/?$/.test(window.location.pathname)
const isProjectsPage = /^\/projects\/?$/.test(window.location.pathname)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAboutPage ? <Suspense fallback={null}><AboutPage /></Suspense>
      : isContactPage ? <Suspense fallback={null}><ContactPage /></Suspense>
        : isProjectsPage ? <Suspense fallback={null}><ProjectsPage /></Suspense> : <App />}
  </StrictMode>,
)
