import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { lazy, Suspense } from 'react'
import GlobalCompanion from './components/GlobalCompanion'
import { projectDetails } from './pages/projectDetails'
import { updatePageMetadata } from './pageMetadata'
import { I18nProvider, localePath, parsePath } from './i18n/locale'
import type { Locale } from './i18n/messages'

const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'))
const ThreeDPage = lazy(() => import('./pages/ThreeDPage'))
const detailPaths = new Set(projectDetails.map((project) => `/projects/${project.slug}`))
const supportedPages = new Set(['/', '/about', '/contact', '/projects', '/3d', ...detailPaths])
const pagePath = () => window.location.pathname

function Site() {
  const [page, setPage] = useState(pagePath)
  const { locale, route } = parsePath(page)
  const previousRoute = useRef(route)
  const switchLocale = (next: Locale) => {
    const destination = localePath(`${route}${location.hash}`, next)
    history.pushState(null, '', destination)
    setPage(pagePath())
  }
  useEffect(() => {
    const navigate = () => setPage(pagePath())
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element | null)?.closest('a')
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return
      const url = new URL(link.href)
      const next = parsePath(url.pathname)
      if (url.origin !== location.origin || !supportedPages.has(next.route)) return
      const destination = /^\/(en|de|tr)(\/|$)/.test(url.pathname) ? url.pathname : localePath(next.route, parsePath(pagePath()).locale)
      if (destination === pagePath()) return
      event.preventDefault()
      history.pushState(null, '', `${destination}${url.search}${url.hash}`)
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
    updatePageMetadata(route, locale)
    localStorage.setItem('siteLocale', locale)
    if (previousRoute.current !== route) window.scrollTo(0, 0)
    previousRoute.current = route
    if (!location.hash) return
    const findTarget = () => {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)))
      if (target) { target.scrollIntoView(); observer.disconnect() }
    }
    const observer = new MutationObserver(findTarget)
    observer.observe(document.getElementById('root')!, { childList: true, subtree: true })
    findTarget()
    return () => observer.disconnect()
  }, [page, route, locale])
  return <I18nProvider locale={locale} route={route} switchLocale={switchLocale}>
    <Suspense fallback={null}>
      {detailPaths.has(route) ? <ProjectDetailPage slug={route.split('/')[2]} /> : route === '/about' ? <AboutPage /> : route === '/contact' ? <ContactPage /> : route === '/projects' ? <ProjectsPage /> : route === '/3d' ? <ThreeDPage /> : <App />}
    </Suspense>
    <GlobalCompanion page={route} />
  </I18nProvider>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Site />
  </StrictMode>,
)
