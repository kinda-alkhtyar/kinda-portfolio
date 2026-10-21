import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { messages } from './messages'
import type { Locale, MessageKey } from './messages'

const locales = ['en', 'de', 'tr'] as const
export const isLocale = (value: string): value is Locale => locales.includes(value as Locale)

export function parsePath(pathname: string): { locale: Locale; route: string } {
  const parts = pathname.split('/').filter(Boolean)
  const locale = isLocale(parts[0] ?? '') ? parts.shift() as Locale : 'en'
  const route = `/${parts.join('/')}`
  return { locale, route: route === '/' ? '/' : route.replace(/\/$/, '') }
}

export function localePath(route: string, locale: Locale): string {
  const [path, hash] = route.split('#', 2)
  const normalized = path.startsWith('/') ? path : `/${path}`
  const base = parsePath(normalized).route
  return `/${locale}${base === '/' ? '/' : base}${hash ? `#${hash}` : ''}`
}

type I18nContextValue = {
  locale: Locale
  route: string
  t: (key: MessageKey, params?: Record<string, string | number>) => string
  lines: (key: MessageKey) => string[]
  to: (route: string) => string
  switchLocale: (next: Locale) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ locale, route, switchLocale, children }: { locale: Locale; route: string; switchLocale: (next: Locale) => void; children: ReactNode }) {
  const t = (key: MessageKey, params: Record<string, string | number> = {}) =>
    messages[locale][key].replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match))
  const value: I18nContextValue = { locale, route, t, lines: (key) => t(key).split('|'), to: (path) => localePath(path, locale), switchLocale }
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside I18nProvider')
  return value
}
