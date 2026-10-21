import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { messages } from '../src/i18n/messages.ts'
import { projectDetails } from '../src/pages/projectDetails.ts'

const locales = ['en', 'de', 'tr']
const routes = ['/', '/about', '/projects', '/contact', '/3d', ...projectDetails.map(({ slug }) => `/projects/${slug}`)]
const origin = 'https://kinda-portfolio.vercel.app'
const pathFor = (route, locale) => `/${locale}${route === '/' ? '/' : route}`
const keys = Object.keys(messages.en)
let checked = 0

for (const locale of locales) {
  const dictionary = messages[locale]
  for (const key of keys) {
    if (!dictionary[key]?.trim()) throw new Error(`Missing ${locale}.${key}`)
    const parameters = [...messages.en[key].matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',')
    const translatedParameters = [...dictionary[key].matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',')
    if (parameters !== translatedParameters) throw new Error(`Interpolation mismatch in ${locale}.${key}`)
  }
  for (const route of routes) {
    const path = join('dist', locale, ...route.split('/').filter(Boolean), 'index.html')
    const html = await readFile(path, 'utf8')
    const canonical = `${origin}${pathFor(route, locale)}`
    if (!html.includes(`<html lang="${locale}">`) || !html.includes(`<link rel="canonical" href="${canonical}" />`)) throw new Error(`Incorrect metadata in ${path}`)
    for (const alternate of locales) {
      if (!html.includes(`hreflang="${alternate}" href="${origin}${pathFor(route, alternate)}"`)) throw new Error(`Missing ${alternate} alternate in ${path}`)
    }
    checked += 1
  }
}

for (const name of ['English', 'Deutsch', 'Turkce', 'Arabic']) {
  const file = join('dist', 'cv', `Kinda-Alkhityar-CV-${name}.pdf`)
  const bytes = await readFile(file)
  if (bytes.subarray(0, 4).toString() !== '%PDF') throw new Error(`Invalid PDF: ${file}`)
}

const liveUrls = {
  aqarati: 'https://aqarati-syria.netlify.app/',
  'taaniqi-iman': 'https://taaniqi-iman.vercel.app/',
  'yumna-portfolio': 'https://yumnaalmuallem-portfolio.netlify.app/',
}
for (const [slug, url] of Object.entries(liveUrls)) {
  if (projectDetails.find((project) => project.slug === slug)?.liveUrl !== url) throw new Error(`Incorrect live URL for ${slug}`)
}

console.log(`Verified ${keys.length} translation keys in three locales, ${checked} localized route documents, four CV PDFs, and three live-site URLs.`)
