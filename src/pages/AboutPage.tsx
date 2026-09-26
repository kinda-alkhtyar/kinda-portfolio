import sword from '../assets/about/about-hero-sword.png'
import purposeScene from '../assets/about/about-purpose-scene.png'
import logo from '../assets/projects/ka-logo.png'
import styles from './AboutPage.module.css'
import AboutBring from './AboutBring'
import AboutTechStack from './AboutTechStack'
import AboutOpportunities from './AboutOpportunities'
import AboutFinalCTA from './AboutFinalCTA'

function AccentIcon({ kind }: { kind: 'ideas' | 'code' | 'impact' }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      {kind === 'ideas' && <path d="m14 2 3 9 9 3-9 3-3 9-3-9-9-3 9-3Z" />}
      {kind === 'code' && <path d="m8 7-6 7 6 7m12-14 6 7-6 7M17 4l-6 20" />}
      {kind === 'impact' && <><rect x="4" y="16" width="4" height="9" rx=".5" /><rect x="12" y="10" width="4" height="15" rx=".5" /><rect x="20" y="4" width="4" height="21" rx=".5" /></>}
    </svg>
  )
}

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="about-heading">
        <div className={styles.scene} aria-hidden="true">
          <img src={sword} alt="" width={1536} height={1024} fetchPriority="high" />
        </div>

        <header className={styles.header}>
          <nav className={styles.nav} aria-label="Main navigation">
            <a className={styles.logo} href="/" aria-label="Kinda Alhidyar home">
              <img src={logo} alt="" width={1536} height={1024} />
            </a>
            <ul className={styles.links}>
              <li><a href="/">Home</a></li>
              <li><a href="/#projects">Projects</a></li>
              <li><a href="/about" aria-current="page">About</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/3d">3D</a></li>
            </ul>
            <span className={styles.availability}><span aria-hidden="true" />Available for opportunities</span>
          </nav>
        </header>

        <div className={styles.content}>
          <p className={styles.eyebrow}><span>01</span><span aria-hidden="true">—</span>About</p>
          <div className={styles.headingWrap}>
            <svg className={styles.flourish} viewBox="0 0 370 132" fill="none" aria-hidden="true">
              <path d="M19 72C-22 82-7 140 50 129M42 15C106-8 123 16 151 10M166 10C188-1 225 6 242 17" stroke="url(#about-gold)" strokeWidth=".8" />
              <defs><linearGradient id="about-gold"><stop stopColor="#cf9850" /><stop offset=".5" stopColor="#ffe5a2" /><stop offset="1" stopColor="#724022" /></linearGradient></defs>
            </svg>
            <h1 id="about-heading" className={styles.heading}>Behind<br />The Code</h1>
          </div>
          <p className={styles.name}>I’m Kinda Alhidyar</p>
          <p className={styles.role}>Full-Stack Developer</p>
          <p className={styles.description}>Building modern web experiences<br />from idea to launch.</p>
          <div className={styles.actions}>
            <a className={styles.primaryButton} href="/Kinda_Alkhityar_CV_Same_Design_Updated.pdf" target="_blank" rel="noopener noreferrer">
              Download CV
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M10 3v10m-4-4 4 4 4-4M5 13v4h10v-4" /></svg>
            </a>
            <a className={styles.secondaryButton} href="/contact">Let’s connect <span aria-hidden="true">→</span></a>
          </div>
          <p className={styles.motto}>Turning<br />ideas into<br />reality</p>
        </div>

        <ul className={styles.labels} aria-label="Ideas, code, impact">
          {(['ideas', 'code', 'impact'] as const).map((kind) => (
            <li key={kind}><span className={styles.connector} aria-hidden="true" /><AccentIcon kind={kind} /><span>{kind}</span></li>
          ))}
        </ul>
      </section>
      <section className={styles.purpose} aria-labelledby="purpose-heading">
        <div className={styles.purposeScene} aria-hidden="true">
          <img src={purposeScene} alt="" width={2079} height={756} loading="lazy" decoding="async" />
        </div>
        <div className={styles.purposeContent}>
          <p className={styles.eyebrow}><span>02</span><span aria-hidden="true">—</span>My purpose</p>
          <h2 id="purpose-heading" className={`${styles.heading} ${styles.purposeHeading}`}>A Clearer<br />Purpose</h2>
          <p className={styles.purposeDescription}>I turn ideas into functional, reliable<br />and user-friendly web experiences.</p>
        </div>
        <p className={styles.purposeLabels}>Learn<br />Build<br />Improve<br />Repeat</p>
      </section>
      <AboutBring />
      <AboutTechStack />
      <AboutOpportunities />
      <AboutFinalCTA />
    </main>
  )
}
