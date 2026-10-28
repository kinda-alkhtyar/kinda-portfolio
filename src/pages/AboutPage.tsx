import sword from '../assets/about/about-hero-sword.png'
import purposeScene from '../assets/about/about-purpose-scene.png'
import logo from '../assets/projects/ka-logo.png'
import styles from './AboutPage.module.css'
import AboutBring from './AboutBring'
import AboutTechStack from './AboutTechStack'
import AboutOpportunities from './AboutOpportunities'
import AboutFinalCTA from './AboutFinalCTA'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n/locale'
import LineBreaks from '../i18n/LineBreaks'

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
  const { t, to } = useI18n()
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="about-heading">
        <div className={styles.scene} aria-hidden="true">
          <img src={sword} alt="" width={1536} height={1024} fetchPriority="high" />
        </div>

        <header className={styles.header}>
          <nav className={styles.nav} aria-label={t('navLabel')}>
            <a className={styles.logo} href={to('/')} aria-label={t('navLogo')}>
              <img src={logo} alt="" width={1536} height={1024} />
            </a>
            <ul className={styles.links}>
              <li><a href={to('/')}>{t('navHome')}</a></li>
              <li><a href={to('/projects')}>{t('navProjects')}</a></li>
              <li><a href={to('/about')} aria-current="page">{t('navAbout')}</a></li>
              <li><a href={to('/contact')}>{t('navContact')}</a></li>
              <li><a href={to('/3d')}>{t('nav3d')}</a></li>
            </ul>
            <LanguageSwitcher />
            <span className={styles.availability}><span aria-hidden="true" />{t('navOpportunities')}</span>
          </nav>
        </header>

        <div className={styles.content}>
          <p className={styles.eyebrow}><span>01</span><span aria-hidden="true">—</span>{t('aboutEyebrow')}</p>
          <div className={styles.headingWrap}>
            <svg className={styles.flourish} viewBox="0 0 370 132" fill="none" aria-hidden="true">
              <path d="M19 72C-22 82-7 140 50 129M42 15C106-8 123 16 151 10M166 10C188-1 225 6 242 17" stroke="url(#about-gold)" strokeWidth=".8" />
              <defs><linearGradient id="about-gold"><stop stopColor="#cf9850" /><stop offset=".5" stopColor="#ffe5a2" /><stop offset="1" stopColor="#724022" /></linearGradient></defs>
            </svg>
            <h1 id="about-heading" className={styles.heading}><LineBreaks id="aboutHeading" /></h1>
          </div>
          <div className={styles.introduction}>
            <h2 className={styles.introHeadline}>{t('aboutHeroHeadline')}</h2>
            <p className={styles.introLead}>{t('aboutHeroIntro')}</p>
            <p className={styles.introSupport}>{t('aboutHeroSupport')}</p>
            <ul className={styles.badges} aria-label={t('skillsHeading')}>
              <li>React</li><li>JavaScript</li>
              <li>{t('aboutBadgeResponsive')}</li><li>{t('aboutBadgeInteractive')}</li>
            </ul>
          </div>
          <div className={styles.actions}>
            <a className={styles.secondaryButton} href={to('/projects')}>{t('aboutExplore')} <span aria-hidden="true">→</span></a>

          </div>
          <p className={styles.motto}><LineBreaks id="aboutMotto" /></p>
        </div>

        <ul className={styles.labels} aria-label={t('aboutLabels')}>
          {(['ideas', 'code', 'impact'] as const).map((kind) => (
            <li key={kind}><span className={styles.connector} aria-hidden="true" /><AccentIcon kind={kind} /><span>{t(({ ideas: 'aboutIdeas', code: 'aboutCode', impact: 'aboutImpact' } as const)[kind])}</span></li>
          ))}
        </ul>
      </section>
      <section className={styles.purpose} aria-labelledby="purpose-heading">
        <div className={styles.purposeScene} aria-hidden="true">
          <img src={purposeScene} alt="" width={2079} height={756} loading="lazy" decoding="async" />
        </div>
        <div className={styles.purposeContent}>
          <p className={styles.eyebrow}><span>02</span><span aria-hidden="true">—</span>{t('purposeEyebrow')}</p>
          <h2 id="purpose-heading" className={`${styles.heading} ${styles.purposeHeading}`}><LineBreaks id="purposeHeading" /></h2>
          <p className={styles.purposeDescription}>{t('purposeDescription')}</p>
        </div>
        <p className={styles.purposeLabels}><LineBreaks id="purposeWords" /></p>
      </section>
      <AboutBring />
      <AboutTechStack />
      <section className={styles.certification} aria-labelledby="certification-heading">
        <p>05 — {t('certification')}</p>
        <h2 id="certification-heading">{t('certificateName')}</h2>
        <p>German Board for Training and Consulting GmbH · 2026</p>
      </section>
      <AboutOpportunities />
      <AboutFinalCTA />
    </main>
  )
}
