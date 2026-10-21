import sword from '../assets/about/about-cta-sword.png'
import styles from './AboutFinalCTA.module.css'
import { useI18n } from '../i18n/locale'
import LineBreaks from '../i18n/LineBreaks'

export default function AboutFinalCTA() {
  const { t, to } = useI18n()
  return (
    <section className={styles.section} aria-labelledby="about-cta-heading">
      <div className={styles.scene} aria-hidden="true">
        <img src={sword} alt="" width={1672} height={940} loading="lazy" decoding="async" />
      </div>
      <div className={styles.content}>
        <h2 id="about-cta-heading" className={styles.heading}><LineBreaks id="aboutCta" /></h2>
        <a className={styles.button} href={to('/contact')}>{t('connect')} <span aria-hidden="true">→</span></a>
      </div>
    </section>
  )
}
