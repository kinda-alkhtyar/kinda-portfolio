export type HeroSwordRuntimeState = {
  /** Smoothed progress from Hero start to Project 01 entrance, clamped to 0..1. */
  scrollProgress: number
  /** Normalized cursor input, from -1 to 1 on each axis. */
  mouseInfluence: { x: number; y: number }
  /** Idle animation can remain enabled while the scroll sequence runs. */
  idle: { enabled: boolean; elapsed: number }
  /** True while the scrubbed timeline is advancing; false when it settles. */
  isScrollActive: boolean
}

/** Mutable frame state avoids React rerenders and can be instantiated independently. */
export function createHeroSwordRuntime() {
  const state: HeroSwordRuntimeState = {
    scrollProgress: 0,
    mouseInfluence: { x: 0, y: 0 },
    idle: { enabled: false, elapsed: 0 },
    isScrollActive: false,
  }
  const clamp = (value: number, min: number, max: number) =>
    Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 0

  return {
    state,
    setMouse(x: number, y: number) {
      state.mouseInfluence.x = clamp(x, -1, 1)
      state.mouseInfluence.y = clamp(y, -1, 1)
    },
    setIdle(enabled: boolean, elapsed = 0) {
      state.idle.enabled = enabled
      state.idle.elapsed = enabled ? Math.max(0, elapsed) : 0
    },
    setScroll(progress: number, active: boolean) {
      state.scrollProgress = clamp(progress, 0, 1)
      state.isScrollActive = active
    },
    resetScroll() {
      state.scrollProgress = 0
      state.isScrollActive = false
    },
  }
}

export const heroSwordRuntime = createHeroSwordRuntime()
