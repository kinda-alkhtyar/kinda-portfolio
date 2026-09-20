import { Component, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bounds, Center, Clone, Environment, Lightformer, Resize, useBounds, useGLTF } from '@react-three/drei'
import { ACESFilmicToneMapping, Box3, Mesh, MeshStandardMaterial, Scene, Vector3 } from 'three'
import type { Group, Material } from 'three'
import swordUrl from '../assets/models/Royal_Flameblade_Review.glb?url'
import { heroSwordMotion } from './heroSwordMotion'
import { heroSwordRuntime } from './heroSwordRuntime'
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
  const invalidate = useThree((state) => state.invalidate)
  const setFrameloop = useThree((state) => state.setFrameloop)
  const canvas = useThree((state) => state.gl.domElement)

  useEffect(() => {
    const media = window.matchMedia(
      '(min-width: 681px) and (any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)',
    )
    const hero = canvas.closest<HTMLElement>('#home')
    const project = hero?.parentElement?.querySelector<HTMLElement>('[data-energy-project]')
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
      // Touch-capable laptops still qualify when a mouse/trackpad is available.
      active.current = enabled && media.matches
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
        const travel = { progress: 0 }
        checkpoint = gsap.to(travel, {
          progress: 1,
          ease: 'none',
          onUpdate: () => heroSwordRuntime.setScroll(travel.progress, true),
          scrollTrigger: {
            id: 'hero-sword-project-01-checkpoint',
            trigger: hero,
            start: 'top top',
            endTrigger: project,
            end: 'top 85%',
            scrub: 1.2,
            invalidateOnRefresh: true,
            onScrubComplete: () => heroSwordRuntime.setScroll(travel.progress, false),
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
      active.current = false
      heroSwordRuntime.setIdle(false)
      heroSwordRuntime.setMouse(0, 0)
      setFrameloop('demand')
      media.removeEventListener('change', update)
      hero?.removeEventListener('pointermove', onPointerMove)
      hero?.removeEventListener('pointerleave', resetCursor)
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
    // Cursor tilt is limited to 2 degrees vertically and 3 degrees horizontally.
    tilt.current.x += (cursor.current.y * Math.PI / 90 - tilt.current.x) * damping
    tilt.current.y += (cursor.current.x * Math.PI / 60 - tilt.current.y) * damping
    const progress = heroSwordRuntime.state.scrollProgress
    group.current.rotation.x = tilt.current.x - progress * 0.06
    group.current.rotation.y = Math.sin(elapsed.current * Math.PI / 6) * Math.PI / 60 + tilt.current.y + progress * 0.07
    group.current.rotation.z = progress * -0.025
    group.current.position.x = progress * 0.12
    group.current.position.y = progress * -0.3
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
        material.emissiveIntensity = base * (1 + heroSwordMotion.glow * 0.75)
      }
      if (material.name.startsWith('Crystal') || material.name.startsWith('Blade edge')) {
        material.emissiveIntensity = source.emissiveIntensity * (1 + heroSwordMotion.glow * 0.35)
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
