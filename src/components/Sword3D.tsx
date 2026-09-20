import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bounds, Center, Clone, Environment, Lightformer, Resize, useBounds, useGLTF } from '@react-three/drei'
import { ACESFilmicToneMapping, Box3, Mesh, MeshStandardMaterial, Scene, Vector3 } from 'three'
import type { Group, Material } from 'three'
import swordUrl from '../assets/models/Royal_Flameblade_Review.glb?url'
import { heroSwordMotion } from './heroSwordMotion'
import { heroSwordRuntime } from './heroSwordRuntime'
import { finalCompileStart, railTiming } from './heroSwordTiming'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

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
  const pathPose = useRef({ x: 0, y: 0, bank: 0, pitch: 0, depth: 0, flightTilt: 0 })
  const samplePath = useRef<(() => void) | null>(null)
  const surface = useRef<HTMLElement | null>(null)
  const invalidate = useThree((state) => state.invalidate)
  const setFrameloop = useThree((state) => state.setFrameloop)
  const canvas = useThree((state) => state.gl.domElement)
  const getThree = useThree((state) => state.get)
  const finalSettle = useRef(0)

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
    const finalPedestal = stage?.querySelector<HTMLElement>('[data-sword-final-pedestal]')
    const finalPlaceholder = stage?.querySelector<HTMLElement>('[data-sword-final-placeholder]')
    const originalPlaceholderDisplay = finalPlaceholder?.style.display ?? ''
    const originalHeroZIndex = hero?.style.zIndex ?? ''
    const originalHeroPosition = hero?.style.position ?? ''
    const anchor = canvas.closest<HTMLElement>('[data-hero-sword-model]')
    surface.current = canvas.closest<HTMLElement>('[data-sword-render-surface]')
    const originalTranslate = surface.current?.style.translate ?? ''
    const originalPlayState = anchor?.style.animationPlayState ?? ''
    const boundaries = [0, 0.25, 0.5, 0.75, 1]
    const paths = new Map<SVGPathElement, { data: string; raw: ReturnType<typeof MotionPathPlugin.getRawPath> }>()
    const getPath = (path: SVGPathElement) => {
      const data = path.getAttribute('d')
      if (!data) return undefined
      let cached = paths.get(path)
      if (cached?.data !== data) {
        const raw = MotionPathPlugin.getRawPath(data)
        MotionPathPlugin.cacheRawPathMeasurements(raw, 32)
        cached = { data, raw }
        paths.set(path, cached)
      }
      return cached?.raw
    }
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
    samplePath.current = () => {
      const journey = heroSwordRuntime.state.scrollProgress
      const index = journey < boundaries[1] ? 0 : journey < boundaries[2] ? 1 : journey < boundaries[3] ? 2 : 3
      const progress = railTiming((journey - boundaries[index]) / (boundaries[index + 1] - boundaries[index]))
      const selectors = ['[data-hero-project01-path]', '[data-sword-rail="project02"]', '[data-sword-rail="project03"]', '[data-sword-rail="cta"]']
      const firstPath = stage?.querySelector<SVGPathElement>(selectors[0])
      const path = stage?.querySelector<SVGPathElement>(selectors[index])
      const matrix = path?.getScreenCTM()
      const firstMatrix = firstPath?.getScreenCTM()
      if (!path || !firstPath || !matrix || !firstMatrix) return
      const rawPath = getPath(path)
      const firstRaw = getPath(firstPath)
      if (!rawPath || !firstRaw) return
      // Scroll owns the complete flight pose: reversing retraces it exactly.
      const railProgress = progress * progress * (3 - 2 * progress)
      const envelope = Math.sin(Math.PI * progress) ** 2
      const start = MotionPathPlugin.getPositionOnPath(firstRaw, 0, true) as { x: number; y: number; angle: number }
      const point = MotionPathPlugin.getPositionOnPath(rawPath, railProgress, true) as { x: number; y: number; angle: number }
      const before = MotionPathPlugin.getPositionOnPath(rawPath, Math.max(0, railProgress - 0.045), true) as { angle: number }
      const ahead = MotionPathPlugin.getPositionOnPath(rawPath, Math.min(1, railProgress + 0.045), true) as { angle: number }
      const turnAngle = (ahead.angle - before.angle) * Math.PI / 180
      const curvature = Math.atan2(Math.sin(turnAngle), Math.cos(turnAngle))
      // A symmetric look-ahead/behind window anticipates turns in either scroll direction.
      const bank = Math.tanh(curvature * 1.7) * 0.3 * envelope
      const heading = point.angle * Math.PI / 180
      const tangentX = matrix.a * Math.cos(heading) + matrix.c * Math.sin(heading)
      const tangentY = matrix.b * Math.cos(heading) + matrix.d * Math.sin(heading)
      const tangentLength = Math.hypot(tangentX, tangentY) || 1
      const tx = tangentX / tangentLength
      const ty = tangentY / tangentLength
      const lateral = (18 * Math.sin(progress * Math.PI * 3) - bank * 22) * envelope
      // A small tangent overshoot crests near arrival and settles exactly at progress 1.
      const arrival = Math.max(0, (progress - 0.82) / 0.18)
      const overshoot = Math.sin(Math.PI * arrival) ** 2 * 14
      const dx = matrix.a * point.x + matrix.c * point.y + matrix.e - (firstMatrix.a * start.x + firstMatrix.c * start.y + firstMatrix.e)
      const dy = matrix.b * point.x + matrix.d * point.y + matrix.f - (firstMatrix.b * start.x + firstMatrix.d * start.y + firstMatrix.f)
      // Keep the existing curve as a guide, adding only a restrained flight offset.
      pathPose.current = {
        x: dx - ty * lateral + tx * overshoot,
        y: dy + tx * lateral + ty * overshoot,
        bank,
        // Peak at 40 degrees mid-segment; settle upright at both checkpoints.
        // Segment-based direction retraces identically when scrolling backward.
        flightTilt: (index % 2 === 0 ? -1 : 1) * (40 * Math.PI / 180) * envelope,
        pitch: Math.sin(progress * Math.PI * 2) * envelope * 0.09 - bank * 0.25,
        depth: Math.sin(progress * Math.PI * 2) * envelope * 0.12,
      }
      finalSettle.current = index === 3 ? railProgress : 0
      const compile = index === 3 ? Math.max(0, (progress - finalCompileStart) / (1 - finalCompileStart)) : 0
      heroSwordRuntime.setFinalProgress(index === 3 ? progress : 0, compile)
      const upright = compile * compile * (3 - 2 * compile)
      pathPose.current.bank *= 1 - upright
      pathPose.current.pitch *= 1 - upright
      pathPose.current.flightTilt *= 1 - upright
      if (index === 3 && finalPedestal && anchor && group.current?.parent) {
        const { camera, viewport, size } = getThree()
        const parent = group.current.parent
        const center = parent.getWorldPosition(new Vector3()).project(camera)
        const base = anchor.getBoundingClientRect()
        const pedestal = finalPedestal.getBoundingClientRect()
        const worldHeight = viewport.getCurrentViewport(camera, new Vector3()).height
        const halfHeight = 3 * parent.scale.y * size.height / worldHeight / 2
        const dockX = pedestal.left + pedestal.width / 2 - (base.left + (center.x + 1) * base.width / 2)
        const dockY = pedestal.top + pedestal.height * 0.23 - 12 - halfHeight - (base.top + (1 - center.y) * base.height / 2)
        const endPoint = MotionPathPlugin.getPositionOnPath(rawPath, 1) as { x: number; y: number }
        const endX = matrix.a * endPoint.x + matrix.c * endPoint.y + matrix.e - (firstMatrix.a * start.x + firstMatrix.c * start.y + firstMatrix.e)
        const endY = matrix.b * endPoint.x + matrix.d * endPoint.y + matrix.f - (firstMatrix.b * start.x + firstMatrix.d * start.y + firstMatrix.f)
        pathPose.current.x += (dockX - endX) * railProgress
        pathPose.current.y += (dockY - endY) * railProgress
      }
      if (anchor) anchor.style.animationPlayState = journey > 0 ? 'paused' : originalPlayState
    }
    let checkpoint: gsap.core.Tween | undefined
    const resetCursor = () => {
      cursor.current = { x: 0, y: 0 }
      heroSwordRuntime.setMouse(0, 0)
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!active.current || event.pointerType !== 'mouse' || !hero) return
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
      setFrameloop(active.current ? 'always' : 'demand')
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
    hero?.addEventListener('pointermove', onPointerMove, { passive: true })
    hero?.addEventListener('pointerleave', resetCursor)
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
      hero?.removeEventListener('pointermove', onPointerMove)
      hero?.removeEventListener('pointerleave', resetCursor)
      window.removeEventListener('blur', resetCursor)
    }
  }, [enabled, invalidate, setFrameloop, canvas, getThree])

  useFrame((_, delta) => {
    if (!active.current || !group.current) return
    // A 12-second cycle, capped delta prevents jumps after a background tab resumes.
    const step = Math.min(delta, 0.05)
    elapsed.current += step
    heroSwordRuntime.setIdle(true, elapsed.current)
    const damping = 1 - Math.exp(-4 * step)
    // Cursor tilt is limited to 2 degrees vertically and 3 degrees horizontally.
    tilt.current.x += (cursor.current.y * Math.PI / 90 - tilt.current.x) * damping
    tilt.current.y += (cursor.current.x * Math.PI / 60 - tilt.current.y) * damping
    const progress = heroSwordRuntime.state.scrollProgress
    samplePath.current?.()
    heroSwordRuntime.state.isScrollActive = progress > 0 && progress < 1 && ScrollTrigger.isScrolling()
    const idleWeight = (1 - Math.min(1, progress * 12) * 0.85) * (1 - finalSettle.current)
    group.current.rotation.x = tilt.current.x * idleWeight + pathPose.current.pitch
    group.current.rotation.y = (Math.sin(elapsed.current * Math.PI / 6) * Math.PI / 60 + tilt.current.y) * idleWeight + pathPose.current.bank * 0.4
    group.current.rotation.z = pathPose.current.flightTilt
    group.current.position.z = pathPose.current.depth
    // Move the render surface with the sword so its travel is not clipped by the Canvas.
    // The model's base placement and scale remain owned by ModelPlacement.
    if (surface.current) {
      surface.current.style.translate = `${pathPose.current.x}px ${pathPose.current.y}px`
    }
  })

  return <group ref={group}>{children}</group>
}

