import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Projects.module.css'
import aqaratiLaptop from '../assets/branding/aqarati-laptop-mockup.png'
import aqaratiMobile from '../assets/branding/aqarati-mobile-mockup.png'
import taaniqiLaptop from '../assets/branding/taaniqi-laptop-mockup.png'
import taaniqiMobile from '../assets/branding/taaniqi-mobile-mockup.png'
import yumnaLaptop from '../assets/branding/yumna-portfolio-laptop-mockup.png'
import yumnaMobile from '../assets/branding/yumna-portfolio-mobile-mockup.png'

gsap.registerPlugin(ScrollTrigger)

const projects = [
  {
    number: '01',
    title: 'Aqarati Syria',
    description: 'A real estate platform connecting buyers with properties across Syria.',
    tags: ['Full-stack', 'Real estate', 'Web app'],
  },
  {
    number: '02',
    title: 'Taaniqi with Iman',
    description: 'An Arabic fashion catalog for discovering jalabiyas and abayas.',
    tags: ['E-commerce', 'Catalog', 'UI/UX'],
  },
  {
    number: '03',
    title: 'Yumna Al-Muallem Portfolio',
    description: 'A visual portfolio showcasing branding, graphic design, and UI/UX projects.',
    tags: ['Portfolio', 'Branding', 'UI/UX'],
  },
]

export default function Projects() {
  const firstProjectRef = useRef<HTMLElement>(null)
  const secondProjectRef = useRef<HTMLElement>(null)
  const thirdProjectRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const project = firstProjectRef.current
    if (!project) return

    const media = gsap.matchMedia(project)

    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({
        defaults: {
          autoAlpha: 0,
          y: 20,
          duration: 0.85,
          ease: 'power2.out',
          clearProps: 'opacity,visibility,transform',
        },
        scrollTrigger: {
          trigger: project,
          start: 'top 85%',
          once: true,
        },
      })
        .from(`.${styles.aqaratiMockup}`, {}, 0)
        .from(`.${styles.details} > *`, { stagger: 0.09 }, 0.1)
    })

    return () => media.revert()
  }, [])

  useLayoutEffect(() => {
    const project = secondProjectRef.current
    if (!project) return

    const media = gsap.matchMedia(project)

    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({
        defaults: {
          autoAlpha: 0,
          y: 20,
          duration: 0.85,
          ease: 'power2.out',
          clearProps: 'opacity,visibility,transform',
        },
        scrollTrigger: {
          trigger: project,
          start: 'top 85%',
          once: true,
        },
      })
        .from(`.${styles.taaniqiMockup}`, {}, 0)
        .from(`.${styles.details} > *`, { stagger: 0.09 }, 0.1)
    })

    return () => media.revert()
  }, [])

  useLayoutEffect(() => {
    const project = thirdProjectRef.current
    if (!project) return

    const media = gsap.matchMedia(project)

    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({
        defaults: {
          autoAlpha: 0,
          y: 20,
          duration: 0.85,
          ease: 'power2.out',
          clearProps: 'opacity,visibility,transform',
        },
        scrollTrigger: {
          trigger: project,
          start: 'top 85%',
          once: true,
        },
      })
        .from(`.${styles.yumnaMockup}`, {}, 0)
        .from(`.${styles.details} > *`, { stagger: 0.09 }, 0.1)
    })

    return () => media.revert()
  }, [])

  return (
    <section id="projects" className={styles.projects} aria-labelledby="projects-title">
      <div className={styles.container}>
        <header className={styles.heading}>
          <h2 id="projects-title" className={styles.title}>
            Selected <span>Work</span>
          </h2>
          <p className={styles.subtitle}>Real projects. Meaningful impact.</p>
        </header>

        <div className={styles.list}>
          {projects.map((project) => (
            <article
              key={project.number}
              data-energy-project={project.number === '01' ? '' : undefined}
              ref={project.number === '01' ? firstProjectRef : project.number === '02' ? secondProjectRef : project.number === '03' ? thirdProjectRef : undefined}
              className={styles.project}
              aria-labelledby={`project-${project.number}`}
            >
              <div className={styles.details}>
                <p className={styles.number}>{project.number}</p>
                <h3 id={`project-${project.number}`} className={styles.projectTitle}>
                  {project.title}
                </h3>
                <p className={styles.description}>{project.description}</p>
                <ul className={styles.tags} aria-label="Project categories">
                  {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
                <button
                  className={styles.button}
                  type="button"
                  disabled
                  aria-label={`View ${project.title} — coming soon`}
                >
                  View project <span aria-hidden="true">↗</span>
                </button>
              </div>

              {project.number === '01' ? (
                <div className={styles.aqaratiMockup}>
                  <img
                    className={styles.aqaratiLaptop}
                    src={aqaratiLaptop}
                    alt="Aqarati Syria website displayed on a laptop"
                    width={1536}
                    height={1024}
                    loading="lazy"
                  />
                  <img
                    className={styles.aqaratiMobile}
                    src={aqaratiMobile}
                    alt="Aqarati Syria mobile website displayed on a phone"
                    width={1024}
                    height={1536}
                    loading="lazy"
                  />
                </div>
              ) : project.number === '02' ? (
                <div className={styles.taaniqiMockup}>
                  <img
                    className={styles.taaniqiLaptop}
                    src={taaniqiLaptop}
                    alt="Taaniqi with Iman website displayed on a laptop"
                    width={1536}
                    height={1024}
                    loading="lazy"
                  />
                  <img
                    className={styles.taaniqiMobile}
                    src={taaniqiMobile}
                    alt="Taaniqi with Iman mobile website displayed on a phone"
                    width={1024}
                    height={1536}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className={styles.yumnaMockup}>
                  <img
                    className={styles.yumnaLaptop}
                    src={yumnaLaptop}
                    alt="Yumna Al-Muallem portfolio displayed on a laptop"
                    width={1536}
                    height={1024}
                    loading="lazy"
                  />
                  <img
                    className={styles.yumnaMobile}
                    src={yumnaMobile}
                    alt="Yumna Al-Muallem mobile portfolio displayed on a phone"
                    width={1024}
                    height={1536}
                    loading="lazy"
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
