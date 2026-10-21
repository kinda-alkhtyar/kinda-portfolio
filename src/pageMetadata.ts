import { projectDetails } from './pages/projectDetails'
import { localePath } from './i18n/locale'
import { messages } from './i18n/messages'
import type { Locale, MessageKey } from './i18n/messages'

const siteOrigin = 'https://kinda-portfolio.vercel.app'
const pageKeys: Record<string, [MessageKey, MessageKey]> = {
  '/': ['metaHomeTitle', 'metaHomeDescription'],
  '/about': ['metaAboutTitle', 'metaAboutDescription'],
  '/projects': ['metaProjectsTitle', 'metaProjectsDescription'],
  '/contact': ['metaContactTitle', 'metaContactDescription'],
  '/3d': ['metaThreeTitle', 'metaThreeDescription'],
}

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

function setLink(rel: string, href: string, lang?: string) {
  const selector = lang ? `link[rel="${rel}"][hreflang="${lang}"]` : `link[rel="${rel}"]`
  let element = document.querySelector<HTMLLinkElement>(selector)
  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    if (lang) element.hreflang = lang
    document.head.appendChild(element)
  }
  element.href = href
}

export function updatePageMetadata(route: string, locale: Locale) {
  const dictionary = messages[locale]
  const project = projectDetails.find(({ slug }) => route === `/projects/${slug}`)
  const [titleKey, descriptionKey] = pageKeys[route] ?? pageKeys['/']
  const title = project ? dictionary.metaCaseTitle.replace('{project}', project.title) : dictionary[titleKey]
  const description = project ? dictionary.metaCaseDescription.replace('{project}', project.title) : dictionary[descriptionKey]
  const canonical = `${siteOrigin}${localePath(route, locale)}`

  document.documentElement.lang = locale
  document.title = title
  setMeta('meta[name="description"]', 'name', 'description', description)
  setMeta('meta[property="og:title"]', 'property', 'og:title', title)
  setMeta('meta[property="og:description"]', 'property', 'og:description', description)
  setMeta('meta[property="og:locale"]', 'property', 'og:locale', { en: 'en_US', de: 'de_DE', tr: 'tr_TR' }[locale])
  setMeta('meta[property="og:url"]', 'property', 'og:url', canonical)
  setMeta('meta[property="og:image:alt"]', 'property', 'og:image:alt', dictionary.metaImageAlt)
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
  setMeta('meta[name="twitter:image:alt"]', 'name', 'twitter:image:alt', dictionary.metaImageAlt)
  setLink('canonical', canonical)
  ;(['en', 'de', 'tr'] as const).forEach((language) => setLink('alternate', `${siteOrigin}${localePath(route, language)}`, language))
  setLink('alternate', `${siteOrigin}${localePath(route, 'en')}`, 'x-default')
}
