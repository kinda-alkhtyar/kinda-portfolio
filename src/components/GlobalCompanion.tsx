import { lazy, Suspense, useEffect, useRef } from 'react'
import styles from './GlobalCompanion.module.css'

const CompanionSword3D = lazy(() => import('./CompanionSword3D'))

export default function GlobalCompanion({ page }: { page: string }) {
  const host = useRef<HTMLDivElement>(null)
  const settledPosition = useRef<{ x: number; y: number } | null>(null)
  useEffect(() => {
    const element = host.current
    if (!element) return
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let lastSection: Element | undefined
    let position = settledPosition.current ?? { x: 0, y: 0 }
    let initialized = settledPosition.current !== null
    let animation: Animation | undefined
    let dragging = false
    const update = () => {
      frame = 0
      if (dragging || innerWidth < 1200) return
      const width = document.documentElement.clientWidth
      const sections = [...document.querySelectorAll('section')]
      const section = sections.find((item) => {
        const rect = item.getBoundingClientRect()
        return rect.top <= innerHeight * 0.45 && rect.bottom > innerHeight * 0.45
      }) ?? sections.find((item) => item.getBoundingClientRect().bottom > 100)
      const obstacles = [...document.querySelectorAll('header, h1, h2, h3, p, a, button, form, article, input, textarea, select, blockquote')]
        .filter((item) => !element.contains(item))
        .map((item) => item.getBoundingClientRect())
        .filter((rect) => rect.width && rect.height && rect.bottom > 0 && rect.top < innerHeight)
      // The transparent canvas is wider than the sword. Check its visible silhouette
      // so full-width text boxes do not incorrectly eliminate both viewport gutters.
      const overlap = (point: { x: number; y: number }) => obstacles.reduce((area, rect) =>
        area + Math.max(0, Math.min(point.x + 49.2, rect.right + 6) - Math.max(point.x + 10.8, rect.left - 6))
          * Math.max(0, Math.min(point.y + 127.6, rect.bottom + 6) - Math.max(point.y - 11.6, rect.top - 6)), 0)
      const safe = (point: { x: number; y: number }) => overlap(point) === 0
      element.style.visibility = 'visible'
      if (animation?.playState === 'running') return
      if (initialized && section === lastSection && safe(position)
        && position.x + 60 <= width && position.y >= 20 && position.y + 127.6 <= innerHeight) {
        return
      }
      const index = Math.max(0, sections.indexOf(section!))
      const rightFirst = (index + (page === '/about' ? 1 : 0)) % 2 === 0
      const sides = rightFirst ? [width - 60, 0] : [0, width - 60]
      const heights = index % 3 === 2 ? [0.5, 0.72, 0.3] : [0.72, 0.3, 0.5]
      const candidates = sides.flatMap((x) => heights.map((height) => ({ x, y: Math.max(100, Math.min(innerHeight - 132, innerHeight * height - 58)) })))
      // Search extra gutter slots before falling back to the least obstructed one.
      // Never hide the entire companion just because the preferred slot is occupied.
      for (const x of sides) {
        for (let y = 20; y <= innerHeight - 136; y += 24) candidates.push({ x, y })
      }
      const next = candidates.find(safe) ?? candidates.reduce((best, point) => overlap(point) < overlap(best) ? point : best)
      if (initialized && next.x === position.x && next.y === position.y) {
        lastSection = section
        element.style.pointerEvents = 'auto'
        return
      }
      animation?.cancel()
      const transform = (point: typeof next, scale = 1) => `translate3d(${point.x}px, ${point.y}px, 0) scale(${scale})`
      element.style.transform = transform(next)
      if (initialized && !motion.matches) {
        const from = position
        const routes = [-45, 45, -innerHeight * 0.5, innerHeight * 0.5]
        const routePoint = (t: number, bend: number) => ({
          x: from.x + (next.x - from.x) * t,
          y: Math.max(20, Math.min(innerHeight - 136, from.y + (next.y - from.y) * t + Math.sin(t * Math.PI) * bend)),
        })
        const cost = (bend: number) => Array.from({ length: 25 }, (_, i) => overlap(routePoint(i / 24, bend))).reduce((a, b) => a + b, 0)
        const bend = routes.reduce((best, candidate) => cost(candidate) < cost(best) ? candidate : best)
        animation = element.animate(Array.from({ length: 25 }, (_, i) => {
          const t = i / 24
          const point = routePoint(t, bend)
          return { transform: transform(point, 1 - Math.sin(t * Math.PI) * 0.06) }
        }), { duration: 1400, easing: 'cubic-bezier(.45, 0, .2, 1)' })
        element.style.pointerEvents = 'none'
        animation.onfinish = () => { element.style.pointerEvents = 'auto'; schedule() }
      } else element.style.pointerEvents = 'auto'
      position = next
      settledPosition.current = next
      initialized = true
      lastSection = section
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const down = () => { dragging = true }
    const up = () => { dragging = false; schedule() }
    const resize = () => { lastSection = undefined; schedule() }
    const reduce = () => { animation?.cancel(); element.style.pointerEvents = 'auto'; schedule() }
    const observer = new MutationObserver(schedule)
    observer.observe(document.getElementById('root')!, { childList: true, subtree: true })
    element.addEventListener('pointerdown', down, true)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    window.addEventListener('blur', up)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', resize)
    motion.addEventListener('change', reduce)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      animation?.cancel()
      observer.disconnect()
      element.removeEventListener('pointerdown', down, true)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      window.removeEventListener('blur', up)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', resize)
      motion.removeEventListener('change', reduce)
    }
  }, [page])
  return <div ref={host} className={styles.companion} aria-label="Drag to rotate companion sword">
    <Suspense fallback={null}><CompanionSword3D /></Suspense>
  </div>
}
