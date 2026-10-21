import { useEffect, useLayoutEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import sword from '../assets/projects-page/hero-sword-red-energy..png'
import comingSoon from '../assets/projects-page/project-coming-soon-download..png'
import heading from '../assets/projects-page/projects-heading.png'
import logo from '../assets/projects/ka-logo.png'
import aqarati from '../assets/projects-page/aqarati-laptop-mockup.png'
import taaniqi from '../assets/projects-page/taaniqi-laptop-mockup.png'
import yumna from '../assets/projects-page/yumna-portfolio-laptop-mockup.png'
import fruitMilk from '../assets/projects-page/fruit-milk-card.png'
import portfolioPreview from '../assets/case-studies/personal-portfolio/portfolio-preview.png'
import styles from './ProjectsPage.module.css'
import { projectDetails } from './projectDetails'
import { finishProjectTransition, openProject } from './projectTransition'
import { useI18n } from '../i18n/locale'
import LineBreaks from '../i18n/LineBreaks'
import type { MessageKey } from '../i18n/messages'

const projects = [
  { number: '01', title: 'Aqarati Syria', subtitle: 'projectsAqarati', image: aqarati },
  { number: '02', title: 'Taaniqi with Iman', subtitle: 'projectsTaaniqi', image: taaniqi },
  { number: '03', title: 'Yumna Al-Muallem Portfolio', subtitle: 'projectsYumna', image: yumna },
  { number: '04', title: 'FruitMilk', subtitle: 'projectsFruit', image: fruitMilk },
  { number: '05', title: 'Personal Developer Portfolio', subtitle: 'projectsPersonal', image: portfolioPreview },
  { number: '06', title: 'Coming Soon', subtitle: 'comingSoonText', image: comingSoon },
]

export default function ProjectsPage() {
  const { t, to, locale } = useI18n()
  const pageRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const page = pageRef.current
    if (!page) return
    const slug = sessionStorage.getItem('project-transition-return')
    if (!slug) return
    sessionStorage.removeItem('project-transition-return')
    finishProjectTransition(page, page.querySelector<HTMLElement>(`[data-project-slug="${slug}"] .${styles.preview}`), to('/projects'))
  }, [to])

  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const entered = new Set<Element>()
    const animations: Animation[] = []
    const observer = new IntersectionObserver((entries) => {
      if (motion.matches) return
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entered.has(entry.target)) return
        entered.add(entry.target)
        observer.unobserve(entry.target)
        // Footer children include the logo and their decorative pseudo-element lines.
        Array.from(entry.target.children).forEach((element, index) => {
          animations.push(element.animate([
            { opacity: 0, translate: '0 12px' },
            { opacity: 1, translate: '0 0' },
          ], {
            duration: 800,
            delay: index * 100,
            easing: 'cubic-bezier(.22, 1, .36, 1)',
            fill: 'backwards',
          }))
        })
      })
    }, { threshold: 0.12 })

    const updateMotion = () => {
      if (motion.matches) {
        observer.disconnect()
        animations.forEach((animation) => animation.cancel())
      } else {
        ;[footer].forEach((element) => {
          if (!entered.has(element)) observer.observe(element)
        })
      }
    }
    updateMotion()
    motion.addEventListener('change', updateMotion)
    return () => {
      observer.disconnect()
      animations.forEach((animation) => animation.cancel())
      motion.removeEventListener('change', updateMotion)
    }
  }, [])

  useEffect(() => {
    const grid = cardsRef.current
    if (!grid) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const animations: Animation[] = []
    let entered = false
    const observer = new IntersectionObserver((entries) => {
      if (entered || motion.matches || !entries.some((entry) => entry.isIntersecting)) return
      entered = true
      observer.disconnect()
      grid.querySelectorAll<HTMLElement>(`.${styles.card}`).forEach((card, index) => {
        animations.push(card.animate([
          { opacity: 0, translate: '0 14px' },
          { opacity: 1, translate: '0 0' },
        ], {
          duration: 800,
          delay: index * 100,
          easing: 'cubic-bezier(.22, 1, .36, 1)',
          fill: 'backwards',
        }))
      })
    }, { threshold: 0.05 })

    const updateMotion = () => {
      if (motion.matches) {
        observer.disconnect()
        animations.forEach((animation) => animation.cancel())
      } else if (!entered) {
        observer.observe(grid)
      }
    }
    updateMotion()
    motion.addEventListener('change', updateMotion)
    return () => {
      observer.disconnect()
      animations.forEach((animation) => animation.cancel())
      motion.removeEventListener('change', updateMotion)
    }
  }, [])

  return (
    <div ref={pageRef} className={styles.page}>
      <Navbar currentPage="projects" />
      <main>
        <section className={styles.hero} aria-labelledby="projects-heading">
          <div className={styles.scene} aria-hidden="true">
            <img src={sword} alt="" fetchPriority="high" />
          </div>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}><span>03</span><span aria-hidden="true">—</span>{t('projectsEyebrow')}</p>
            <h1 id="projects-heading" className={styles.heading}>
              <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
                <defs><filter id="projects-heading-gold" colorInterpolationFilters="sRGB">
                  <feFlood floodColor="#edbe7b" /><feComposite in2="SourceAlpha" operator="in" />
                </filter></defs>
              </svg>
              {locale === 'en'
                ? <img src={heading} alt={t('projectsEyebrow')} width={2172} height={724} />
                : <span className={styles.localizedHeading}>{t('projectsEyebrow')}</span>}
            </h1>
            <p className={`${styles.subtitle}${locale === 'en' ? '' : ` ${styles.localizedSubtitle}`}`}>{t('projectsSubtitle')}</p>
          </div>
          <p className={styles.verticalWords}><LineBreaks id="projectsWords" /></p>
        </section>

        <section className={styles.work} aria-labelledby="selected-work-heading">
          <h2 id="selected-work-heading" className={styles.sectionHeading}>{t('projectsSelected')}</h2>
          <div ref={cardsRef} className={styles.grid}>
            {projects.map((project) => (
              <article className={styles.card} key={project.number} data-project-slug={projectDetails[Number(project.number) - 1]?.slug} aria-labelledby={`work-${project.number}`}>
                <div className={styles.cardTop}><span>{project.number}</span><span>{t('website')}</span></div>
                {projectDetails[Number(project.number) - 1] ? (
                  <a className={styles.preview}
                    href={to(`/projects/${projectDetails[Number(project.number) - 1].slug}`)}
                    aria-label={t('projectsViewDetails', { project: project.title })}
                    onClick={(event) => openProject(event, event.currentTarget, event.currentTarget.pathname)}>
                    <img src={project.image} alt={t('projectsPreview', { project: project.title })} loading="lazy" decoding="async" />
                  </a>
                ) : <div className={`${styles.preview} ${styles.comingSoon}`}>
                  <img src={project.image} alt="" loading="lazy" decoding="async" />
                </div>}
                <div className={styles.cardBottom}>
                  <div><h3 id={`work-${project.number}`}>{project.number === '06' ? t('comingSoon') : project.title}</h3><p>{t(project.subtitle as MessageKey)}</p></div>
                  {projectDetails[Number(project.number) - 1] ? (
                    <a className={styles.arrow} href={to(`/projects/${projectDetails[Number(project.number) - 1].slug}`)} onClick={(event) => openProject(event, event.currentTarget.closest('article')?.querySelector(`.${styles.preview}`) ?? null, event.currentTarget.pathname)} aria-label={t('projectsViewDetails', { project: project.title })}>↗</a>
                  ) : <span className={styles.arrow} aria-hidden="true">↗</span>}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer ref={footerRef} className={styles.footer}>
        <p>{t('projectsFooter')}</p>
        <div className={styles.footerMark}><img src={logo} alt="KA" width={1536} height={1024} /></div>
        <blockquote>“{t('projectsQuote')}”</blockquote>
      </footer>
    </div>
  )
}
