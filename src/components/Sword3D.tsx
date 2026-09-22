import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bounds, Center, Clone, Environment, Lightformer, Resize, useBounds, useGLTF } from '@react-three/drei'
import { ACESFilmicToneMapping, Box3, Mesh, MeshStandardMaterial, Quaternion, Scene, Vector3 } from 'three'
import type { Group, Material } from 'three'
import swordUrl from '../assets/models/Royal_Flameblade_Review.glb?url'
import { heroSwordMotion } from './heroSwordMotion'
import { heroSwordRuntime } from './heroSwordRuntime'
import { finalCompileStart, railTiming } from './heroSwordTiming'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export type Sword3DProps = {
  className?: string
  style?: CSSProperties
  fallback?: ReactNode
  idleRotation?: boolean
}

const transparentSurface: CSSProperties = {
  background: 'transparent',
  border: 0,
  outline: 0,
  boxShadow: 'none',
  filter: 'none',
  clipPath: 'none',
  overflow: 'visible',
}

class SwordRenderBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    console.error('Sword3D failed to render:', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

function IdleRotation({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const group = useRef<Group>(null)
  const active = useRef(false)
  const elapsed = useRef(0)
  const cursor = useRef({ x: 0, y: 0 })
  const tilt = useRef({ x: 0, y: 0 })
  const samplePath = useRef<(() => void) | null>(null)
  const surface = useRef<HTMLElement | null>(null)
  const invalidate = useThree((state) => state.invalidate)
  const setFrameloop = useThree((state) => state.setFrameloop)
  const canvas = useThree((state) => state.gl.domElement)

  useEffect(() => {
    const media = window.matchMedia(
      '(min-width: 681px) and (any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)',
    )
    const hero = canvas.closest<HTMLElement>('#home')
    const project = hero?.parentElement?.querySelector<HTMLElement>('[data-energy-project]')
    const stage = hero?.parentElement
    const checkpoints = [project,
      stage?.querySelector<HTMLElement>('article[aria-labelledby="project-02"]'),
      stage?.querySelector<HTMLElement>('article[aria-labelledby="project-03"]')]
    const finalPlaceholder = stage?.querySelector<HTMLElement>('[data-sword-final-placeholder]')
    const originalPlaceholderDisplay = finalPlaceholder?.style.display ?? ''
    const originalHeroZIndex = hero?.style.zIndex ?? ''
    const originalHeroPosition = hero?.style.position ?? ''
    const anchor = canvas.closest<HTMLElement>('[data-hero-sword-model]')
    surface.current = canvas.closest<HTMLElement>('[data-sword-render-surface]')
    const originalTranslate = surface.current?.style.translate ?? ''
    const originalPlayState = anchor?.style.animationPlayState ?? ''
    const boundaries = [0, 0.25, 0.5, 0.75, 1]
    const measureJourney = () => {
      if (!hero) return
      const start = hero.getBoundingClientRect().top + window.scrollY
      const end = ScrollTrigger.maxScroll(window)
      const distance = Math.max(1, end - start)
      checkpoints.forEach((element, index) => {
        if (!element) return
        const at = element.getBoundingClientRect().bottom + window.scrollY - window.innerHeight * 0.85
        boundaries[index + 1] = Math.max(boundaries[index] + 0.001, Math.min(0.997 + index * 0.001, (at - start) / distance))
      })
    }
    // Keep scroll checkpoints for project/energy effects, without moving the Hero model.
    samplePath.current = () => {
      const journey = heroSwordRuntime.state.scrollProgress
      const index = journey < boundaries[1] ? 0 : journey < boundaries[2] ? 1 : journey < boundaries[3] ? 2 : 3
      const progress = railTiming((journey - boundaries[index]) / (boundaries[index + 1] - boundaries[index]))
      const compile = index === 3 ? Math.max(0, (progress - finalCompileStart) / (1 - finalCompileStart)) : 0
      heroSwordRuntime.setFinalProgress(index === 3 ? progress : 0, compile)
    }
    let checkpoint: gsap.core.Tween | undefined
    const updateVisibility = () => {
      setFrameloop(active.current && !document.hidden ? 'always' : 'demand')
      if (!document.hidden) invalidate()
    }
    const resetCursor = () => {
      cursor.current = { x: 0, y: 0 }
      heroSwordRuntime.setMouse(0, 0)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!active.current || event.pointerType !== 'mouse' || !hero) return
      if (heroSwordRuntime.state.scrollProgress > 0) {
        resetCursor()
        return
      }
      const bounds = hero.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return
      cursor.current = {
        x: Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1)),
        y: Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1)),
      }
      heroSwordRuntime.setMouse(cursor.current.x, cursor.current.y)
    }
    const update = () => {
      checkpoint?.scrollTrigger?.kill()
      checkpoint?.kill()
      heroSwordRuntime.resetScroll()
      heroSwordRuntime.setFinalProgress(0, 0)
      if (surface.current) surface.current.style.translate = originalTranslate
      if (anchor) anchor.style.animationPlayState = originalPlayState
      // Touch-capable laptops still qualify when a mouse/trackpad is available.
      active.current = enabled && media.matches
      if (finalPlaceholder) finalPlaceholder.style.display = active.current ? 'none' : originalPlaceholderDisplay
      // Keep the same Canvas above later section backgrounds throughout the journey.
      if (hero) {
        hero.style.position = active.current ? 'relative' : originalHeroPosition
        hero.style.zIndex = active.current ? '3' : originalHeroZIndex
      }
      updateVisibility()
      elapsed.current = 0
      heroSwordRuntime.setIdle(active.current)
      resetCursor()
      tilt.current = { x: 0, y: 0 }
      if (group.current) {
        group.current.rotation.set(0, 0, 0)
        group.current.position.set(0, 0, 0)
        group.current.scale.setScalar(1)
      }
      if (active.current && hero && project) {
        measureJourney()
        const travel = { progress: 0 }
        checkpoint = gsap.to(travel, {
          progress: 1,
          ease: 'none',
          onUpdate: () => heroSwordRuntime.setScroll(travel.progress, true, boundaries[1], boundaries[2], boundaries[3]),
          scrollTrigger: {
            id: 'hero-sword-full-journey',
            trigger: hero,
            start: 'top top',
            end: () => ScrollTrigger.maxScroll(window),
            scrub: true,
            invalidateOnRefresh: true,
            onRefresh: () => { measureJourney(); samplePath.current?.() },
          },
        })
      }
      invalidate()
    }
    update()
    media.addEventListener('change', update)
    document.addEventListener('visibilitychange', updateVisibility)
    hero?.addEventListener('pointermove', onPointerMove, { passive: true })
    hero?.addEventListener('pointerleave', resetCursor)
    hero?.addEventListener('pointercancel', resetCursor)
    window.addEventListener('blur', resetCursor)
    return () => {
      checkpoint?.scrollTrigger?.kill()
      checkpoint?.kill()
      heroSwordRuntime.resetScroll()
      heroSwordRuntime.setFinalProgress(0, 0)
      if (finalPlaceholder) finalPlaceholder.style.display = originalPlaceholderDisplay
      if (hero) { hero.style.position = originalHeroPosition; hero.style.zIndex = originalHeroZIndex }
      if (surface.current) surface.current.style.translate = originalTranslate
      if (anchor) anchor.style.animationPlayState = originalPlayState
      samplePath.current = null
      surface.current = null
      active.current = false
      heroSwordRuntime.setIdle(false)
      heroSwordRuntime.setMouse(0, 0)
      setFrameloop('demand')
      media.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', updateVisibility)
      hero?.removeEventListener('pointermove', onPointerMove)
      hero?.removeEventListener('pointerleave', resetCursor)
      hero?.removeEventListener('pointercancel', resetCursor)
      window.removeEventListener('blur', resetCursor)
    }
  }, [enabled, invalidate, setFrameloop, canvas])

  useFrame((_, delta) => {
    if (!active.current || !group.current) return
    // A 12-second cycle, capped delta prevents jumps after a background tab resumes.
    const step = Math.min(delta, 0.05)
    elapsed.current += step
    heroSwordRuntime.setIdle(true, elapsed.current)
    const damping = 1 - Math.exp(-4 * step)
    const progress = heroSwordRuntime.state.scrollProgress
    // Pointer input belongs only to the neutral Hero pose, never the scroll journey.
    const pointerWeight = progress === 0 ? 1 : 0
    // Cursor tilt is limited to 2 degrees vertically and 3 degrees horizontally.
    tilt.current.x += (cursor.current.y * Math.PI / 90 * pointerWeight - tilt.current.x) * damping
    tilt.current.y += (cursor.current.x * Math.PI / 60 * pointerWeight - tilt.current.y) * damping
    samplePath.current?.()
    heroSwordRuntime.state.isScrollActive = progress > 0 && progress < 1 && ScrollTrigger.isScrolling()
    // Only idle and pointer rotation affect the sword; placement stays above the pedestal.
    group.current.rotation.x = tilt.current.x
    group.current.rotation.y = Math.sin(elapsed.current * Math.PI / 6) * Math.PI / 60 + tilt.current.y
    group.current.rotation.z = 0
    group.current.position.set(0, 0, 0)

  })

  return <group ref={group}>{children}</group>
}

