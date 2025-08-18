import { describe, it, expect } from 'vitest'
import { convertBetweenGrinders, invLerp, lerp } from '../lib/interpolate'
import type { Grinder } from '../lib/types'

const gA: Grinder = {
  grinder_id: 'A',
  display_name: 'A',
  setting_type: 'clicks',
  setting_format: 'integer',
  setting_constraints: { min: 0, max: 10, step: 1 },
  // mapping: setting -> µm
  mapping: { '0': 100, '5': 200, '10': 300 },
}
const gB: Grinder = {
  grinder_id: 'B',
  display_name: 'B',
  setting_type: 'dial',
  setting_format: 'decimal',
  setting_constraints: { min: 0, max: 10, step: 0.5 },
  // mapping: setting -> µm
  mapping: { '1': 100, '9': 300 },
}

describe('lerp (setting -> µm)', () => {
  it('interpolates inside range', () => {
    const res = lerp([
      [0, 100],
      [5, 200],
      [10, 300],
    ], 2.5)
    expect(res.y).toBeCloseTo(150)
    expect(res.clamped).toBe(false)
  })
  it('clamps low/high', () => {
    expect(lerp([[0, 100], [10, 300]], -1).clamped).toBe(true)
    expect(lerp([[0, 100], [10, 300]], 11).clamped).toBe(true)
  })
})

describe('invLerp (µm -> setting)', () => {
  it('inverse interpolates inside range', () => {
    const res = invLerp([
      [0, 100],
      [5, 200],
      [10, 300],
    ], 250)
    expect(res.x).toBeCloseTo(7.5)
    expect(res.clamped).toBe(false)
  })
})

describe('convertBetweenGrinders', () => {
  it('converts and clamps when needed', () => {
    const res = convertBetweenGrinders(gA, gB, 10) // 10(setting)->300µm -> invLerp on B to ~9
    expect(res.micrometer).toBeCloseTo(300)
    expect(res.setting).toBeCloseTo(9)
  })
})
