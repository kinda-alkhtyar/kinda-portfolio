/** A monotonic, symmetric time remap; the existing flight poses and path stay intact. */
export function railTiming(progress: number) {
  const t = Math.max(0, Math.min(1, progress))
  return t + 0.06 * Math.sin(2 * Math.PI * t)
}

export const finalCompileStart = 0.62

export const projectPulseTiming = {
  charge: 0.28,
  release: 0.22,
  travel: 1.08,
  arrival: 1.3,
  decay: 0.72,
  fade: 0.32,
} as const
