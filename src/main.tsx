import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { lazy, Suspense } from 'react'
import GlobalCompanion from './components/GlobalCompanion'
import { projectDetails } from './pages/projectDetails'

const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'))
const ThreeDPage = lazy(() => import('./pages/ThreeDPage'))
const detailPaths = new Set(projectDetails.map((project) => `/projects/${project.slug}`))
const supportedPages = new Set(['/', '/about', '/contact', '/projects', '/3d', ...detailPaths])
const pagePath = () => window.location.pathname.replace(/\/$/, '') || '/'

function Site() {
  const [page, setPage] = useState(pagePath)
  useEffect(() => {
    const navigate = () => setPage(pagePath())
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element).closest('a')
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return
      const url = new URL(link.href)
      const next = url.pathname.replace(/\/$/, '') || '/'
      if (url.origin !== location.origin || !supportedPages.has(next) || next === pagePath()) return
      event.preventDefault()
      history.pushState(null, '', url)
      navigate()
    }
    document.addEventListener('click', click)
    window.addEventListener('popstate', navigate)
    return () => {
      document.removeEventListener('click', click)
      window.removeEventListener('popstate', navigate)
    }
  }, [])
  useEffect(() => {
    window.scrollTo(0, 0)
    if (!location.hash) return
    const findTarget = () => {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)))
      if (target) { target.scrollIntoView(); observer.disconnect() }
    }
    const observer = new MutationObserver(findTarget)
    observer.observe(document.getElementById('root')!, { childList: true, subtree: true })
    findTarget()
    return () => observer.disconnect()
  }, [page])
  return <>
    <Suspense fallback={null}>
      {detailPaths.has(page) ? <ProjectDetailPage slug={page.split('/')[2]} /> : page === '/about' ? <AboutPage /> : page === '/contact' ? <ContactPage /> : page === '/projects' ? <ProjectsPage /> : page === '/3d' ? <ThreeDPage /> : <App />}
    </Suspense>
    <GlobalCompanion page={page} />
  </>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Site />
  </StrictMode>,
)
