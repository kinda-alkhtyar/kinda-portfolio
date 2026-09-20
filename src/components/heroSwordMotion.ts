// The Hero-to-Project timeline owns these values; R3F only reads them.
export const heroSwordMotion = { lift: 0, tilt: 0, glow: 0, recede: 0 }

export function resetHeroSwordMotion() {
  Object.assign(heroSwordMotion, { lift: 0, tilt: 0, glow: 0, recede: 0 })
}
