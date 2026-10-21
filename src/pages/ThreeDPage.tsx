import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Center, ContactShadows, Environment, Html, Lightformer, OrbitControls, useGLTF } from '@react-three/drei'
import { ACESFilmicToneMapping, Box3, Vector3 } from 'three'
import type { DirectionalLight, Group } from 'three'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '../components/Navbar'
import swordUrl from '../assets/models/Royal_Flameblade_Review.glb?url'
import styles from './ThreeDPage.module.css'
import ThreeDStudioScene from './ThreeDStudioScene'
import ThreeDFinalScene from './ThreeDFinalScene'
import { useI18n } from '../i18n/locale'
import type { MessageKey } from '../i18n/messages'

gsap.registerPlugin(ScrollTrigger)

const hotspotDetails = {
  modeling: { label: 'threeModeling', text: 'threeModelingText', position: [-0.48, 1.02, 0.34] as [number, number, number], camera: [-0.75, 1.12, 4.2] as [number, number, number] },
  materials: { label: 'threeMaterials', text: 'threeMaterialsText', position: [0.55, 0.05, 0.38] as [number, number, number], camera: [0.7, 0.25, 4.1] as [number, number, number] },
  lighting: { label: 'threeLighting', text: 'threeLightingText', position: [-0.42, -1.06, 0.35] as [number, number, number], camera: [-0.7, -0.9, 4.25] as [number, number, number] },
}
type HotspotKey = keyof typeof hotspotDetails

function ViewerModel({ reducedMotion, motionRef, studioRotationRef, detailActive, selectedHotspot, onSelect }: {
  reducedMotion: boolean
  motionRef: RefObject<Group | null>
  studioRotationRef: RefObject<Group | null>
  detailActive: boolean
  selectedHotspot: HotspotKey | null
  onSelect: (hotspot: HotspotKey) => void
}) {
  const { t } = useI18n()
  const { scene } = useGLTF(swordUrl)
  const floatGroup = useRef<Group>(null)
  const { model, scale } = useMemo(() => {
    const model = scene.clone(true)
    const size = new Box3().setFromObject(model).getSize(new Vector3())
    model.traverse((object) => {
      if (object.type === 'Mesh') { object.castShadow = true; object.receiveShadow = true }
    })
    return { model, scale: 3.6 / Math.max(size.x, size.y, size.z) }
  }, [scene])
  useFrame(({ clock }) => {
    if (floatGroup.current) floatGroup.current.position.y = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 0.8) * 0.045
  })
  return <group ref={motionRef}>
    <group ref={studioRotationRef}><group ref={floatGroup} scale={scale}><Center><primitive object={model} /></Center></group></group>
    {detailActive && (Object.entries(hotspotDetails) as [HotspotKey, typeof hotspotDetails[HotspotKey]][]).map(([key, hotspot]) =>
      <Html key={key} position={hotspot.position} center distanceFactor={7}>
        <button type="button" className={`${styles.hotspot}${selectedHotspot === key ? ` ${styles.hotspotSelected}` : ''}`} aria-label={t('threeExplore', { detail: t(hotspot.label as MessageKey) })} aria-pressed={selectedHotspot === key} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onSelect(key) }}>
          <span aria-hidden="true" />{t(hotspot.label as MessageKey)}
        </button>
      </Html>) }
  </group>
}

