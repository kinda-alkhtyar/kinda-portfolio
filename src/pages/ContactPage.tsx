import Navbar from '../components/Navbar'
import sword from '../assets/projects-page/contact-hero-sword..png'
import styles from './ContactPage.module.css'
import ContactMethods from './ContactMethods'
import ContactForm from './ContactForm'
import ContactFinalCTA from './ContactFinalCTA'

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <Navbar currentPage="contact" />
      <main className={styles.main}>
        <section className={styles.hero} aria-labelledby="contact-heading">
          <div className={styles.content}>
            <p className={styles.label}><span aria-hidden="true">//</span>Contact</p>
            <div className={styles.headingWrap}>
              <svg className={styles.flourish} viewBox="0 0 600 60" fill="none" aria-hidden="true">
                <path d="M10 21c52 25 71-20 114 9S290-7 385 13s153 57 145 40" stroke="url(#contact-flourish)" strokeWidth=".9" />
                <defs><linearGradient id="contact-flourish"><stop stopColor="#70491f" stopOpacity="0" /><stop offset=".4" stopColor="#f6d59c" /><stop offset="1" stopColor="#b38143" /></linearGradient></defs>
              </svg>
              <h1 id="contact-heading" className={styles.heading}>Let’s Create<br />Something Real.</h1>
            </div>
            <p className={styles.description}>Have a project, an idea, or an opportunity? Let’s talk.</p>
          </div>
          <div className={styles.swordScene} aria-hidden="true">
            <img src={sword} alt="" width={724} height={2172} fetchPriority="high" />
          </div>
          <p className={styles.ideas}>Ideas<br />Code<br />Design<br />Real impact</p>
          <p className={styles.motto}>Let’s build<br />a brighter tomorrow.</p>
          <p className={styles.swordCaption}>More<br />than<br />code</p>
        </section>
        <ContactMethods />
        <ContactForm />
        <ContactFinalCTA />
      </main>
    </div>
  )
}
