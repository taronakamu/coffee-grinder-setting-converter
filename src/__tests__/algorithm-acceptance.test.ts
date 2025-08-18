import { describe, it, expect } from 'vitest'
import { convertBetweenGrinders } from '../lib/interpolate'
import { roundToStep, validateRangeAndStep } from '../lib/validation'
import type { Grinder } from '../lib/types'

const from: Grinder = {
  grinder_id: 'from',
  display_name: 'From',
  setting_type: 'clicks',
  setting_format: 'integer',
  setting_constraints: { min: 6, max: 35, step: 1 },
  // setting -> µm
  mapping: { '6': 200, '20': 400, '35': 700 },
}
const to: Grinder = {
  grinder_id: 'to',
  display_name: 'To',
  setting_type: 'dial',
  setting_format: 'decimal',
  setting_constraints: { min: 0, max: 10, step: 0.1 },
  // setting -> µm
  mapping: { '1.0': 200, '2.5': 400, '5.0': 700 },
}

describe('Acceptance: conversion and clamping', () => {
  it('validates range, converts, rounds, and flags clamp', () => {
    const input = 20
    const v = validateRangeAndStep(input, from)
    expect(v.ok).toBe(true)
    const res = convertBetweenGrinders(from, to, input)
    const rounded = roundToStep(res.setting, to)
    expect(rounded).toBeCloseTo(2.5)
    expect(res.micrometer).toBeCloseTo(400)
    expect(res.clamped).toBe(false)
  })
})
