import type { Grinder } from './types'

export type InterpResult = {
  micrometer: number
  setting: number
  clamped: boolean
}

// Expect mapping as { setting: micrometer }
function sortPairs(mapping: Record<string, number>): Array<[number, number]> {
  return Object.entries(mapping)
    .map(([setting, um]) => [Number(setting), um] as [number, number])
    .sort((a, b) => a[0] - b[0])
}

// Linear interpolation: given x->y pairs and x, find y. Assumes xs are sorted asc.
export function lerp(pairs: Array<[number, number]>, x: number): { y: number; clamped: boolean } {
  if (pairs.length === 0) throw new Error('No data')
  const xs = pairs.map((p) => p[0])
  const ys = pairs.map((p) => p[1])
  if (x <= xs[0]) return { y: ys[0], clamped: true }
  if (x >= xs[xs.length - 1]) return { y: ys[ys.length - 1], clamped: true }
  for (let i = 1; i < xs.length; i++) {
    const x0 = xs[i - 1]
    const x1 = xs[i]
    if (x >= x0 && x <= x1) {
      const y0 = ys[i - 1]
      const y1 = ys[i]
      const t = (x - x0) / (x1 - x0)
      return { y: y0 + t * (y1 - y0), clamped: false }
    }
  }
  // Fallback, shouldn't reach if pairs cover range
  return { y: ys[ys.length - 1], clamped: true }
}

// Inverse linear interpolation: given x->y pairs and y, find x.
export function invLerp(pairs: Array<[number, number]>, y: number): { x: number; clamped: boolean } {
  if (pairs.length === 0) throw new Error('No data')
  const xs = pairs.map((p) => p[0])
  const ys = pairs.map((p) => p[1])
  if (y <= ys[0]) return { x: xs[0], clamped: true }
  if (y >= ys[ys.length - 1]) return { x: xs[xs.length - 1], clamped: true }
  for (let i = 1; i < ys.length; i++) {
    const y0 = ys[i - 1]
    const y1 = ys[i]
    if (y >= y0 && y <= y1) {
      const x0 = xs[i - 1]
      const x1 = xs[i]
      const t = (y - y0) / (y1 - y0)
      return { x: x0 + t * (x1 - x0), clamped: false }
    }
  }
  return { x: xs[xs.length - 1], clamped: true }
}

export function convertBetweenGrinders(from: Grinder, to: Grinder, fromSetting: number): InterpResult & { warning?: string } {
  // 1. From setting -> µm using mapping {setting -> µm}
  let micrometer: number
  const exact = from.mapping[String(fromSetting)]
  if (typeof exact === 'number') {
    micrometer = exact
  } else {
    const fromPairs = sortPairs(from.mapping) // [setting, µm]
    const res = lerp(fromPairs, fromSetting)
    micrometer = res.y
    // Note: source-side extrapolation control is handled by input validation against constraints.
  }

  // 2. µm -> To setting via inverse interpolation on {setting -> µm}
  const toPairs = sortPairs(to.mapping)
  const inv = invLerp(toPairs, micrometer) // returns { x: setting }
  const setting = inv.x
  const clamped = inv.clamped

  let warning: string | undefined
  if (clamped) {
    warning = 'Warning: result outside target range, clamped to nearest setting.'
  }
  return { micrometer, setting, clamped, warning }
}
