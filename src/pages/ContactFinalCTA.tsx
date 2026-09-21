import { useEffect, useRef } from 'react'
import sword from '../assets/projects-page/contact-hero-sword..png'
import styles from './ContactFinalCTA.module.css'

const services = [
  { label: <>Websites<br />&amp; apps</>, icon: 'diamond' },
  { label: <>Games</>, icon: 'game' },
  { label: <>Creative<br />solutions</>, icon: 'pen' },
  { label: <>Remote<br />worldwide</>, icon: 'globe' },
] as const

function ServiceIcon({ kind }: { kind: typeof services[number]['icon'] }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === 'diamond' && <path d="M8 4h16l6 8-14 18L2 12l6-8ZM2 12h28M8 4l8 26 8-26M8 4l8 8 8-8M16 12l-4-8m4 8 4-8" />}
      {kind === 'game' && <><path d="M10 7 6 9C3 14 1 24 4 27c3 2 6-4 8-5h8c2 1 5 7 8 5 3-3 1-13-2-18l-4-2-4 2h-4l-4-2Z" /><path d="M7 15h7m-3.5-3.5v7" /><circle cx="22" cy="13" r="1.5" /><circle cx="25" cy="18" r="1.5" /></>}
      {kind === 'pen' && <><path d="m9 24-5 4 2-7L23 4c3-3 6 0 3 3L9 24ZM6 21l3 3M19 8l4 4" /><path d="M16 5C7 1-1 18 5 25s23-1 21-10" /></>}
      {kind === 'globe' && <><circle cx="16" cy="16" r="14" /><ellipse cx="16" cy="16" rx="6" ry="14" /><path d="M2 16h28M5 8c6 4 16 4 22 0M5 24c6-4 16-4 22 0" /></>}
    </svg>
  )
}

export default function ContactFinalCTA() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const animations: Animation[] = []
    let entered = false
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || motion.matches || entered) return
      entered = true
      observer.disconnect()

      const elements = section.querySelectorAll<HTMLElement>(
        `.${styles.invitation}, .${styles.services} > li, .${styles.caption}`,
      )
      Array.from(elements).filter((element) => element.getClientRects().length > 0)
        .forEach((element, index) => {
          animations.push(element.animate([
            { opacity: 0, transform: 'translateY(12px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ], {
            duration: 850,
            delay: index * 90,
            easing: 'cubic-bezier(.22, 1, .36, 1)',
            fill: 'backwards',
          }))
        })

      const image = section.querySelector<HTMLImageElement>(`.${styles.scene} img`)
      if (image?.getClientRects().length) {
        animations.push(image.animate([
          { opacity: 0, transform: 'translateY(10px) scale(.985)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' },
        ], {
          duration: 1150,
          delay: 180,
          easing: 'cubic-bezier(.22, 1, .36, 1)',
          fill: 'backwards',
        }))
      }
    }, { threshold: 0.12 })

    const updateMotion = () => {
      if (motion.matches) {
        observer.disconnect()
        animations.forEach((animation) => animation.cancel())
      } else if (!entered) {
        observer.observe(section)
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
    <section ref={sectionRef} className={styles.section} aria-labelledby="contact-final-heading">
      <div className={styles.invitation}>
        <h2 id="contact-final-heading"><a href="#contact-name">Let’s build<br />a brighter tomorrow.</a></h2>
        <span className={styles.rule} aria-hidden="true" />
      </div>
      <ul className={styles.services}>
        {services.map(({ label, icon }) => <li key={icon}><ServiceIcon kind={icon} /><span>{label}</span></li>)}
      </ul>
      <div className={styles.scene} aria-hidden="true">
        <img src={sword} alt="" width={724} height={2172} loading="lazy" decoding="async" />
      </div>
      <p className={styles.caption}>More<br />than<br />code</p>
    </section>
  )
}