function ScrollScene({ mainRef, copyRef, motionRef, keyRef, rimRef, reducedMotion }: {
  mainRef: RefObject<HTMLElement | null>
  copyRef: RefObject<HTMLDivElement | null>
  motionRef: RefObject<Group | null>
  keyRef: RefObject<DirectionalLight | null>
  rimRef: RefObject<DirectionalLight | null>
  reducedMotion: boolean
}) {
  const { camera, invalidate } = useThree()
  useLayoutEffect(() => {
    const main = mainRef.current
    const copy = copyRef.current
    const sword = motionRef.current
    const key = keyRef.current
    const rim = rimRef.current
    if (!main || !copy || !sword || !key || !rim || reducedMotion) return
    const depth = { value: 0 }
    let appliedDepth = 0
    const applyDepth = () => {
      const change = depth.value - appliedDepth
      camera.position.addScaledVector(camera.position.clone().normalize(), -change)
      appliedDepth = depth.value
      invalidate()
    }
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: main, start: 'top top', end: () => `+=${Math.round(window.innerHeight * 0.9)}`, scrub: 1.1, invalidateOnRefresh: true },
    })
      .to(sword.position, { x: 0.35, y: 0.16, duration: 1, ease: 'none', onUpdate: invalidate }, 0)
      .to(sword.rotation, { y: 0.55, x: -0.08, duration: 1, ease: 'none', onUpdate: invalidate }, 0)
      .to(depth, { value: 0.65, duration: 1, ease: 'none', onUpdate: applyDepth }, 0)
      .to(key, { intensity: 3.5, duration: 1, ease: 'none', onUpdate: invalidate }, 0)
      .to(rim, { intensity: 2.9, duration: 1, ease: 'none', onUpdate: invalidate }, 0)
      .fromTo(copy.children, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.35, ease: 'power2.out' }, 0.53)
    return () => {
      timeline.scrollTrigger?.kill()
      timeline.kill()
      camera.position.addScaledVector(camera.position.clone().normalize(), appliedDepth)
      invalidate()
    }
  }, [camera, copyRef, invalidate, keyRef, mainRef, motionRef, reducedMotion, rimRef])
  return null
}

function DetailScrollScene({ copyRef, motionRef, keyRef, rimRef, reducedMotion, onActiveChange }: {
  copyRef: RefObject<HTMLDivElement | null>
  motionRef: RefObject<Group | null>
  keyRef: RefObject<DirectionalLight | null>
  rimRef: RefObject<DirectionalLight | null>
  reducedMotion: boolean
  onActiveChange: (active: boolean) => void
}) {
  const { camera, invalidate } = useThree()
  useLayoutEffect(() => {
    const copy = copyRef.current
    const sword = motionRef.current
    const key = keyRef.current
    const rim = rimRef.current
    if (!copy || !sword || !key || !rim || reducedMotion) return
    const depth = { value: 0 }
    let appliedDepth = 0
    const applyDepth = () => {
      const change = depth.value - appliedDepth
      camera.position.addScaledVector(camera.position.clone().normalize(), -change)
      appliedDepth = depth.value
      invalidate()
    }
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: copy, start: 'top 35%', end: 'bottom 20%', scrub: 1.15, invalidateOnRefresh: true,
        onEnter: () => onActiveChange(true), onEnterBack: () => onActiveChange(true),
        onLeaveBack: () => onActiveChange(false),
      },
    })
      .to(sword.position, { x: -0.12, y: 0.12, z: 0.22, duration: 1, ease: 'none', onUpdate: invalidate }, 0)
      .to(sword.rotation, { y: 1.04, x: -0.14, duration: 1, ease: 'none', onUpdate: invalidate }, 0)
      .to(depth, { value: 0.45, duration: 1, ease: 'none', onUpdate: applyDepth }, 0)
      .to(key, { intensity: 4.1, duration: 1, ease: 'none', onUpdate: invalidate }, 0)
      .to(rim, { intensity: 3.5, duration: 1, ease: 'none', onUpdate: invalidate }, 0)
      .fromTo(copy.children, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.38, ease: 'power2.out' }, 0.5)
    return () => {
      timeline.scrollTrigger?.kill()
      timeline.kill()
      camera.position.addScaledVector(camera.position.clone().normalize(), appliedDepth)
      invalidate()
    }
  }, [camera, copyRef, invalidate, keyRef, motionRef, onActiveChange, reducedMotion, rimRef])
  return null
}

function HotspotCamera({ active, selected, reducedMotion }: { active: boolean; selected: HotspotKey | null; reducedMotion: boolean }) {
  const { camera, controls, invalidate } = useThree()
  const hadSelection = useRef(false)
  useEffect(() => {
    if (!controls || !('target' in controls)) return
    if (!selected && !hadSelection.current) return
    if (selected) hadSelection.current = true
    const orbit = controls as typeof controls & { target: Vector3; update: () => void }
    const position = selected ? hotspotDetails[selected].camera : [0, 0, 4.7]
    const lookAt = selected ? hotspotDetails[selected].position : [0, 0, 0]
    const update = () => { orbit.update(); invalidate() }
    if (reducedMotion) {
      camera.position.set(position[0], position[1], position[2])
      orbit.target.set(lookAt[0] * 0.22, lookAt[1] * 0.22, 0)
      update()
      return
    }
    const timeline = gsap.timeline()
      .to(camera.position, { x: position[0], y: position[1], z: position[2], duration: 1.1, ease: 'power3.inOut', onUpdate: update }, 0)
      .to(orbit.target, { x: lookAt[0] * 0.22, y: lookAt[1] * 0.22, z: 0, duration: 1.1, ease: 'power3.inOut', onUpdate: update }, 0)
    return () => { timeline.kill() }
  }, [active, camera, controls, invalidate, reducedMotion, selected])
  return null
}

