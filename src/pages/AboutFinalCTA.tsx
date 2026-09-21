import sword from '../assets/about/about-cta-sword.png'
import styles from './AboutFinalCTA.module.css'

export default function AboutFinalCTA() {
  return (
    <section className={styles.section} aria-labelledby="about-cta-heading">
      <div className={styles.scene} aria-hidden="true">
        <img src={sword} alt="" width={1672} height={940} loading="lazy" decoding="async" />
      </div>
      <div className={styles.content}>
        <h2 id="about-cta-heading" className={styles.heading}>Let’s Create<br />Something Real</h2>
        <a className={styles.button} href="/#contact">Let’s connect <span aria-hidden="true">→</span></a>
      </div>
    </section>
  )
}
