import styles from './CVDownload.module.css'
import { useI18n } from '../i18n/locale'
import type { MessageKey } from '../i18n/messages'

const cvs = [
  { language: 'English', file: '/cv/Kinda-Alkhityar-CV-English.pdf' },
  { language: 'Deutsch', file: '/cv/Kinda-Alkhityar-CV-Deutsch.pdf' },
  { language: 'Türkçe', file: '/cv/Kinda-Alkhityar-CV-Turkce.pdf' },
  { language: 'العربية', file: '/cv/Kinda-Alkhityar-CV-Arabic.pdf' },
]

export default function CVDownload({ labelKey = 'cvDownload' }: { labelKey?: MessageKey }) {
  const { t } = useI18n()
  return <details className={styles.menu}>
    <summary>{t(labelKey)} <span aria-hidden="true">⌄</span></summary>
    <ul>
      {cvs.map(({ language, file }) => <li key={file}>
        <a href={file} download>{language} <span aria-hidden="true">↓</span></a>
      </li>)}
    </ul>
  </details>
}
