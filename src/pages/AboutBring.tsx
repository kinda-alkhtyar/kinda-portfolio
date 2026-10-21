import styles from './AboutBring.module.css'
import { useI18n } from '../i18n/locale'

export default function AboutBring() {
  const { t } = useI18n()
  return (
    <section className={styles.section} aria-labelledby="bring-heading">
      <h2 id="bring-heading" className={styles.label}>
        <span>03</span><span aria-hidden="true">—</span>{t('bringHeading')}
      </h2>
      <ul className={styles.items}>
        <li className={styles.item}>
          <div className={styles.icon} aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
              <path d="M9 5h18l7 9-16 21L2 14 9 5Z M2 14h32M9 5l9 30L27 5M9 5l9 9 9-9M18 14l-5-9m5 9 5-9" />
            </svg>
          </div>
          <h3>{t('bringResponsive')}</h3>
          <p>{t('bringResponsiveText')}</p>
        </li>
        <li className={styles.item}>
          <div className={styles.icon} aria-hidden="true">
            <span className={styles.monogram}>K<span>A</span></span>
          </div>
          <h3>{t('bringMultilingual')}</h3>
          <p>{t('bringMultilingualText')}</p>
        </li>
        <li className={styles.item}>
          <div className={styles.icon} aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m10 10-8 8 8 8m16-16 8 8-8 8M22 6l-8 24" />
            </svg>
          </div>
          <h3>{t('bringInteractive')}</h3>
          <p>{t('bringInteractiveText')}</p>
        </li>
      </ul>
    </section>
  )
}
