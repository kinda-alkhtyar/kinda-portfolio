import { useI18n } from '../i18n/locale'
import type { Locale } from '../i18n/messages'
import styles from './LanguageSwitcher.module.css'

const languages: { code: Locale; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'tr', name: 'Türkçe' },
]

export default function LanguageSwitcher() {
  const { locale, switchLocale, t } = useI18n()
  return <div className={styles.switcher} role="group" aria-label={t('languageLabel')}>
    {languages.map(({ code, name }) => <button key={code} type="button" lang={code}
      aria-label={name} aria-pressed={locale === code}
      onClick={() => switchLocale(code)}>{code.toUpperCase()}</button>)}
  </div>
}