function ModelPlacement({ bounds, children }: { bounds: Box3; children: ReactNode }) {
  const fit = useBounds()
  const size = useThree((state) => state.size)
  const group = useRef<Group>(null)
  const origin = useMemo(() => new Vector3(), [])
  const camera = useThree((state) => state.camera)
  const invalidate = useThree((state) => state.invalidate)
  const reveal = useRef({ elapsed: 0, enabled: false })
  const orbit = useMemo(() => ({
    position: new Vector3(),
    orientation: new Quaternion(),
    yaw: new Quaternion(),
    axis: new Vector3(0, 1, 0),
    captured: false,
    angle: 0,
  }), [])

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)')
    const update = () => {
      reveal.current.enabled = motion.matches
      if (!motion.matches) reveal.current.elapsed = 2.6
      invalidate()
    }
    update()
    motion.addEventListener('change', update)
    return () => motion.removeEventListener('change', update)
  }, [invalidate])

  useLayoutEffect(() => {
    if (orbit.captured) {
      camera.position.copy(orbit.position)
      camera.quaternion.copy(orbit.orientation)
      camera.updateMatrixWorld()
    }
    orbit.captured = false
    orbit.angle = 0
    // Fit the original normalized bounds, so fitting cannot undo the model-only scale.
    fit.refresh(bounds).fit().clip()
    return () => {
      if (orbit.captured) {
        camera.position.copy(orbit.position)
        camera.quaternion.copy(orbit.orientation)
        camera.updateMatrixWorld()
      }
      orbit.captured = false
    }
  }, [fit, bounds, size.width, size.height, camera, orbit])

  useFrame(({ camera, viewport, size }, delta) => {
    if (!orbit.captured) {
      orbit.position.copy(camera.position)
      orbit.orientation.copy(camera.quaternion)
      orbit.captured = true
    }
    // Reuse the motion-aware idle clock; no new loop, scroll input, or model movement.
    const idle = heroSwordRuntime.state.idle
    const target = idle.enabled ? Math.sin(idle.elapsed * Math.PI / 12) * Math.PI / 180 : 0
    orbit.angle = idle.enabled
      ? orbit.angle + (target - orbit.angle) * (1 - Math.exp(-2 * Math.min(delta, 0.05)))
      : 0
    // One entrance per mount, independent of scroll and resize. Smoothstep brings
    // the full model turn to rest while the nested idle/parallax motion continues.
    if (reveal.current.enabled && reveal.current.elapsed < 2.6 && !document.hidden) {
      reveal.current.elapsed = Math.min(2.6, reveal.current.elapsed + Math.min(delta, 0.05))
      invalidate()
    }
    const progress = reveal.current.enabled ? reveal.current.elapsed / 2.6 : 1
    const eased = progress * progress * (3 - 2 * progress)
    const revealAngle = -(25 * Math.PI / 180) * (1 - eased)
    const distance = 1 + 0.12 * (1 - eased)
    orbit.yaw.setFromAxisAngle(orbit.axis, revealAngle + orbit.angle * eased)
    camera.position.copy(orbit.position).multiplyScalar(distance).applyQuaternion(orbit.yaw)
    camera.quaternion.copy(orbit.orientation).premultiply(orbit.yaw)
    camera.updateMatrixWorld()
    if (group.current && size.height > 0) {
      // A complete turn is visually identical to zero; clear it after settling.
      group.current.rotation.y = progress < 1 ? Math.PI * 2 * eased : 0
      const worldHeight = viewport.getCurrentViewport(camera, origin).height
      group.current.position.y = -22 * worldHeight / size.height
    }
  })
