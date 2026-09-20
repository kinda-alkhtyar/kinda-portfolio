import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bounds, Center, Clone, Environment, Lightformer, Resize, useGLTF } from '@react-three/drei'
import { ACESFilmicToneMapping, Mesh, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'
import type { Group, Material } from 'three'
import swordUrl from '../assets/models/Royal_Flameblade_Review.glb?url'
import { heroSwordMotion } from './heroSwordMotion'

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
    const resetCursor = () => {
      cursor.current = { x: 0, y: 0 }
    }
    const onPointerMove = (event: PointerEvent) => {
      if (!active.current || event.pointerType !== 'mouse' || !hero) return
      const bounds = hero.getBoundingClientRect()
      if (!bounds.width || !bounds.height) return
      cursor.current = {
        x: Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1)),
        y: Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1)),
      }
    }
    const update = () => {
      // Touch-capable laptops still qualify when a mouse/trackpad is available.
      active.current = enabled && media.matches
      setFrameloop(active.current ? 'always' : 'demand')
      elapsed.current = 0
      resetCursor()
      tilt.current = { x: 0, y: 0 }
      if (group.current) {
        group.current.rotation.set(0, 0, 0)
        group.current.position.set(0, 0, 0)
        group.current.scale.setScalar(1)
      }
      invalidate()
    }
    update()
    media.addEventListener('change', update)
    hero?.addEventListener('pointermove', onPointerMove, { passive: true })
    hero?.addEventListener('pointerleave', resetCursor)
    window.addEventListener('blur', resetCursor)
    return () => {
      active.current = false
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
    const damping = 1 - Math.exp(-4 * step)
    // Cursor tilt is limited to 2 degrees vertically and 3 degrees horizontally.
    tilt.current.x += (cursor.current.y * Math.PI / 90 - tilt.current.x) * damping
    tilt.current.y += (cursor.current.x * Math.PI / 60 - tilt.current.y) * damping
    group.current.rotation.x = tilt.current.x + heroSwordMotion.tilt
    group.current.rotation.y = Math.sin(elapsed.current * Math.PI / 6) * Math.PI / 60 + tilt.current.y
    group.current.position.y = heroSwordMotion.lift
    group.current.position.z = heroSwordMotion.recede * -0.2
    group.current.scale.setScalar(1 - heroSwordMotion.recede * 0.04)
  })

  return <group ref={group}>{children}</group>
}

function SwordModel({ idleRotation }: { idleRotation: boolean }) {
  const { scene } = useGLTF(swordUrl)
  const { model, materials } = useMemo(() => {
    // Tune private material copies so the cached GLTF stays reusable.
    const model = scene.clone(true)
    const materials = new Map<Material, Material>()
    const tuneMaterial = (source: Material) => {
      const existing = materials.get(source)
      if (existing) return existing
      const material = source.clone()
      materials.set(source, material)

      if (material instanceof MeshStandardMaterial) {
        if (material.name.startsWith('Crystal')) {
          material.color.set('#aeb7c4')
          material.metalness = 0.88
          material.roughness = 0.3
          material.emissive.set('#470509')
          material.emissiveIntensity = 0.08
          if (material instanceof MeshPhysicalMaterial) {
            material.transmission = 0
            material.clearcoat = 0.25
            material.clearcoatRoughness = 0.3
          }
        } else if (material.name.startsWith('Gold')) {
          const isEdge = material.name.includes('bright')
          material.color.set(isEdge ? '#efbd65' : '#c99036')
          material.metalness = 0.96
          material.roughness = isEdge ? 0.24 : 0.3
        } else if (material.name.startsWith('Ruby')) {
          material.emissiveIntensity = 1.6
          material.roughness = 0.2
        } else if (material.name.startsWith('Blade edge')) {
          material.emissive.set('#ff3720')
          material.emissiveIntensity = 0.65
          material.metalness = 0.65
          material.roughness = 0.28
        }
      }
      return material
    }

    model.traverse((object) => {
      if (object instanceof Mesh) {
        // Hide the exported default cube, retaining its bounds to avoid a camera refit.
        if (object.name === 'Cube') {
          object.visible = false
        }
        object.material = Array.isArray(object.material)
          ? object.material.map(tuneMaterial)
          : tuneMaterial(object.material)
      }
    })
    return { model, materials }
  }, [scene])

  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials])

  useFrame(() => {
    materials.forEach((material) => {
      if (!(material instanceof MeshStandardMaterial)) return
      if (material.name.startsWith('Ruby')) material.emissiveIntensity = 1.6 + heroSwordMotion.glow * 1.2
      if (material.name.startsWith('Blade edge')) material.emissiveIntensity = 0.65 + heroSwordMotion.glow * 0.5
    })
  })

  return (
    <Bounds fit clip observe margin={1.2} maxDuration={0}>
      <IdleRotation enabled={idleRotation}>
        <Center>
          <Resize scale={3}>
            <Clone object={model} />
          </Resize>
        </Center>
      </IdleRotation>
    </Bounds>
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
