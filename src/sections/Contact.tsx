import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './Contact.module.css'
import sword from '../assets/sword/ka-sword-with-logo.png'
import pedestal from '../assets/sword/sword-pedestal.png'

gsap.registerPlugin(ScrollTrigger)

export default function Contact() {
  const contactRef = useRef<HTMLElement>(null)
  const lightRef = useRef<SVGCircleElement>(null)

  useLayoutEffect(() => {
    const section = contactRef.current
    if (!section) return

    const media = gsap.matchMedia(section)

    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'clamp(top 85%)',
          once: true,
        },
      })
        .from(`.${styles.swordImage}`, {
          autoAlpha: 0,
          y: 20,
          duration: 0.85,
          ease: 'power2.out',
          clearProps: 'opacity,visibility,transform',
        }, 0)
        .from(`.${styles.content} > *`, {
          autoAlpha: 0,
          y: 20,
          duration: 0.85,
          stagger: 0.09,
          ease: 'power2.out',
          clearProps: 'opacity,visibility,transform',
        }, 0.1)
        .fromTo(`.${styles.swordImage}`, {
          filter: 'drop-shadow(0 0 0px rgba(180, 65, 54, 0))',
        }, {
          filter: 'drop-shadow(0 0 4px rgba(180, 65, 54, 0.3))',
          duration: 0.45,
          repeat: 1,
          yoyo: true,
          ease: 'sine.inOut',
          clearProps: 'filter',
        }, 0.85)
        .fromTo(`.${styles.settleFlash}`, { opacity: 0 }, {
          opacity: 0.3,
          duration: 0.22,
          repeat: 1,
          yoyo: true,
          ease: 'sine.inOut',
        }, 0.85)

      const button = section.querySelector<HTMLButtonElement>('button')
      const blade = section.querySelector<HTMLImageElement>(`.${styles.swordImage}`)
      const point = lightRef.current
      if (!button || !blade || !point) return

      const travel = { progress: 0 }
      const hoverLight = gsap.to(travel, {
        progress: 1,
        duration: 0.85,
        ease: 'sine.inOut',
        paused: true,
        onUpdate: () => {
          const canvas = point.ownerSVGElement!.getBoundingClientRect()
          const from = button.getBoundingClientRect()
          const to = blade.getBoundingClientRect()
          const startX = from.left + from.width / 2 - canvas.left
          const startY = from.top + from.height / 2 - canvas.top
          const endX = to.left + to.width / 2 - canvas.left
          const endY = to.top + to.height * 0.65 - canvas.top
          const progress = travel.progress
          point.setAttribute('cx', `${startX + (endX - startX) * progress}`)
          point.setAttribute('cy', `${startY + (endY - startY) * progress - Math.sin(progress * Math.PI) * 16}`)
          point.setAttribute('opacity', `${Math.sin(progress * Math.PI) * 0.65}`)
        },
      })
      const showLight = () => { hoverLight.restart() }
      button.addEventListener('pointerenter', showLight)

      return () => {
        button.removeEventListener('pointerenter', showLight)
        point.setAttribute('opacity', '0')
      }
    })

    return () => media.revert()
  }, [])

  return (
    <section ref={contactRef} id="contact" className={styles.contact} aria-labelledby="contact-title">
      <div className={styles.container}>
        <svg className={styles.hoverLight} aria-hidden="true" focusable="false">
          <circle ref={lightRef} r={1.8} opacity={0} />
        </svg>
        <div className={styles.sword} data-energy-cta-sword aria-hidden="true">
          <svg className={styles.bladeGlow} viewBox="0 0 1024 1536" aria-hidden="true" focusable="false">
            <g className={styles.tightGlow}>
              <ellipse cx={512} cy={995} rx={42} ry={420} />
              <circle cx={512} cy={95} r={48} />
            </g>
            <g className={styles.settleFlash}>
              <ellipse cx={512} cy={995} rx={60} ry={440} />
              <circle cx={512} cy={95} r={62} />
            </g>
          </svg>
          <img className={styles.pedestalImage} src={pedestal} alt="" width={1774} height={887} loading="lazy" />
          <img className={styles.swordImage} src={sword} alt="" width={1024} height={1536} loading="lazy" />
        </div>
        <div className={styles.content}>
          <h2 id="contact-title" className={styles.title}>
            Let’s forge <span>something great</span>
          </h2>
          <p className={styles.subtitle}>Your ideas. My code. A better tomorrow.</p>
          <button
            className={styles.button}
            type="button"
            disabled
            aria-label="Start a project — contact details coming soon"
          >
            Start a project
          </button>
        </div>
      </div>
    </section>
  )
}
