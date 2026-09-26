import { useId, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './EnergyTrail.module.css'
import heroStyles from '../sections/Hero.module.css'
import { heroSwordMotion, resetHeroSwordMotion } from './heroSwordMotion'
import { heroSwordRuntime } from './heroSwordRuntime'
import { finalCompileStart, projectPulseTiming as pulseTiming } from './heroSwordTiming'

gsap.registerPlugin(ScrollTrigger)

const trailSymbols = [
  { text: '</>', offset: 14, drift: 9, distance: -10, duration: 6.2, delay: 0 },
  { text: '•', offset: 27, drift: -12, distance: 9, duration: 4.8, delay: 0.7 },
  { text: '{ }', offset: 40, drift: 7, distance: 13, duration: 8.1, delay: 1.3 },
  { text: '01', offset: 54, drift: -10, distance: -13, duration: 7.3, delay: 0.4 },
  { text: '•', offset: 68, drift: 8, distance: -8, duration: 5.4, delay: 1.8 },
  { text: '/>', offset: 80, drift: 6, distance: 11, duration: 9.2, delay: 1.1 },
  { text: '•', offset: 34, drift: 5, distance: -18, duration: 3.7, delay: 2.3 },
  { text: '•', offset: 73, drift: -6, distance: 17, duration: 6.7, delay: 0.9 },
]

function TrailSymbols({ pathId, converge = false }: { pathId: string; converge?: boolean }) {
  return (
    <g>
      {trailSymbols.map((symbol, index) => (
        <text
          key={index}
          className={symbol.text === '•' ? `${styles.code} ${styles.particle}` : styles.code}
          dy={converge ? symbol.distance * (1 - symbol.offset / 100) * 0.4 : symbol.distance}
        >
          <textPath href={`#${pathId}`} startOffset={`${symbol.offset}%`}>
            {symbol.text}
          </textPath>
        </text>
      ))}
    </g>
  )
}

export default function EnergyTrail() {
  const svgRef = useRef<SVGSVGElement>(null)
  const continuationRef = useRef<SVGSVGElement>(null)
  const thirdSegmentRef = useRef<SVGSVGElement>(null)
  const finalSegmentRef = useRef<SVGSVGElement>(null)
  const pathId = useId()
  const continuationPathId = useId()
  const thirdSegmentPathId = useId()
  const finalSegmentPathId = useId()
  const heroCoreId = useId()
  const heroGlowId = useId()

  useLayoutEffect(() => {
    const svg = svgRef.current
    const stage = svg?.parentElement
    const sword = stage?.querySelector<HTMLElement>('[data-energy-sword]')
    const project = stage?.querySelector<HTMLElement>('[data-energy-project]')
    const hero = stage?.querySelector<HTMLElement>('#home')
    const swordModel = stage?.querySelector<HTMLElement>('[data-hero-sword-model]')
    const continuation = continuationRef.current
    const secondProject = stage?.querySelector<HTMLElement>('article[aria-labelledby="project-02"]')
    const thirdSegment = thirdSegmentRef.current
    const thirdProject = stage?.querySelector<HTMLElement>('article[aria-labelledby="project-03"]')
    const finalSegment = finalSegmentRef.current
    const ctaSword = stage?.querySelector<HTMLElement>('[data-energy-cta-sword]')
    if (!svg || !stage || !sword || !project || !hero) return

    // Read layout coordinates so entrance transforms cannot shift the trail.
    const position = (element: HTMLElement) => {
      let x = 0
      let y = 0
      let current: HTMLElement | null = element
      while (current && current !== stage) {
        x += current.offsetLeft
        y += current.offsetTop
        current = current.offsetParent as HTMLElement | null
      }
      return { x, y }
    }

    const updatePath = () => {
      const width = stage.clientWidth
      const swordPosition = position(sword)
      const projectPosition = position(project)
      const startX = swordPosition.x + sword.offsetWidth / 2
      const modelPosition = swordModel ? position(swordModel) : swordPosition
      // offsetTop is the centered wrapper's anchor; account for translateY(-50%).
      const startY = swordModel
        ? modelPosition.y - swordModel.offsetHeight * 0.02
        : swordPosition.y + sword.offsetHeight * 0.6
      const endY = projectPosition.y + project.offsetHeight - 20
      const distance = Math.max(0, endY - startY)
      const endX = projectPosition.x + project.offsetWidth * 0.75
      const path = `M ${startX} ${startY}
        C ${width * 0.94} ${startY + distance * 0.2},
          ${width * 0.1} ${startY + distance * 0.12},
          ${width * 0.12} ${startY + distance * 0.46}
        S ${width * 0.9} ${startY + distance * 0.72}, ${endX} ${endY}`

      svg.setAttribute('viewBox', `0 0 ${width} ${endY + 12}`)
      svg.style.height = `${endY + 12}px`
      svg.querySelectorAll('path').forEach((line) => line.setAttribute('d', path))
      svg.style.visibility = 'visible'
      const sourceGlow = svg.querySelector('ellipse')
      sourceGlow?.setAttribute('cx', `${startX}`)
      sourceGlow?.setAttribute('cy', `${startY}`)
      const sourcePath = svg.querySelector<SVGPathElement>(`path[id]`)
      if (sourcePath) {
        const length = sourcePath.getTotalLength()
        svg.querySelectorAll('circle').forEach((particle, index) => {
          const point = sourcePath.getPointAtLength(length * index * 0.012)
          particle.setAttribute('cx', `${point.x}`)
          particle.setAttribute('cy', `${point.y}`)
        })
      }

      if (continuation && secondProject) {
        const secondPosition = position(secondProject)
        const continuationEndY = secondPosition.y + secondProject.offsetHeight - 20
        const continuationHeight = continuationEndY - endY
        const continuationEndX = secondPosition.x + secondProject.offsetWidth * 0.25
        const continuationPath = `M ${endX} 0
          C ${endX + (endX - width * 0.9) * 0.5} ${distance * 0.14},
            ${width * 0.08} ${continuationHeight * 0.4},
            ${width * 0.12} ${continuationHeight * 0.65}
          S ${width * 0.35} ${continuationHeight * 0.88},
            ${continuationEndX} ${continuationHeight}`

        continuation.setAttribute('viewBox', `0 -6 ${width} ${continuationHeight + 18}`)
        continuation.style.top = `${endY - 6}px`
        continuation.style.height = `${continuationHeight + 18}px`
        continuation.querySelectorAll('path').forEach((line) => line.setAttribute('d', continuationPath))
        continuation.style.visibility = 'visible'
      }

      if (thirdSegment && secondProject && thirdProject) {
        const secondPosition = position(secondProject)
        const thirdPosition = position(thirdProject)
        const segmentStartX = secondPosition.x + secondProject.offsetWidth * 0.25
        const segmentStartY = secondPosition.y + secondProject.offsetHeight - 20
        const segmentEndY = thirdPosition.y + thirdProject.offsetHeight - 20
        const segmentHeight = segmentEndY - segmentStartY
        const previousHeight = segmentStartY - endY
        const segmentEndX = thirdPosition.x + thirdProject.offsetWidth * 0.75
        const segmentPath = `M ${segmentStartX} 0
          C ${segmentStartX + (segmentStartX - width * 0.35) * 0.5} ${previousHeight * 0.06},
            ${width * 0.92} ${segmentHeight * 0.4},
            ${width * 0.88} ${segmentHeight * 0.65}
          S ${width * 0.65} ${segmentHeight * 0.88},
            ${segmentEndX} ${segmentHeight}`

        thirdSegment.setAttribute('viewBox', `0 -6 ${width} ${segmentHeight + 18}`)
        thirdSegment.style.top = `${segmentStartY - 6}px`
        thirdSegment.style.height = `${segmentHeight + 18}px`
        thirdSegment.querySelectorAll('path').forEach((line) => line.setAttribute('d', segmentPath))
        thirdSegment.style.visibility = 'visible'
      }

      if (finalSegment && secondProject && thirdProject && ctaSword) {
        const thirdPosition = position(thirdProject)
        const secondPosition = position(secondProject)
        const ctaPosition = position(ctaSword)
        const segmentStartX = thirdPosition.x + thirdProject.offsetWidth * 0.75
        const segmentStartY = thirdPosition.y + thirdProject.offsetHeight - 20
        const previousHeight = segmentStartY - (secondPosition.y + secondProject.offsetHeight - 20)
        const segmentEndX = ctaPosition.x + ctaSword.offsetWidth / 2
        const segmentEndY = ctaPosition.y + ctaSword.offsetHeight * 0.7
        const segmentHeight = segmentEndY - segmentStartY
        const bottomY = stage.clientHeight - segmentStartY
        const remainingHeight = Math.max(0, bottomY - segmentHeight)
        const bottomX = Math.max(width * 0.08, Math.min(width * 0.92, segmentEndX + width * 0.08))
        const segmentPath = `M ${segmentStartX} 0
          C ${segmentStartX + (segmentStartX - width * 0.65) * 0.5} ${previousHeight * 0.06},
            ${segmentEndX} ${segmentHeight * 0.55},
            ${segmentEndX} ${segmentHeight}
          C ${segmentEndX} ${segmentHeight + remainingHeight * 0.35},
            ${bottomX} ${segmentHeight + remainingHeight * 0.7},
            ${bottomX} ${bottomY + 12}`

        finalSegment.setAttribute('viewBox', `0 -6 ${width} ${bottomY + 18}`)
        finalSegment.style.top = `${segmentStartY - 6}px`
        finalSegment.style.height = `${bottomY + 18}px`
        finalSegment.querySelectorAll('path').forEach((line) => line.setAttribute('d', segmentPath))
        finalSegment.style.visibility = 'visible'
      }
    }

    updatePath()
    const observer = new ResizeObserver(updatePath)
    observer.observe(stage)
    observer.observe(sword)
    observer.observe(project)
    if (secondProject) observer.observe(secondProject)
    if (thirdProject) observer.observe(thirdProject)
    if (ctaSword) observer.observe(ctaSword)
    ScrollTrigger.addEventListener('refreshInit', updatePath)

    const media = gsap.matchMedia(svg)
    media.add({
      motion: '(prefers-reduced-motion: no-preference)',
      desktop: '(min-width: 681px) and (any-hover: hover) and (any-pointer: fine)',
      compact: '(max-width: 1024px), (hover: none)',
    }, (context) => {
      resetHeroSwordMotion()
      if (!context.conditions?.motion) return
      const desktop = Boolean(context.conditions.desktop)
      const sourcePath = svg.querySelector<SVGPathElement>('path[id]')
      const activationCleanups = ([['01', svg], ['02', continuation], ['03', thirdSegment]] as const).map(([id, segment]) => {
        const sourcePath = segment?.querySelector<SVGPathElement>('path[id]')
        const pulsePath = segment?.querySelector<SVGPathElement>('[data-project-pulse]')
      let activation: gsap.core.Timeline | undefined
      const unsubscribeCheckpoint = desktop && sourcePath && pulsePath
        ? heroSwordRuntime.onProjectReached(id, () => {
          if (heroSwordRuntime.state.projects[id].activated || activation) return
          // Join the existing trail at the point nearest the sword's checkpoint pose.
          const surface = hero.querySelector<HTMLElement>('[data-sword-render-surface]')
          const bounds = surface?.getBoundingClientRect()
          const matrix = sourcePath.getScreenCTM()
          const length = sourcePath.getTotalLength()
          let start = 0
          if (bounds && matrix) {
            let distance = Infinity
            for (let index = 0; index <= 90; index++) {
              const progress = index / 100
              const point = sourcePath.getPointAtLength(length * progress).matrixTransform(matrix)
              const next = Math.hypot(point.x - (bounds.left + bounds.width / 2), point.y - (bounds.top + bounds.height / 2))
              if (next < distance) { distance = next; start = progress }
            }
          }
          activation = gsap.timeline()
            .to(heroSwordRuntime.state.projects[id], { glow: 1, duration: pulseTiming.charge, ease: 'sine.inOut' }, 0)
            .fromTo(pulsePath, { strokeDashoffset: -start * 1000, opacity: 0 },
              { opacity: 0.7, duration: 0.2, ease: 'sine.out' }, pulseTiming.release)
            .to(pulsePath, { strokeDashoffset: -1000, duration: pulseTiming.travel, ease: 'sine.inOut' }, pulseTiming.release)
            .to(heroSwordRuntime.state.projects[id], { glow: 0, duration: pulseTiming.decay, ease: 'sine.inOut' }, 0.34)
            .call(() => heroSwordRuntime.activateProject(id), [], pulseTiming.arrival)
            .to(pulsePath, { opacity: 0, duration: pulseTiming.fade, ease: 'sine.out' }, pulseTiming.arrival)
        }) : undefined

        return () => {
          unsubscribeCheckpoint?.()
          activation?.kill()
          heroSwordRuntime.state.projects[id].glow = 0
          if (pulsePath) {
            pulsePath.style.opacity = '0'
            pulsePath.style.removeProperty('stroke-dashoffset')
          }
        }
      })

      ;[continuation, thirdSegment, finalSegment].forEach((segment, segmentIndex) => {
        if (!segment) return
        if (desktop && segment === finalSegment) return

        segment.querySelectorAll('textPath').forEach((symbol, index) => {
          if (context.conditions?.compact && index !== 0) return
          const motion = trailSymbols[index]
          gsap.to(symbol, {
            attr: { startOffset: `${motion.offset + motion.drift}%` },
            duration: motion.duration + (segmentIndex + 1) * (index % 2 === 0 ? 0.7 : 0.35),
            delay: motion.delay + (segmentIndex + 1) * 0.43,
            repeatDelay: 0.15 + (index % 3) * 0.23,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            scrollTrigger: {
              trigger: segment,
              start: 'top bottom',
              end: 'bottom top',
              toggleActions: 'play pause resume pause',
            },
          })
        })
      })

      const sequence = gsap.timeline({
        defaults: { ease: 'sine.inOut' },
        scrollTrigger: {
          id: 'hero-sword-release',
          trigger: hero,
          start: 'top top',
          endTrigger: project,
          end: 'bottom 85%',
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      })
        .fromTo(svg.querySelectorAll('path:not([data-project-pulse])'), { strokeDashoffset: 1000 },
          { strokeDashoffset: 0, duration: desktop ? 0.72 : 1, ease: 'none' }, desktop ? 0.28 : 0)
        .fromTo(svg.querySelectorAll('text'), { opacity: 0 },
          { opacity: 0.2, duration: 0.5, stagger: 0.015 }, 0.35)

      if (desktop) {
        sequence.to(heroSwordMotion, { lift: 0.12, tilt: -0.045, glow: 1, duration: 0.24 }, 0)
          .to(heroSwordMotion, { glow: 0.25, duration: 0.4 }, 0.3)
          .to(heroSwordMotion, { recede: 1, lift: 0.16, tilt: -0.025, duration: 0.6 }, 0.4)

        const spirals = hero.querySelectorAll(`.${heroStyles.energySpiral}`)
        sequence.to(spirals, { scaleX: 0.84, scaleY: 0.95, transformOrigin: '50% 50%', duration: 0.24 }, 0.03)
          .to(spirals, { scaleX: 1, scaleY: 1, duration: 0.35 }, 0.28)
        sequence.fromTo(svg.querySelector('ellipse'), { opacity: 0 },
          { opacity: 0.45, duration: 0.12 }, 0.23)
          .to(svg.querySelector('ellipse'), { opacity: 0.1, duration: 0.35 }, 0.35)

        // These are the existing trail symbols, released from its sword-side origin.
        svg.querySelectorAll('textPath').forEach((symbol, index) => {
          if (context.conditions?.compact && index !== 0) return
          sequence.fromTo(symbol, { attr: { startOffset: '0%' } }, {
            attr: { startOffset: `${trailSymbols[index].offset}%` },
            duration: 0.48 + (index % 3) * 0.05,
            ease: 'power1.out',
          }, 0.29 + index * 0.018)
        })

        if (sourcePath) {
          svg.querySelectorAll('circle').forEach((particle, index) => {
            if (context.conditions?.compact) return
            const travel = { progress: 0 }
            const renderParticle = () => {
              const point = sourcePath.getPointAtLength(sourcePath.getTotalLength() * travel.progress * (0.5 + index * 0.1))
              particle.setAttribute('cx', `${point.x}`)
              particle.setAttribute('cy', `${point.y}`)
            }
            sequence.to(travel, { progress: 1, duration: 0.46 + index * 0.045,
              ease: 'power1.out', onUpdate: renderParticle }, 0.29 + index * 0.035)
            sequence.fromTo(particle, { opacity: 0 }, { opacity: 0.6, duration: 0.08 }, 0.29 + index * 0.035)
              .to(particle, { opacity: 0, duration: 0.18 }, 0.65 + index * 0.04)
          })
        }
        const symbols = hero.querySelectorAll(`.${heroStyles.energySymbols} text`)
        symbols.forEach((symbol, index) => {
          sequence.to(symbol, { x: (1 - index) * 12, y: 24 + index * 10,
            opacity: 0, duration: 0.25 + index * 0.04 }, 0.24 + index * 0.035)
        })
        // Animate the parent so the existing idle particle motion keeps its own transforms.
        sequence.to(hero.querySelector(`.${heroStyles.energyParticles}`),
          { y: 35, opacity: 0, duration: 0.35 }, 0.26)
      } else {
        gsap.set(svg.querySelectorAll('circle, ellipse'), { opacity: 0 })
      }

      if (continuation && secondProject) {
        gsap.timeline({
          scrollTrigger: {
            trigger: project,
            start: 'bottom 85%',
            endTrigger: secondProject,
            end: 'bottom 85%',
            scrub: 0.8,
          },
        })
          .fromTo(continuation.querySelectorAll('path:not([data-project-pulse])'),
            { strokeDashoffset: 1000 },
            { strokeDashoffset: 0, duration: 1, ease: 'none' }, 0)
          .fromTo(continuation.querySelectorAll('text'),
            { opacity: 0 },
            { opacity: 0.2, duration: 0.7, ease: 'none' }, 0.3)
      }
      if (thirdSegment && secondProject && thirdProject) {
        gsap.timeline({
          scrollTrigger: {
            trigger: secondProject,
            start: 'bottom 85%',
            endTrigger: thirdProject,
            end: 'bottom 85%',
            scrub: 0.8,
          },
        })
          .fromTo(thirdSegment.querySelectorAll('path:not([data-project-pulse])'),
            { strokeDashoffset: 1000 },
            { strokeDashoffset: 0, duration: 1, ease: 'none' }, 0)
          .fromTo(thirdSegment.querySelectorAll('text'),
            { opacity: 0 },
            { opacity: 0.2, duration: 0.7, ease: 'none' }, 0.3)
      }
      let unsubscribeFinal: (() => void) | undefined
      if (desktop && finalSegment) {
        const finalTravel = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
          .fromTo(finalSegment.querySelectorAll('path'), { strokeDashoffset: 1000 },
            { strokeDashoffset: 0, duration: finalCompileStart }, 0)
          .to(finalSegment.querySelectorAll('path'),
            { strokeDashoffset: 0, duration: 1 - finalCompileStart, ease: 'sine.inOut' }, finalCompileStart)
          .fromTo(finalSegment.querySelectorAll('text'), { opacity: 0 },
            { opacity: 0.2, duration: 0.3 }, 0.15)
          .to(finalSegment.querySelectorAll('textPath'),
            { attr: { startOffset: '99%' }, duration: 0.30, stagger: 0.008, ease: 'sine.inOut' }, finalCompileStart)
          .to(finalSegment.querySelectorAll('text'),
            { attr: { dy: 0 }, opacity: 0, duration: 0.22, ease: 'sine.inOut' }, 0.78)
        unsubscribeFinal = heroSwordRuntime.onFinalProgress(() => {
          finalTravel.progress(heroSwordRuntime.state.finalTravelProgress)
        })
      } else if (finalSegment && thirdProject && ctaSword) {
        gsap.timeline({
          scrollTrigger: {
            trigger: thirdProject,
            start: 'bottom 85%',
            endTrigger: ctaSword,
            end: 'clamp(bottom 85%)',
            scrub: 0.8,
          },
        })
          .fromTo(finalSegment.querySelectorAll('path'),
            { strokeDashoffset: 1000 },
            { strokeDashoffset: 0, duration: 1, ease: 'none' }, 0)
          .fromTo(finalSegment.querySelectorAll('text'),
            { opacity: 0 },
            { opacity: 0.2, duration: 0.7, ease: 'none' }, 0.3)
      }
      return () => {
        unsubscribeFinal?.()
        activationCleanups.forEach((cleanup) => cleanup())
        resetHeroSwordMotion()
        svg.querySelectorAll('circle').forEach((particle) => particle.setAttribute('opacity', '0.25'))
        updatePath()
      }
    })

    return () => {
      observer.disconnect()
      ScrollTrigger.removeEventListener('refreshInit', updatePath)
      media.revert()
    }
  }, [])

  return (
    <>
    <svg ref={svgRef} className={styles.trail} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={heroCoreId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff8a72" />
          <stop offset="18%" stopColor="#ff4038" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ff4038" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={heroGlowId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff4038" />
          <stop offset="25%" stopColor="#ed302b" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ed302b" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <ellipse className={styles.sourceGlow} rx={12} ry={28} />
      <path className={`${styles.glow} ${styles.heroGlow}`} style={{ stroke: `url(#${heroGlowId})` }} pathLength={1000} />
      <path id={pathId} data-hero-project01-path className={`${styles.line} ${styles.heroCore}`} style={{ stroke: `url(#${heroCoreId})` }} pathLength={1000} />
      <path data-project-pulse className={styles.heroPulse} pathLength={1000} />
      <TrailSymbols pathId={pathId} />
      {[1.2, 1.6, 1, 1.4].map((radius, index) => (
        <circle key={index} className={styles.sourceParticle} r={radius} opacity={0.25} />
      ))}
    </svg>
    <svg ref={continuationRef} className={styles.trail} aria-hidden="true" focusable="false">
      <path className={styles.glow} pathLength={1000} />
      <path id={continuationPathId} data-sword-rail="project02" className={styles.line} pathLength={1000} />
      <path data-project-pulse className={styles.heroPulse} pathLength={1000} />
      <TrailSymbols pathId={continuationPathId} />
    </svg>
    <svg ref={thirdSegmentRef} className={styles.trail} aria-hidden="true" focusable="false">
      <path className={styles.glow} pathLength={1000} />
      <path id={thirdSegmentPathId} data-sword-rail="project03" className={styles.line} pathLength={1000} />
      <path data-project-pulse className={styles.heroPulse} pathLength={1000} />
      <TrailSymbols pathId={thirdSegmentPathId} />
    </svg>
    <svg ref={finalSegmentRef} className={styles.trail} aria-hidden="true" focusable="false">
      <path className={styles.glow} pathLength={1000} />
      <path id={finalSegmentPathId} data-sword-rail="cta" className={styles.line} pathLength={1000} />
      <TrailSymbols pathId={finalSegmentPathId} converge />
    </svg>
    </>
  )
}