function ModelPlacement({ bounds, children }: { bounds: Box3; children: ReactNode }) {
  const fit = useBounds()
  const size = useThree((state) => state.size)
  const group = useRef<Group>(null)
  const origin = useMemo(() => new Vector3(), [])

  useLayoutEffect(() => {
    // Fit the original normalized bounds, so fitting cannot undo the model-only scale.
    fit.refresh(bounds).fit().clip()
  }, [fit, bounds, size.width, size.height])

  useFrame(({ camera, viewport, size }) => {
    if (group.current && size.height > 0) {
      const worldHeight = viewport.getCurrentViewport(camera, origin).height
      group.current.position.y = -22 * worldHeight / size.height
    }
  })
return <group ref={group} scale={1.806}>{children}</group>
}

function SwordModel({ idleRotation }: { idleRotation: boolean }) {
  const { scene } = useGLTF(swordUrl)
  const goldReflectionScene = useMemo(() => new Scene(), [])
  const { model, materials } = useMemo(() => {
    // Preserve authored textures and physical properties on private material copies.
    const model = scene.clone(true)
    const materials = new Map<Material, Material>()
    const tuneMaterial = (source: Material) => {
      const existing = materials.get(source)
      if (existing) return existing
      const material = source.clone()
      materials.set(source, material)

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
  }, [scene])

  const framingBounds = useMemo(() => {
    const size = new Box3().setFromObject(model).getSize(new Vector3())
    size.multiplyScalar(3 / Math.max(size.x, size.y, size.z))
    return new Box3().setFromCenterAndSize(new Vector3(), size)
  }, [model])

  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials])

  useFrame(() => {
    const compile = heroSwordRuntime.state.finalCompileProgress
    const compileGlow = compile < 0.7 ? Math.sin(Math.PI * compile / 0.7) ** 2 : 0
    materials.forEach((material, source) => {
      if (!(material instanceof MeshStandardMaterial)) return
      if (!(source instanceof MeshStandardMaterial)) return
      if (material.name.startsWith('Gold') && goldReflectionScene.environment
        && material.envMap !== goldReflectionScene.environment) {
        material.envMap = goldReflectionScene.environment
        material.needsUpdate = true
      }
      if (material.name.startsWith('Ruby')) {
        const base = source.emissive.getHex() === 0 ? 0.45 : source.emissiveIntensity
        const glow = Math.max(compileGlow, ...Object.values(heroSwordRuntime.state.projects).map((project) => project.glow))
        material.emissiveIntensity = base * (1 + heroSwordMotion.glow * 0.75 + glow * 0.8)
      }
      if (material.name.startsWith('Crystal') || material.name.startsWith('Blade edge')) {
        const glow = Math.max(compileGlow, ...Object.values(heroSwordRuntime.state.projects).map((project) => project.glow))
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
