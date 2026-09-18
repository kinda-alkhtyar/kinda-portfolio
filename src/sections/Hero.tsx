import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './Hero.module.css'
import sword from '../assets/sword/ka-sword-with-logo.png'
import pedestal from '../assets/sword/sword-pedestal.png'
import wordmark from '../assets/branding/kinda-wordmark.png'

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const media = gsap.matchMedia(heroRef)

    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(
        [styles.title, styles.eyebrow, styles.button, styles.swordVisual]
          .map((className) => `.${className}`)
          .join(', '),
        {
          autoAlpha: 0,
          y: 24,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power2.out',
          clearProps: 'opacity,visibility,transform',
        },
      )
    })

    return () => media.revert()
  }, [])

  return (
    <section ref={heroRef} id="home" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 id="hero-title" className={styles.title}>
            <img
              className={styles.wordmark}
              src={wordmark}
              alt="Kinda Alhidyar"
              width={1280}
              height={960}
            />
          </h1>
          <p className={styles.eyebrow}>Full-stack Developer</p>
          <div className={styles.actions}>
            <a className={styles.button} href="#projects">
              View work <span aria-hidden="true">↗</span>
            </a>
            <a className={`${styles.button} ${styles.secondaryButton}`} href="#contact">
              Let's work together
            </a>
          </div>
        </div>

        <div className={styles.swordVisual} data-energy-sword aria-hidden="true">
          <img className={styles.pedestalImage} src={pedestal} alt="" width={1774} height={887} />
          <img className={styles.swordImage} src={sword} alt="" width={1024} height={1536} />
        </div>
      </div>
    </section>
  )
}
