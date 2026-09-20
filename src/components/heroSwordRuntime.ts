export type SwordProjectId = '01' | '02' | '03'
export type HeroSwordRuntimeState = {
  /** Full-page journey progress from Hero to the Final CTA, clamped to 0..1. */
  scrollProgress: number
  /** Normalized cursor input, from -1 to 1 on each axis. */
  mouseInfluence: { x: number; y: number }
  /** Idle animation can remain enabled while the scroll sequence runs. */
  idle: { enabled: boolean; elapsed: number }
  /** True while the scrubbed timeline is advancing; false when it settles. */
  isScrollActive: boolean
  project01Reached: boolean
  project01Activated: boolean
  project01Glow: number
  finalTravelProgress: number
  finalCompileProgress: number
  projects: Record<SwordProjectId, { reached: boolean; activated: boolean; glow: number }>
}

/** Mutable frame state avoids React rerenders and can be instantiated independently. */
export function createHeroSwordRuntime() {
  const state: HeroSwordRuntimeState = {
    scrollProgress: 0,
    mouseInfluence: { x: 0, y: 0 },
    idle: { enabled: false, elapsed: 0 },
    isScrollActive: false,
    project01Reached: false,
    project01Activated: false,
    project01Glow: 0,
    finalTravelProgress: 0,
    finalCompileProgress: 0,
    projects: {
      '01': { reached: false, activated: false, glow: 0 },
      '02': { reached: false, activated: false, glow: 0 },
      '03': { reached: false, activated: false, glow: 0 },
    },
  }
  const checkpointListeners = new Set<() => void>()
  const activationListeners = new Set<() => void>()
  const finalListeners = new Set<() => void>()
  const projectReachedListeners = new Map<SwordProjectId, Set<() => void>>()
  const projectActivatedListeners = new Map<SwordProjectId, Set<() => void>>()
  const clamp = (value: number, min: number, max: number) =>
    Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 0

  return {
    state,
    setFinalProgress(travel: number, compile: number) {
      const nextTravel = clamp(travel, 0, 1)
      const nextCompile = clamp(compile, 0, 1)
      if (state.finalTravelProgress === nextTravel && state.finalCompileProgress === nextCompile) return
      state.finalTravelProgress = nextTravel
      state.finalCompileProgress = nextCompile
      finalListeners.forEach((listener) => listener())
    },
    onFinalProgress(listener: () => void) {
      finalListeners.add(listener)
      listener()
      return () => { finalListeners.delete(listener) }
    },
    setMouse(x: number, y: number) {
      state.mouseInfluence.x = clamp(x, -1, 1)
      state.mouseInfluence.y = clamp(y, -1, 1)
    },
    setIdle(enabled: boolean, elapsed = 0) {
      state.idle.enabled = enabled
      state.idle.elapsed = enabled ? Math.max(0, elapsed) : 0
    },
    setScroll(progress: number, active: boolean, project01Checkpoint = 1, project02Checkpoint = 1, project03Checkpoint = 1) {
      state.scrollProgress = clamp(progress, 0, 1)
      state.isScrollActive = active
      if (state.scrollProgress >= project01Checkpoint - 0.0001 && !state.project01Reached) {
        state.project01Reached = true
        checkpointListeners.forEach((listener) => listener())
      }
      ;(['01', '02', '03'] as const).forEach((id, index) => {
        const boundary = [project01Checkpoint, project02Checkpoint, project03Checkpoint][index]
        if (state.scrollProgress >= boundary - 0.0001 && !state.projects[id].reached) {
          state.projects[id].reached = true
          projectReachedListeners.get(id)?.forEach((listener) => listener())
        }
      })
    },
    onProjectReached(id: SwordProjectId, listener: () => void) {
      if (!projectReachedListeners.has(id)) projectReachedListeners.set(id, new Set())
      projectReachedListeners.get(id)!.add(listener)
      if (state.projects[id].reached) listener()
      return () => { projectReachedListeners.get(id)?.delete(listener) }
    },
    activateProject(id: SwordProjectId) {
      if (state.projects[id].activated) return
      state.projects[id].activated = true
      if (id === '01') {
        state.project01Activated = true
        activationListeners.forEach((listener) => listener())
      }
      projectActivatedListeners.get(id)?.forEach((listener) => listener())
    },
    onProjectActivated(id: SwordProjectId, listener: () => void) {
      if (!projectActivatedListeners.has(id)) projectActivatedListeners.set(id, new Set())
      projectActivatedListeners.get(id)!.add(listener)
      if (state.projects[id].activated) listener()
      return () => { projectActivatedListeners.get(id)?.delete(listener) }
    },
    onProject01Reached(listener: () => void) {
      checkpointListeners.add(listener)
      if (state.project01Reached) listener()
      return () => { checkpointListeners.delete(listener) }
    },
    activateProject01() {
      if (state.project01Activated) return
      state.project01Activated = true
      activationListeners.forEach((listener) => listener())
    },
    onProject01Activated(listener: () => void) {
      activationListeners.add(listener)
      if (state.project01Activated) listener()
      return () => { activationListeners.delete(listener) }
    },
    resetScroll() {
      state.scrollProgress = 0
      state.isScrollActive = false
    },
  }
}

export const heroSwordRuntime = createHeroSwordRuntime()