return <group ref={group} scale={1.32177528}>{children}</group>
}

function SwordModel({ idleRotation }: { idleRotation: boolean }) {
  const { scene } = useGLTF(swordUrl)
  const goldReflectionScene = useMemo(() => new Scene(), [])
  const heroLight = useMemo(() => ({
    presence: { value: 0 },
    sweep: { value: 0 },
    sweepPosition: { value: -4 },
  }), [])
  const { model, materials } = useMemo(() => {
    // Preserve authored textures and physical properties on private material copies.
    const model = scene.clone(true)
    const materials = new Map<Material, Material>()
    const tuneMaterial = (source: Material) => {
      const existing = materials.get(source)
      if (existing) return existing
      const material = source.clone()
      materials.set(source, material)

      if (material instanceof MeshStandardMaterial) {
        // View-space normals keep the restrained edge sheen responsive to camera angle.
        material.onBeforeCompile = (shader) => {
          shader.uniforms.heroPresence = heroLight.presence
          shader.uniforms.heroSweep = heroLight.sweep
          shader.uniforms.heroSweepPosition = heroLight.sweepPosition
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            '#include <common>\nuniform float heroPresence;\nuniform float heroSweep;\nuniform float heroSweepPosition;',
          ).replace('#include <opaque_fragment>', `
            float heroEdge = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 3.0);
            float heroBandDistance = (vViewPosition.x + vViewPosition.y * 0.25 - heroSweepPosition) / 0.38;
            float heroBand = exp(-heroBandDistance * heroBandDistance);
            outgoingLight += vec3(1.0, 0.84, 0.62) * heroPresence
              * (heroEdge * 0.055 + heroBand * heroSweep * 0.07);
            #include <opaque_fragment>
          `)
        }
        material.customProgramCacheKey = () => 'hero-sword-sheen-v1'
      }

      if (material instanceof MeshStandardMaterial && material.name.startsWith('Gold')) {
        // Lift studio reflections only; retain the GLB's color, metalness, roughness,
        // normal maps and clearcoat so the guard keeps its authored gold finish.
        material.envMapIntensity *= 1.35
      }

      if (material instanceof MeshStandardMaterial && material.name.startsWith('Ruby')
        && material.emissive.getHex() === 0) {
        // A faint red fill keeps the transmissive ruby readable on the dark Hero.
        material.emissive.copy(material.color)
        material.emissiveIntensity = 0.45
      }
      return material
    }

    model.traverse((object) => {
      if (object instanceof Mesh) {
        object.material = Array.isArray(object.material)
          ? object.material.map(tuneMaterial)
          : tuneMaterial(object.material)
      }
    })
    return { model, materials }
  }, [scene, heroLight])

  const framingBounds = useMemo(() => {
    const size = new Box3().setFromObject(model).getSize(new Vector3())
    size.multiplyScalar(3 / Math.max(size.x, size.y, size.z))
    return new Box3().setFromCenterAndSize(new Vector3(), size)
  }, [model])

  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials])

  useFrame(() => {
    // Reuse the existing idle clock: no extra render loop or motion for reduced motion.
    const runtime = heroSwordRuntime.state
    const heroWeight = idleRotation ? Math.max(0, 1 - runtime.scrollProgress * 40) : 0
    heroLight.presence.value = heroWeight
    const sweepPhase = runtime.idle.elapsed % 7
    const sweepProgress = Math.min(1, sweepPhase / 2.4)
    heroLight.sweep.value = runtime.idle.enabled && sweepPhase < 2.4
      ? Math.sin(sweepProgress * Math.PI) ** 2 : 0
    heroLight.sweepPosition.value = -4 + sweepProgress * 8
    const compile = heroSwordRuntime.state.finalCompileProgress
    const compileGlow = compile < 0.7 ? Math.sin(Math.PI * compile / 0.7) ** 2 : 0
    const projects = heroSwordRuntime.state.projects
    const glow = Math.max(compileGlow, projects['01'].glow, projects['02'].glow, projects['03'].glow)
    materials.forEach((material, source) => {
      if (!(material instanceof MeshStandardMaterial)) return
      if (!(source instanceof MeshStandardMaterial)) return
      if (material.name.startsWith('Gold')) {
        material.envMapIntensity = source.envMapIntensity * (1.35 + heroWeight * 0.15)
      }
      if (material.name.startsWith('Gold') && goldReflectionScene.environment
        && material.envMap !== goldReflectionScene.environment) {
        material.envMap = goldReflectionScene.environment
        material.needsUpdate = true
      }
      if (material.name.startsWith('Ruby')) {
        const base = source.emissive.getHex() === 0 ? 0.45 : source.emissiveIntensity
        material.emissiveIntensity = base * (1 + heroSwordMotion.glow * 0.75 + glow * 0.8)
      }
      if (material.name.startsWith('Crystal') || material.name.startsWith('Blade edge')) {
        material.emissiveIntensity = source.emissiveIntensity * (1 + heroSwordMotion.glow * 0.35 + glow * 0.4)
      }
    })
  })

  return (
    <>
    {/* Gold-only reflections preserve the core and ruby lighting exactly. */}
    <Environment scene={goldReflectionScene} frames={1} resolution={256} background={false}>
      <color attach="background" args={['#303039']} />
      <Lightformer position={[0, 1, 5]} target={[0, 0, 0]} scale={[5, 7]} color="#fff2d8" intensity={1.4} />
      <Lightformer position={[-4, 2, 2]} target={[0, 0, 0]} scale={[2, 5]} color="#dce6ff" intensity={1} />
      <Lightformer position={[4, 3, -2]} target={[0, 0, 0]} scale={[2, 4]} color="#ffd59b" intensity={1.6} />
    </Environment>
    <Bounds margin={1.2} maxDuration={0}>
      <ModelPlacement bounds={framingBounds}>
        <IdleRotation enabled={idleRotation}>
          <Center>
            <Resize scale={3}>
              <Clone object={model} />
            </Resize>
          </Center>
        </IdleRotation>
      </ModelPlacement>
    </Bounds>
    </>
  )
}

