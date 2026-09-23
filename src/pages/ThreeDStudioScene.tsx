import { useLayoutEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { DirectionalLight, Group } from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ThreeDStudioScene({ copyRef, backdropRef, rotationRef, reducedMotion, onActiveChange }: {
  copyRef: RefObject<HTMLDivElement | null>
  backdropRef: RefObject<HTMLDivElement | null>
  rotationRef: RefObject<Group | null>
  reducedMotion: boolean
  onActiveChange: (active: boolean) => void
}) {
  const { scene, invalidate } = useThree()
  const blend = useRef({ value: 0 })
  const elapsed = useRef(0)
  const gold = useRef<DirectionalLight>(null)
  const red = useRef<DirectionalLight>(null)
  const originalRotation = useRef(scene.environmentRotation.clone())
  const originalIntensity = useRef(scene.environmentIntensity)

  useLayoutEffect(() => {
    const copy = copyRef.current
    const backdrop = backdropRef.current
    if (!copy || !backdrop) return
    const context = gsap.context(() => {
      if (reducedMotion) {
        ScrollTrigger.create({
          trigger: copy, start: 'top 70%',
          onToggle: ({ isActive }) => {
            blend.current.value = isActive ? 1 : 0
            gsap.set(backdrop, { opacity: blend.current.value })
            onActiveChange(isActive)
            invalidate()
          },
        })
        return
      }
      gsap.timeline({
        scrollTrigger: {
          trigger: copy, start: 'top 80%', end: 'top 35%', scrub: 1.2,
          onEnter: () => onActiveChange(true),
          onLeaveBack: () => onActiveChange(false),
        },
      })
        .to(blend.current, { value: 1, duration: 1, ease: 'sine.inOut', onUpdate: invalidate }, 0)
        .to(backdrop, { opacity: 1, duration: 1, ease: 'sine.inOut' }, 0)
        .fromTo(copy.children, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .5, stagger: .12, ease: 'power2.out' }, .25)
    })
    return () => {
      context.revert()
      blend.current.value = 0
      scene.environmentRotation.copy(originalRotation.current)
      scene.environmentIntensity = originalIntensity.current
      if (rotationRef.current) rotationRef.current.rotation.y = 0
      invalidate()
    }
  }, [backdropRef, copyRef, invalidate, onActiveChange, reducedMotion, rotationRef, scene])

  useFrame((_, delta) => {
    const weight = blend.current.value
    if (weight > 0 && !reducedMotion && !document.hidden) elapsed.current += Math.min(delta, .05)
    const angle = reducedMotion ? 0 : elapsed.current * .14
    if (rotationRef.current) rotationRef.current.rotation.y = angle * weight
    // Rotate the existing studio reflection map: live highlights without six
    // extra cubemap renders every frame or changes to shared model materials.
    scene.environmentRotation.y = originalRotation.current.y + angle * .65 * weight
    scene.environmentIntensity = originalIntensity.current * (1 - weight * .2)
    if (gold.current && red.current) {
      gold.current.position.set(Math.cos(angle) * 4, 2.8, Math.sin(angle) * 4)
      red.current.position.set(Math.cos(angle + Math.PI) * 3.5, -.2, Math.sin(angle + Math.PI) * 3.5)
      gold.current.intensity = weight * 3.2
      red.current.intensity = weight * 2.8
    }
  })

  return <>
    <directionalLight ref={gold} position={[4, 2.8, 0]} color="#ffc477" intensity={0} />
    <directionalLight ref={red} position={[-3.5, -.2, 0]} color="#ff243c" intensity={0} />
  </>
}
