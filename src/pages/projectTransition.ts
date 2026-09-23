import { gsap } from 'gsap'

type PendingTransition = { overlay: HTMLElement; sourcePage: HTMLElement; destination: string }
let pending: PendingTransition | null = null

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const smallScreen = () => window.matchMedia('(max-width: 680px)').matches

export function openProject(event: React.MouseEvent | React.KeyboardEvent, preview: HTMLElement | null, destination: string) {
  if (event.defaultPrevented || ('button' in event && event.button !== 0) || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !preview || pending) return
  event.preventDefault()
  event.stopPropagation()
  const page = preview.closest<HTMLElement>('main')
  if (!page) return
  const rect = preview.getBoundingClientRect()
  const overlay = document.createElement('div')
  const clone = preview.cloneNode(true) as HTMLElement
  Object.assign(overlay.style, { position: 'fixed', zIndex: '10000', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, overflow: 'hidden', pointerEvents: 'none', background: '#050504', willChange: 'left, top, width, height, opacity' })
  Object.assign(clone.style, { width: '100%', height: '100%', margin: '0' })
  overlay.appendChild(clone)
  document.body.appendChild(overlay)
  pending = { overlay, sourcePage: page, destination }
  const navigate = () => {
    history.pushState(null, '', destination)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
  if (reducedMotion()) { overlay.remove(); pending = null; navigate(); return }
  if (smallScreen()) {
    gsap.set(overlay, { left: 0, top: 0, width: innerWidth, height: innerHeight, opacity: 0 })
    clone.remove()
    gsap.timeline({ onComplete: navigate })
      .to(page, { opacity: 0, duration: .3, ease: 'power2.inOut' }, 0)
      .to(overlay, { opacity: 1, duration: .3, ease: 'power2.inOut' }, 0)
    return
  }
  const full = { left: innerWidth * .04, top: innerHeight * .04, width: innerWidth * .92, height: innerHeight * .92 }
  gsap.timeline({ onComplete: navigate })
    .to(page, { opacity: 0, duration: .48, ease: 'sine.inOut' }, 0)
    .to(overlay, { ...full, duration: .68, ease: 'power2.inOut' }, 0)
}

export function finishProjectTransition(page: HTMLElement, target: HTMLElement | null, path: string) {
  if (!pending || pending.destination !== path) return
  const { overlay, sourcePage } = pending
  pending = null
  gsap.set(page, { opacity: 0 })
  const finish = () => {
    if (path === '/projects' && target && !smallScreen()) target.scrollIntoView({ block: 'center', behavior: 'instant' })
    const rect = target?.getBoundingClientRect()
    const destinationImage = !smallScreen() && target ? target.cloneNode(true) as HTMLElement : null
    if (destinationImage) {
      Object.assign(destinationImage.style, {
        position: 'absolute', inset: '0', width: '100%', height: '100%',
        margin: '0', objectFit: target instanceof HTMLImageElement ? 'contain' : '',
        opacity: '0', pointerEvents: 'none',
      })
      overlay.appendChild(destinationImage)
    }
    const timeline = gsap.timeline({ onComplete: () => { overlay.remove(); gsap.set([page, sourcePage], { clearProps: 'opacity' }) } })
      .to(page, { opacity: 1, duration: .5, ease: 'sine.out' }, 0)
      .to(overlay, smallScreen() || !rect ? { opacity: 0, duration: .4 } : {
        left: rect.left, top: rect.top, width: rect.width, height: rect.height,
        duration: .72, ease: 'power2.inOut',
      }, 0)
    if (!smallScreen() && rect) {
      if (destinationImage) timeline.to(destinationImage, { opacity: 1, duration: .36, ease: 'sine.inOut' }, .2)
      timeline.to(overlay, { opacity: 0, duration: .22, ease: 'sine.in' }, .5)
    }
  }
  if (target instanceof HTMLImageElement && !target.complete) {
    target.addEventListener('load', finish, { once: true })
    target.addEventListener('error', finish, { once: true })
  } else requestAnimationFrame(finish)
}