/** Standalone sword viewer with optional desktop idle rotation. */
export default function Sword3D({ className, style, fallback = null, idleRotation = false }: Sword3DProps) {
  const [contextLost, setContextLost] = useState(false)

  return (
    <div
      className={className}
      data-sword-render-surface
      style={{ width: '100%', height: 480, ...style, ...transparentSurface }}
      role="img"
      aria-label="Royal Flameblade sword in 3D"
    >
      <SwordRenderBoundary fallback={fallback}>
        {contextLost ? fallback : (
          <Canvas
            camera={{ position: [0, 0, 6], fov: 40 }}
            gl={{ alpha: true, antialias: true }}
            onCreated={({ gl, scene }) => {
              scene.background = null
              gl.setClearColor(0x000000, 0)
              gl.toneMapping = ACESFilmicToneMapping
              gl.toneMappingExposure = 0.9
              Object.assign(gl.domElement.style, transparentSurface)
              gl.domElement.addEventListener('webglcontextlost', () => setContextLost(true), { once: true })
            }}
            fallback={fallback}
            dpr={[1, 2]}
            frameloop="demand"
            style={transparentSurface}
          >
            <ambientLight intensity={0.12} />
            <hemisphereLight args={['#dce9ff', '#241014', 0.3]} />
            <directionalLight position={[4, 5, 5]} color="#fff1dc" intensity={1.6} />
            <directionalLight position={[-4, 1, 3]} color="#a7c8ff" intensity={0.45} />
            <directionalLight position={[2, 3, -4]} color="#ffb76b" intensity={1.2} />
            <directionalLight position={[-3, -1, 2]} color="#ff2535" intensity={0.35} />
            <Environment frames={1} resolution={256} background={false}>
              <Lightformer position={[3, 2, 4]} target={[0, 0, 0]} scale={[2, 5]} color="#fff0d6" intensity={2} />
              <Lightformer position={[-4, 1, 2]} target={[0, 0, 0]} scale={[1, 4]} color="#c3d6ff" intensity={0.8} />
              <Lightformer position={[1, 3, -3]} target={[0, 0, 0]} scale={[2, 3]} color="#ffcf86" intensity={1.4} />
              <Lightformer position={[-2, -1, 3]} target={[0, 0, 0]} scale={[0.5, 4]} color="#ff2030" intensity={0.65} />
            </Environment>
            <Suspense fallback={null}>
              <SwordModel idleRotation={idleRotation} />
            </Suspense>
          </Canvas>
        )}
      </SwordRenderBoundary>
    </div>
  )
}
