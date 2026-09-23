import { useLayoutEffect } from 'react'
import type { RefObject } from 'react'
import { useThree } from '@react-three/fiber'
import type { Group } from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ThreeDFinalScene({ copyRef, swordRef, reducedMotion }: {
  copyRef: RefObject<HTMLElement | null>
  swordRef: RefObject<Group | null>
  reducedMotion: boolean
}) {
  const { camera, invalidate } = useThree()

  useLayoutEffect(() => {
    const copy = copyRef.current
    const sword = swordRef.current
    if (!copy || !sword || reducedMotion) return

    const depth = { value: 0 }
    let appliedDepth = 0
    const updateDepth = () => {
      const change = depth.value - appliedDepth
      camera.position.addScaledVector(camera.position.clone().normalize(), change)
      appliedDepth = depth.value
      invalidate()
    }

    const context = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: { trigger: copy, start: 'top 85%', end: 'top 30%', scrub: 1.2 },
      })
        .to(sword.position, { x: 0.18, y: -0.08, z: -0.12, duration: 1, ease: 'sine.inOut', onUpdate: invalidate }, 0)
        .to(sword.rotation, { x: 0, y: 0.36, z: -0.035, duration: 1, ease: 'sine.inOut', onUpdate: invalidate }, 0)
        .to(depth, { value: 0.4, duration: 1, ease: 'none', onUpdate: updateDepth }, 0)
        .fromTo(copy.children, { autoAlpha: 0, y: 28 }, {
          autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.1, ease: 'power2.out',
        }, 0.26)
    }, copy)

    return () => {
      context.revert()
      camera.position.addScaledVector(camera.position.clone().normalize(), -appliedDepth)
      invalidate()
    }
  }, [camera, copyRef, invalidate, reducedMotion, swordRef])

  return null
}