function CameraPresence({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera, gl, invalidate } = useThree()
  useEffect(() => {
    if (reducedMotion) { camera.position.z = 5.8; camera.zoom = 1; camera.updateProjectionMatrix(); invalidate(); return }
    camera.position.z = 7.4
    invalidate()
    const entrance = gsap.to(camera.position, { z: 5.8, duration: 1.8, ease: 'power3.out', onUpdate: invalidate })
    const depth = gsap.quickTo(camera, 'zoom', { duration: 0.55, ease: 'power2.out', onUpdate: () => { camera.updateProjectionMatrix(); invalidate() } })
    const move = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      depth(1 + (0.5 - (event.clientY - rect.top) / rect.height) * 0.035)
    }
    const reset = () => depth(1)
    gl.domElement.addEventListener('pointermove', move, { passive: true })
    gl.domElement.addEventListener('pointerleave', reset)
    return () => {
      entrance.kill()
      gsap.killTweensOf(camera)
      gl.domElement.removeEventListener('pointermove', move)
      gl.domElement.removeEventListener('pointerleave', reset)
    }
  }, [camera, gl, invalidate, reducedMotion])
  return null
}

export default function ThreeDPage() {
  const { t, to, lines } = useI18n()
  const mainRef = useRef<HTMLElement>(null)
  const scrollCopyRef = useRef<HTMLDivElement>(null)
  const detailCopyRef = useRef<HTMLDivElement>(null)
  const studioCopyRef = useRef<HTMLDivElement>(null)
  const finalCopyRef = useRef<HTMLElement>(null)
  const studioBackdropRef = useRef<HTMLDivElement>(null)
  const studioRotationRef = useRef<Group>(null)
  const [studioActive, setStudioActive] = useState(false)
  const motionRef = useRef<Group>(null)
  const keyRef = useRef<DirectionalLight>(null)
  const rimRef = useRef<DirectionalLight>(null)
  const [detailActive, setDetailActive] = useState(false)
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotKey | null>(null)
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  useEffect(() => { if (!detailActive) setSelectedHotspot(null) }, [detailActive])
  useEffect(() => {
    if (!reducedMotion || !detailCopyRef.current) return
    const observer = new IntersectionObserver(([entry]) => setDetailActive(entry.isIntersecting), { rootMargin: '0px 0px 35% 0px' })
    observer.observe(detailCopyRef.current)
    return () => observer.disconnect()
  }, [reducedMotion])
  return <div className={styles.page}>
    <Navbar currentPage="3d" />
    <main ref={mainRef} className={styles.main}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{t('threeEyebrow')}</p>
        <h1>{lines('threeHeading')[0]} <span>{lines('threeHeading')[1]}</span></h1>
        <p className={styles.description}>{t('threeIntro')}</p>
        <p className={styles.instruction}>{t('threeInstruction')}</p>
      </div>
      <div className={styles.viewer} role="group" aria-label={t('threeViewer')}>
        <div ref={studioBackdropRef} className={styles.studioBackdrop} aria-hidden="true" />
        <Canvas
          camera={{ position: [0, 0, 7.4], fov: 40 }}
          dpr={[1, 2]}
          frameloop={reducedMotion ? 'demand' : 'always'}
          shadows
          gl={{ alpha: true, antialias: true }}
          onCreated={({ gl }) => { gl.toneMapping = ACESFilmicToneMapping; gl.toneMappingExposure = 1 }}
        >
          <ambientLight intensity={0.13} />
          <hemisphereLight args={['#e8e2d5', '#220b0a', 0.42]} />
          <directionalLight ref={keyRef} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0002} position={[4, 6, 5]} color="#fff0d7" intensity={2.8} />
          <directionalLight position={[-4, 1, 3]} color="#e7a76c" intensity={0.95} />
          <directionalLight ref={rimRef} position={[2, 2, -4]} color="#c83c34" intensity={2} />
          <Environment frames={1} resolution={256} background={false}>
            <Lightformer position={[3, 2, 4]} target={[0, 0, 0]} scale={[2, 5]} color="#fff0d6" intensity={2} />
            <Lightformer position={[-4, 1, 2]} target={[0, 0, 0]} scale={[1, 4]} color="#c3d6ff" intensity={0.8} />
            <Lightformer position={[1, 3, -3]} target={[0, 0, 0]} scale={[2, 3]} color="#ffcf86" intensity={1.4} />
            <Lightformer position={[-2, -1, 3]} target={[0, 0, 0]} scale={[0.7, 4]} color="#f2473e" intensity={0.85} />
          </Environment>
          <Suspense fallback={null}>
            <ViewerModel reducedMotion={reducedMotion} motionRef={motionRef} studioRotationRef={studioRotationRef} detailActive={detailActive && !studioActive} selectedHotspot={selectedHotspot} onSelect={setSelectedHotspot} />
            <CameraPresence reducedMotion={reducedMotion} />
            <ScrollScene mainRef={mainRef} copyRef={scrollCopyRef} motionRef={motionRef} keyRef={keyRef} rimRef={rimRef} reducedMotion={reducedMotion} />
            <DetailScrollScene copyRef={detailCopyRef} motionRef={motionRef} keyRef={keyRef} rimRef={rimRef} reducedMotion={reducedMotion} onActiveChange={setDetailActive} />
            <HotspotCamera active={detailActive} selected={selectedHotspot} reducedMotion={reducedMotion} />
            <ThreeDStudioScene copyRef={studioCopyRef} backdropRef={studioBackdropRef} rotationRef={studioRotationRef} reducedMotion={reducedMotion} onActiveChange={setStudioActive} />
            <ThreeDFinalScene copyRef={finalCopyRef} swordRef={motionRef} reducedMotion={reducedMotion} />
            <ContactShadows position={[0, -1.83, 0]} opacity={0.38} scale={4.5} blur={2.4} far={2.5} frames={1} color="#090304" />
          </Suspense>
          <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={0.08} rotateSpeed={0.65} zoomSpeed={0.75} minDistance={4} maxDistance={10} />
        </Canvas>
        <span className={styles.dragIndicator} aria-hidden="true">{t('threeDrag')}</span>
        {selectedHotspot && detailActive && !studioActive && <aside className={styles.infoPanel} aria-live="polite">
          <button type="button" className={styles.closePanel} onClick={() => setSelectedHotspot(null)} aria-label={t('threeClose')}>×</button>
          <p>0{Object.keys(hotspotDetails).indexOf(selectedHotspot) + 1} / {t('threeDetail')}</p>
          <h3>{t(hotspotDetails[selectedHotspot].label as MessageKey)}</h3>
          <p>{t(hotspotDetails[selectedHotspot].text as MessageKey)}</p>
        </aside>}
      </div>
      <div ref={scrollCopyRef} className={styles.scrollCopy}>
        <p className={styles.sceneLabel}>{t('threeProcessLabel')}</p>
        <h2>{t('threeProcessHeading')}</h2>
        <p>{t('threeProcessText')}</p>
      </div>
      <div ref={detailCopyRef} className={styles.detailCopy}>
        <p className={styles.sceneLabel}>{t('threeCloseupLabel')}</p>
        <h2>{t('threeCloseupHeading')}</h2>
        <p>{t('threeCloseupText')}</p>
      </div>
      <div ref={studioCopyRef} className={styles.studioCopy}>
        <p className={styles.sceneLabel}>{t('threeStudioLabel')}</p>
        <h2>{t('threeStudioHeading')}</h2>
        <p>{t('threeStudioText')}</p>
      </div>
      <section ref={finalCopyRef} className={styles.finalCopy} aria-labelledby="three-d-final-heading">
        <p className={styles.sceneLabel}>{t('threeFinalLabel')}</p>
        <h2 id="three-d-final-heading">{t('threeFinalHeading')}</h2>
        <p>{t('threeFinalText')}</p>
        <a className={styles.finalAction} href={to('/contact#contact-name')}>{t('startProject')} <span aria-hidden="true">↗</span></a>
      </section>
      <div className={styles.footer}><span>{t('threeFooterLeft')}</span><span>{t('threeFooterRight')}</span></div>
    </main>
  </div>
}
