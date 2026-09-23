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
import styles from './ProjectsPage.module.css'
import { projectDetails } from './projectDetails'
import { finishProjectTransition, openProject } from './projectTransition'

const projects = [
  { number: '01', title: 'Aqarati Syria', subtitle: 'Real estate platform', image: aqarati },
  { number: '02', title: 'Taaniqi with Iman', subtitle: 'Fashion & e-commerce', image: taaniqi },
  { number: '03', title: 'Yumna Al-Muallem Portfolio', subtitle: 'Design portfolio', image: yumna },
  { number: '04', title: 'FruitMilk', subtitle: '', image: fruitMilk },
  { number: '05', title: 'Coming Soon', subtitle: 'A new project is on its way.', image: comingSoon },
  { number: '06', title: 'Coming Soon', subtitle: 'A new project is on its way.', image: comingSoon },
]

export default function ProjectsPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const paginationRef = useRef<HTMLElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const page = pageRef.current
    if (!page) return
    const slug = sessionStorage.getItem('project-transition-return')
    if (!slug) return
    sessionStorage.removeItem('project-transition-return')
    finishProjectTransition(page, page.querySelector<HTMLElement>(`[data-project-slug="${slug}"] .${styles.preview}`), '/projects')
  }, [])

  useEffect(() => {
    const pagination = paginationRef.current
    const footer = footerRef.current
    if (!pagination || !footer) return

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
        ;[pagination, footer].forEach((element) => {
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
            <p className={styles.eyebrow}><span>03</span><span aria-hidden="true">—</span>Projects</p>
            <h1 id="projects-heading" className={styles.heading}><img src={heading} alt="Projects" width={2172} height={724} /></h1>
            <p className={styles.subtitle}>Digital products. Real impact.</p>
            <div className={styles.filters} role="group" aria-label="Project filters (preview only)">
              <button type="button" className={styles.selected} aria-pressed="true" aria-disabled="true">All</button>
              <button type="button" aria-pressed="false" aria-disabled="true">Websites</button>
              <button type="button" aria-pressed="false" aria-disabled="true">Apps</button>
            </div>
          </div>
          <p className={styles.verticalWords}>Ideas<br />Code<br />Products<br />A better<br />Tomorrow</p>
        </section>

        <section className={styles.work} aria-labelledby="selected-work-heading">
          <h2 id="selected-work-heading" className={styles.sectionHeading}>Selected work</h2>
          <div ref={cardsRef} className={styles.grid}>
            {projects.map((project) => (
              <article className={styles.card} key={project.number} data-project-slug={projectDetails[Number(project.number) - 1]?.slug} aria-labelledby={`work-${project.number}`}>
                <div className={styles.cardTop}><span>{project.number}</span><span>Website</span></div>
                <div className={`${styles.preview}${Number(project.number) > 4 ? ` ${styles.comingSoon}` : ''}`}
                  role={Number(project.number) <= 4 ? 'link' : undefined}
                  tabIndex={Number(project.number) <= 4 ? 0 : undefined}
                  aria-label={Number(project.number) <= 4 ? `View ${project.title} project details` : undefined}
                  onClick={Number(project.number) <= 4 ? (event) => openProject(event, event.currentTarget, `/projects/${projectDetails[Number(project.number) - 1].slug}`) : undefined}
                  onKeyDown={Number(project.number) <= 4 ? (event) => { if (event.key === 'Enter') openProject(event, event.currentTarget, `/projects/${projectDetails[Number(project.number) - 1].slug}`) } : undefined}>
                  <img src={project.image} alt={Number(project.number) > 4 ? '' : `${project.title} website preview`} loading="lazy" decoding="async" />
                </div>
                <div className={styles.cardBottom}>
                  <div><h3 id={`work-${project.number}`}>{project.title}</h3><p>{project.subtitle}</p></div>
                  {projectDetails[Number(project.number) - 1] ? (
                    <a className={styles.arrow} href={`/projects/${projectDetails[Number(project.number) - 1].slug}`} onClick={(event) => openProject(event, event.currentTarget.closest('article')?.querySelector(`.${styles.preview}`) ?? null, event.currentTarget.pathname)} aria-label={`View ${project.title} project details`}>↗</a>
                  ) : <span className={styles.arrow} aria-hidden="true">↗</span>}
                </div>
              </article>
            ))}
          </div>
          <nav ref={paginationRef} className={styles.pagination} aria-label="Projects pagination (preview only)">
            <button type="button" aria-label="Previous page" aria-disabled="true">←</button>
            <button type="button" aria-current="page" aria-disabled="true">1</button>
            <button type="button" aria-label="Page 2" aria-disabled="true">2</button>
            <button type="button" aria-label="Page 3" aria-disabled="true">3</button>
            <button type="button" aria-label="Next page" aria-disabled="true">→</button>
          </nav>
        </section>
      </main>
      <footer ref={footerRef} className={styles.footer}>
        <p>Let’s<br />build a brighter<br />tomorrow.</p>
        <div className={styles.footerMark}><img src={logo} alt="KA" width={1536} height={1024} /></div>
        <blockquote>“Better digital experiences for a brighter tomorrow.”</blockquote>
      </footer>
    </div>
  )
}
