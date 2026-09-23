import { Fragment, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '../components/Navbar'
import { projectDetails } from './projectDetails'
import styles from './ProjectDetailPage.module.css'
import { finishProjectTransition, openProject } from './projectTransition'

const images = import.meta.glob('../assets/case-studies/**/*.{png,jpg,jpeg,webp}', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>

gsap.registerPlugin(ScrollTrigger)

const categories: Record<string, string> = {
  aqarati: 'Real estate platform', 'taaniqi-iman': 'Fashion & e-commerce',
  'yumna-portfolio': 'Design portfolio', 'fruit-milk': 'Product website',
}

export default function ProjectDetailPage({ slug }: { slug: string }) {
  const pageRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const page = pageRef.current
    if (page) finishProjectTransition(page, page.querySelector(`.${styles.lead} img`), `/projects/${slug}`)
  }, [slug])

  useLayoutEffect(() => {
    const page = pageRef.current
    if (!page) return
    const media = gsap.matchMedia(page)
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from(`.${styles.back}`, { autoAlpha: 0, y: 16, duration: 0.7 }, 0)
        .from(`.${styles.eyebrow}`, { autoAlpha: 0, y: 16, duration: 0.7 }, 0.12)
        .from(`.${styles.titleWord}`, { autoAlpha: 0, y: 28, duration: 0.9, stagger: 0.09 }, 0.24)
        .from(`.${styles.category}`, { autoAlpha: 0, y: 18, duration: 0.7 }, 0.62)

      page.querySelectorAll<HTMLElement>(`.${styles.gallery} figure`).forEach((figure, imageIndex) => {
        const image = figure.querySelector('img')
        const caption = figure.querySelector('figcaption')
        if (!image) return
        const direction = imageIndex % 2 === 0 ? -1 : 1
        const isLead = figure.classList.contains(styles.lead)
        gsap.timeline({
          scrollTrigger: { trigger: figure, start: 'top 88%', once: true },
        })
          .fromTo(image,
            { autoAlpha: 0, x: isLead ? 0 : direction * 28, y: isLead ? 0 : 10, scale: isLead ? 1.05 : 1.07, clipPath: isLead ? 'inset(0 0 100% 0)' : direction < 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' },
            { autoAlpha: 1, x: 0, y: 0, scale: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.15, ease: 'power3.out', clearProps: 'transform,clipPath,opacity,visibility' }, 0)
          .from(caption, { autoAlpha: 0, x: isLead ? 0 : direction * 8, y: 10, duration: 0.7, ease: 'power2.out' }, 0.3)

        if (figure.classList.contains(styles.lead) || figure.classList.contains(styles.fullWidth)) {
          gsap.fromTo(figure, { y: 10 }, {
            y: -10, ease: 'none',
            scrollTrigger: { trigger: figure, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
          })
        }
      })

      gsap.from(`.${styles.projectNav} a`, {
        autoAlpha: 0, y: 18, duration: 0.8, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: `.${styles.projectNav}`, start: 'top 90%', once: true },
      })
    })
    return () => media.revert()
  }, [slug])

  const project = projectDetails.find((item) => item.slug === slug)
  if (!project) return null
  const index = projectDetails.indexOf(project)
  const previous = projectDetails[(index + projectDetails.length - 1) % projectDetails.length]
  const next = projectDetails[(index + 1) % projectDetails.length]
  const titleWords = project.title.split(' ')
  return <div ref={pageRef} className={styles.page}>
    <Navbar currentPage="projects" />
    <main className={styles.content}>
      <a className={styles.back} href="/projects" onClick={(event) => {
        sessionStorage.setItem('project-transition-return', slug)
        openProject(event, pageRef.current?.querySelector(`.${styles.lead} img`) ?? null, '/projects')
      }}>← Back to projects</a>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>Case study / {String(index + 1).padStart(2, '0')}</p>
        <h1>{titleWords.map((word, wordIndex) => <Fragment key={`${word}-${wordIndex}`}><span className={styles.titleWord}>{word}</span>{wordIndex < titleWords.length - 1 ? ' ' : null}</Fragment>)}</h1>
        <p className={styles.category}>{categories[slug]} <span>Website</span></p>
      </header>
      <div className={styles.gallery}>
        {project.images.map((filename, imageIndex) => <figure
          key={`${slug}/${filename}`}
          className={imageIndex === 0 ? styles.lead : imageIndex % 3 === 0 || project.images.length === 2 ? styles.fullWidth : undefined}
        ><img
          src={images[`../assets/case-studies/${slug}/${filename}`]}
          alt={`${project.title} — project screenshot ${imageIndex + 1}`}
          loading={imageIndex === 0 ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => ScrollTrigger.refresh()}
        /><figcaption>{String(imageIndex + 1).padStart(2, '0')} — {imageIndex === 0 ? 'Overview' : 'Project detail'}</figcaption></figure>)}
      </div>
      <nav className={styles.projectNav} aria-label="Project navigation">
        <a href={`/projects/${previous.slug}`}><span>← Previous project</span><strong>{previous.title}</strong></a>
        <a href={`/projects/${next.slug}`}><span>Next project →</span><strong>{next.title}</strong></a>
      </nav>
    </main>
  </div>
}
