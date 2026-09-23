import { lazy, Suspense, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import sword from '../assets/sword/ka-sword-with-logo.png'
import styles from './Hero.module.css'
import pedestal from '../assets/sword/sword-pedestal.png'
import wordmark from '../assets/branding/kinda-wordmark.png'

const Sword3D = lazy(() => import('../components/Sword3D'))
const swordFallback = <img src={sword} alt="" width={1024} height={1536}
  style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />

const spiralBack = 'M 185 216 C 225 223 286 235 286 256 M 112 302 C 112 322 288 330 288 350 M 118 398 C 118 418 278 426 278 446 M 136 492 C 136 509 238 518 238 534'
const spiralFront = 'M 286 256 C 286 277 112 281 112 302 M 288 350 C 288 371 118 377 118 398 M 278 446 C 278 467 136 473 136 492 M 238 534 C 238 545 211 549 195 553'

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const media = gsap.matchMedia(heroRef)

    media.add({
      motion: '(prefers-reduced-motion: no-preference)',
      compact: '(max-width: 1024px), (hover: none)',
    }, (context) => {
      if (!context.conditions?.motion) return
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

      gsap.to(`.${styles.energyCoil}`, {
        opacity: 0.78,
        duration: 3.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to(`.${styles.energyParticles} circle${context.conditions?.compact ? ':nth-child(-n+2)' : ''}`, {
        opacity: 0.25,
        y: -5,
        duration: 2.6,
        stagger: 0.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
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
          <div className={styles.swordAtmosphere} />
          <div className={`${styles.depthParticles} ${styles.depthParticlesBack}`}>
            {Array.from({ length: 6 }, (_, index) => <i key={index} />)}
          </div>
          <svg
            className={`${styles.energySpiral} ${styles.energyBack}`}
            viewBox="0 0 400 600"
            fill="none"
            focusable="false"
          >
            <defs>
              <linearGradient id="hero-spiral-back" x1="80" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#b91f20" stopOpacity="0.18" />
                <stop offset="0.34" stopColor="#ef3a35" stopOpacity="0.58" />
                <stop offset="0.5" stopColor="#ff8a79" stopOpacity="0.9" />
                <stop offset="0.66" stopColor="#ef3a35" stopOpacity="0.58" />
                <stop offset="1" stopColor="#b91f20" stopOpacity="0.18" />
              </linearGradient>
            </defs>
            <g className={styles.energyCoil}>
              <path className={styles.energyGlow} d={spiralBack} />
              <path d={spiralBack} />
            </g>
          </svg>
          <div className={styles.swordImage} data-hero-sword-model>
            <Suspense fallback={swordFallback}>
              <Sword3D
                idleRotation
                style={{ height: '100%' }}
                fallback={swordFallback}
              />
            </Suspense>
          </div>
          <div className={`${styles.depthParticles} ${styles.depthParticlesFront}`}>
            {Array.from({ length: 3 }, (_, index) => <i key={index} />)}
          </div>
          <svg
            className={`${styles.energySpiral} ${styles.energyFront}`}
            viewBox="0 0 400 600"
            fill="none"
            focusable="false"
          >
            <defs>
              <linearGradient id="hero-spiral-front" x1="80" y1="0" x2="320" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#c92122" stopOpacity="0.25" />
                <stop offset="0.34" stopColor="#ff433b" stopOpacity="0.72" />
                <stop offset="0.5" stopColor="#ffd0c5" />
                <stop offset="0.66" stopColor="#ff433b" stopOpacity="0.72" />
                <stop offset="1" stopColor="#c92122" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            <g className={styles.energyCoil}>
              <path className={styles.energyGlow} d={spiralFront} />
              <path d={spiralFront} />
            </g>
            <g className={styles.energySymbols}>
              <text x="99" y="263" transform="rotate(-12 99 263)">{'</>'}</text>
              <text x="295" y="389" transform="rotate(10 295 389)">{'{ }'}</text>
              <text x="104" y="465" transform="rotate(-8 104 465)">{'<>'}</text>
            </g>
            <g className={styles.energyParticles}>
              <circle cx="270" cy="247" r="1.2" />
              <circle cx="123" cy="318" r="1" />
              <circle cx="300" cy="343" r="1.4" />
              <circle cx="105" cy="394" r="1.1" />
              <circle cx="267" cy="470" r="1" />
              <circle cx="151" cy="516" r="1.3" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  )
}
