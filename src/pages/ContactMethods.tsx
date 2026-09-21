import { useEffect, useRef } from 'react'
import styles from './ContactMethods.module.css'

const methods = [
  { label: 'Email', value: 'alhidyarkinda@gmail.com', href: 'mailto:alhidyarkinda@gmail.com', icon: 'email' },
  { label: 'WhatsApp', value: '+43 681 81368063', href: 'https://wa.me/4368181368063', icon: 'whatsapp' },
  { label: 'Instagram', value: 'kynora.studioo', href: 'https://www.instagram.com/kynora.studioo/', icon: 'instagram' },
  { label: 'GitHub', value: 'github.com/kinda-alkhtyar', href: 'https://github.com/kinda-alkhtyar', icon: 'github' },
] as const

function MethodIcon({ kind }: { kind: typeof methods[number]['icon'] }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === 'email' && <><rect x="2" y="5" width="28" height="22" rx="2" /><path d="m3 7 13 11L29 7" /></>}
      {kind === 'whatsapp' && <><path d="M7 26 2 30l2-8a14 14 0 1 1 3 4Z" /><path d="M11 8c-2-1-4 2-3 5 2 6 6 10 12 11 3 1 6-3 4-4l-4-2-2 2c-3-1-5-3-6-6l2-2-3-4Z" fill="currentColor" strokeWidth=".5" /></>}
      {kind === 'instagram' && <><rect x="2" y="2" width="28" height="28" rx="8" /><circle cx="16" cy="16" r="7" /><circle cx="24" cy="8" r="1.2" fill="currentColor" stroke="none" /></>}
      {kind === 'github' && <path stroke="none" fill="currentColor" d="M16 1a15 15 0 0 0-4.7 29.2c.7.1 1-.3 1-.7v-2.8c-4.2.9-5.1-1.8-5.1-1.8-.7-1.7-1.7-2.1-1.7-2.1-1.4-1 .1-1 .1-1 1.5.1 2.3 1.5 2.3 1.5 1.3 2.3 3.5 1.6 4.4 1.2.1-1 .5-1.6 1-2-3.4-.4-6.9-1.7-6.9-7.5 0-1.7.6-3 1.5-4.1-.2-.4-.7-2 .2-4.1 0 0 1.3-.4 4.2 1.5a14.5 14.5 0 0 1 7.6 0C22.7 6.4 24 6.8 24 6.8c.8 2.1.3 3.7.1 4.1 1 1.1 1.5 2.4 1.5 4.1 0 5.8-3.5 7.1-6.9 7.5.6.5 1.1 1.4 1.1 2.8v4.2c0 .4.3.8 1 .7A15 15 0 0 0 16 1Z" />}
    </svg>
  )
}

export default function ContactMethods() {
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
      section.querySelectorAll<HTMLElement>(`.${styles.card}`).forEach((card, index) => {
        animations.push(card.animate([
          { opacity: 0, transform: 'translateY(16px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], {
          duration: 850,
          delay: index * 110,
          easing: 'cubic-bezier(.22, 1, .36, 1)',
          fill: 'backwards',
        }))
      })
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
    <section ref={sectionRef} className={styles.section} aria-label="Contact methods">
      <ul className={styles.cards}>
        {methods.map(({ label, value, href, icon }) => (
          <li key={label}>
            <a className={`${styles.card}${icon === 'whatsapp' ? ` ${styles.highlighted}` : ''}`} href={href}>
              <span className={styles.icon}><MethodIcon kind={icon} /></span>
              <span className={styles.details}>
                <span className={styles.label}>{label}</span>
                <span className={styles.value}>{value}</span>
              </span>
              <svg className={styles.arrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
