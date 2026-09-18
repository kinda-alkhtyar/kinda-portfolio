import { useId, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './EnergyTrail.module.css'

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
      const startY = swordPosition.y + sword.offsetHeight * 0.9
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
        const segmentPath = `M ${segmentStartX} 0
          C ${segmentStartX + (segmentStartX - width * 0.65) * 0.5} ${previousHeight * 0.06},
            ${segmentEndX} ${segmentHeight * 0.55},
            ${segmentEndX} ${segmentHeight}`

        finalSegment.setAttribute('viewBox', `0 -6 ${width} ${segmentHeight + 18}`)
        finalSegment.style.top = `${segmentStartY - 6}px`
        finalSegment.style.height = `${segmentHeight + 18}px`
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
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const sourcePath = svg.querySelector<SVGPathElement>('path[id]')
      if (sourcePath) {
        svg.querySelectorAll('circle').forEach((particle, index) => {
          const travel = { progress: 0 }
          gsap.to(travel, {
            progress: 1,
            duration: 2.6 + index * 0.53,
            delay: index * 0.61,
            repeat: -1,
            repeatDelay: 0.25 + index * 0.17,
            ease: 'none',
            onUpdate: () => {
              const point = sourcePath.getPointAtLength(
                sourcePath.getTotalLength() * travel.progress * (0.09 + index * 0.015),
              )
              particle.setAttribute('cx', `${point.x}`)
              particle.setAttribute('cy', `${point.y + Math.sin(travel.progress * Math.PI) * (index % 2 ? -7 : 7)}`)
              particle.setAttribute('opacity', `${Math.sin(travel.progress * Math.PI) * 0.5}`)
            },
            scrollTrigger: {
              trigger: hero,
              start: 'top bottom',
              end: 'bottom top',
              toggleActions: 'play pause resume pause',
            },
          })
        })
      }

      ;[svg, continuation, thirdSegment, finalSegment].forEach((segment, segmentIndex) => {
        if (!segment) return

        segment.querySelectorAll('textPath').forEach((symbol, index) => {
          const motion = trailSymbols[index]
          gsap.to(symbol, {
            attr: { startOffset: `${motion.offset + motion.drift}%` },
            duration: motion.duration + segmentIndex * (index % 2 === 0 ? 0.7 : 0.35),
            delay: motion.delay + segmentIndex * 0.43,
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

      gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          endTrigger: project,
          end: 'bottom 85%',
          scrub: 0.8,
        },
      })
        .fromTo('path', { strokeDashoffset: 1000 }, { strokeDashoffset: 0, duration: 1, ease: 'none' }, 0)
        .fromTo('text', { opacity: 0 }, { opacity: 0.2, duration: 0.7, ease: 'none' }, 0.3)

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
          .fromTo(continuation.querySelectorAll('path'),
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
          .fromTo(thirdSegment.querySelectorAll('path'),
            { strokeDashoffset: 1000 },
            { strokeDashoffset: 0, duration: 1, ease: 'none' }, 0)
          .fromTo(thirdSegment.querySelectorAll('text'),
            { opacity: 0 },
            { opacity: 0.2, duration: 0.7, ease: 'none' }, 0.3)
      }
      if (finalSegment && thirdProject && ctaSword) {
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
      <path id={pathId} className={`${styles.line} ${styles.heroCore}`} style={{ stroke: `url(#${heroCoreId})` }} pathLength={1000} />
      <TrailSymbols pathId={pathId} />
      {[1.2, 1.6, 1, 1.4].map((radius, index) => (
        <circle key={index} className={styles.sourceParticle} r={radius} opacity={0.25} />
      ))}
    </svg>
    <svg ref={continuationRef} className={styles.trail} aria-hidden="true" focusable="false">
      <path className={styles.glow} pathLength={1000} />
      <path id={continuationPathId} className={styles.line} pathLength={1000} />
      <TrailSymbols pathId={continuationPathId} />
    </svg>
    <svg ref={thirdSegmentRef} className={styles.trail} aria-hidden="true" focusable="false">
      <path className={styles.glow} pathLength={1000} />
      <path id={thirdSegmentPathId} className={styles.line} pathLength={1000} />
      <TrailSymbols pathId={thirdSegmentPathId} />
    </svg>
    <svg ref={finalSegmentRef} className={styles.trail} aria-hidden="true" focusable="false">
      <path className={styles.glow} pathLength={1000} />
      <path id={finalSegmentPathId} className={styles.line} pathLength={1000} />
      <TrailSymbols pathId={finalSegmentPathId} converge />
    </svg>
    </>
  )
}
