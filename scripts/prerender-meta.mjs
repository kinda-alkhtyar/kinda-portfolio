import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { messages } from '../src/i18n/messages.ts'
import { projectDetails } from '../src/pages/projectDetails.ts'

const origin = 'https://kinda-portfolio.vercel.app'
const output = 'dist'
const baseHtml = await readFile(join(output, 'index.html'), 'utf8')
const locales = ['en', 'de', 'tr']
const routes = ['/', '/about', '/projects', '/contact', '/3d', ...projectDetails.map(({ slug }) => `/projects/${slug}`)]
const pageKeys = {
  '/': ['metaHomeTitle', 'metaHomeDescription'],
  '/about': ['metaAboutTitle', 'metaAboutDescription'],
  '/projects': ['metaProjectsTitle', 'metaProjectsDescription'],
  '/contact': ['metaContactTitle', 'metaContactDescription'],
  '/3d': ['metaThreeTitle', 'metaThreeDescription'],
}
const pathFor = (route, locale) => `/${locale}${route === '/' ? '/' : route}`
const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const replaceTag = (html, pattern, replacement) => {
  if (!pattern.test(html)) throw new Error(`Missing expected metadata tag: ${pattern}`)
  return html.replace(pattern, replacement)
}

for (const route of routes) {
  const project = projectDetails.find(({ slug }) => route === `/projects/${slug}`)
  for (const locale of locales) {
    const dictionary = messages[locale]
    const [titleKey, descriptionKey] = pageKeys[route] ?? pageKeys['/']
    const title = project ? dictionary.metaCaseTitle.replace('{project}', project.title) : dictionary[titleKey]
    const description = project ? dictionary.metaCaseDescription.replace('{project}', project.title) : dictionary[descriptionKey]
    const canonical = `${origin}${pathFor(route, locale)}`
    let html = baseHtml.replace('<html lang="en">', `<html lang="${locale}">`)
    html = replaceTag(html, /<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    const meta = (attribute, name, content) => `<meta ${attribute}="${name}" content="${escapeHtml(content)}" />`
    for (const [attribute, name, content] of [
      ['name', 'description', description],
      ['property', 'og:title', title],
      ['property', 'og:description', description],
      ['property', 'og:locale', { en: 'en_US', de: 'de_DE', tr: 'tr_TR' }[locale]],
      ['property', 'og:image:alt', dictionary.metaImageAlt],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', description],
      ['name', 'twitter:image:alt', dictionary.metaImageAlt],
    ]) {
      html = replaceTag(html, new RegExp(`<meta ${attribute}="${name}" content="[^"]*" \\/>`), meta(attribute, name, content))
    }
    const alternates = locales.map((language) => `<link rel="alternate" hreflang="${language}" href="${origin}${pathFor(route, language)}" />`).join('\n    ')
    const links = `<link rel="canonical" href="${canonical}" />\n    <meta property="og:url" content="${canonical}" />\n    ${alternates}\n    <link rel="alternate" hreflang="x-default" href="${origin}${pathFor(route, 'en')}" />`
    html = html.replace('</head>', `    ${links}\n  </head>`)
    const directory = join(output, locale, ...route.split('/').filter(Boolean))
    await mkdir(directory, { recursive: true })
    await writeFile(join(directory, 'index.html'), html)
    if (locale === 'en') {
      const alias = join(output, ...route.split('/').filter(Boolean))
      await mkdir(alias, { recursive: true })
      await writeFile(join(alias, 'index.html'), html)
    }
  }
}

console.log(`Generated localized metadata for ${routes.length} routes in ${locales.length} languages.`)
