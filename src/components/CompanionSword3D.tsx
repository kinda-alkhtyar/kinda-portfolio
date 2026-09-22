import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Center, Clone, Resize, useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import { Mesh, MeshStandardMaterial } from 'three'
import type { Material } from 'three'
import swordUrl from '../assets/models/Royal_Flameblade_Review.glb?url'

function FloatingSword({ motion }: { motion: boolean }) {
  const { scene } = useGLTF(swordUrl)
  const group = useRef<Group>(null)
  const canvas = useThree((state) => state.gl.domElement)
  const pointer = useRef({ x: 0, y: 0, proximity: 0 })
  const proximity = useRef(0)
  const hovered = useRef(false)
  const hoverGlow = useMemo(() => ({ value: 0 }), [])
  const { model, materials } = useMemo(() => {
    const model = scene.clone(true)
    const materials = new Map<Material, Material>()
    const copyMaterial = (source: Material) => {
      const existing = materials.get(source)
      if (existing) return existing
      const material = source.clone()
      materials.set(source, material)
      if (material instanceof MeshStandardMaterial) {
        const core = /Ruby|Crystal|core/i.test(material.name)
        material.onBeforeCompile = (shader) => {
          shader.uniforms.companionHover = hoverGlow
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            '#include <common>\nuniform float companionHover;',
          ).replace('#include <opaque_fragment>', `
            float companionEdge = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 3.0);
            outgoingLight += companionHover * (
              vec3(1.0, 0.82, 0.61) * companionEdge * 0.045
              ${core ? '+ vec3(1.0, 0.08, 0.035) * 0.075' : ''}
            );
            #include <opaque_fragment>
          `)
        }
        material.customProgramCacheKey = () => `companion-hover-${core}`
      }
      return material
    }
    model.traverse((object) => {
      if (object instanceof Mesh) {
        object.material = Array.isArray(object.material)
          ? object.material.map(copyMaterial) : copyMaterial(object.material)
      }
    })
    return { model, materials }
  }, [scene, hoverGlow])

  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials])

  useEffect(() => {
    const hero = canvas.closest<HTMLElement>('#home')
    const reset = () => {
      pointer.current = { x: 0, y: 0, proximity: 0 }
      hovered.current = false
    }
    reset()
    if (!motion) hoverGlow.value = 0
    if (!motion || !hero) return

    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') { reset(); return }
      const bounds = canvas.getBoundingClientRect()
      hovered.current = event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom
      const radius = 220
      const x = (event.clientX - bounds.left - bounds.width / 2) / radius
      const y = (event.clientY - bounds.top - bounds.height / 2) / radius
      const falloff = Math.max(0, 1 - Math.hypot(x, y))
      pointer.current = {
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y)),
        proximity: falloff * falloff * (3 - 2 * falloff),
      }
    }
    hero.addEventListener('pointermove', move, { passive: true })
    hero.addEventListener('pointerleave', reset)
    hero.addEventListener('pointercancel', reset)
    window.addEventListener('blur', reset)
    window.addEventListener('scroll', reset, { passive: true })
    return () => {
      reset()
      hero.removeEventListener('pointermove', move)
      hero.removeEventListener('pointerleave', reset)
      hero.removeEventListener('pointercancel', reset)
      window.removeEventListener('blur', reset)
      window.removeEventListener('scroll', reset)
    }
  }, [canvas, motion, hoverGlow])

  useFrame(({ clock }, delta) => {
    if (!group.current || !motion) return
    const elapsed = clock.getElapsedTime()
    const smoothing = 1 - Math.exp(-3 * Math.min(delta, 0.05))
    hoverGlow.value += ((hovered.current ? 1 : 0) - hoverGlow.value)
      * (1 - Math.exp(-6 * Math.min(delta, 0.05)))
    proximity.current += (pointer.current.proximity - proximity.current) * smoothing
    const driftWeight = 1 - proximity.current * 0.3
    const targetX = Math.sin(elapsed * 0.42) * 0.1 * driftWeight
    const targetY = Math.sin(elapsed * 0.68) * 0.07 * driftWeight
    const targetTilt = Math.sin(elapsed * 0.51) * 0.045
      - pointer.current.y * pointer.current.proximity * 0.06
    const targetYaw = Math.sin(elapsed * 0.36) * 0.16
      + pointer.current.x * pointer.current.proximity * 0.12
      + hoverGlow.value * 0.035
    group.current.position.x += (targetX - group.current.position.x) * smoothing
    group.current.position.y += (targetY - group.current.position.y) * smoothing
    group.current.rotation.y += (targetYaw - group.current.rotation.y) * smoothing
    group.current.rotation.z += (targetTilt - group.current.rotation.z) * smoothing
  })

  return (
    <group ref={group} scale={1.15} rotation={[0.04, 0, -0.03]}>
      <Center>
        <Resize scale={2.4}>
          <Clone object={model} />
        </Resize>
      </Center>
    </group>
  )
}

export default function CompanionSword3D() {
  const [desktop, setDesktop] = useState(false)
  const [motion, setMotion] = useState(false)

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1025px)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: no-preference)')
    const update = () => {
      setDesktop(desktopQuery.matches)
      setMotion(desktopQuery.matches && motionQuery.matches)
    }
    update()
    desktopQuery.addEventListener('change', update)
    motionQuery.addEventListener('change', update)
    return () => {
      desktopQuery.removeEventListener('change', update)
      motionQuery.removeEventListener('change', update)
    }
  }, [])

  if (!desktop) return null

  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 34 }}
      dpr={[1, 1.5]}
      frameloop={motion ? 'always' : 'demand'}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.34} />
      <directionalLight position={[3, 4, 5]} color="#fff0d6" intensity={2.1} />
      <directionalLight position={[-3, 1, 2]} color="#ff493d" intensity={0.75} />
      <directionalLight position={[2, 2, -3]} color="#ffd09a" intensity={1.1} />
      <Suspense fallback={null}>
        <FloatingSword motion={motion} />
      </Suspense>
    </Canvas>
  )
}

useGLTF.preload(swordUrl)
