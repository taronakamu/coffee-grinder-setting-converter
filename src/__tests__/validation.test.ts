import { describe, it, expect } from 'vitest'
import { parseInput, roundToStep, validateRangeAndStep } from '../lib/validation'
import type { Grinder } from '../lib/types'

const g: Grinder = {
  grinder_id: 'G',
  display_name: 'G',
  setting_type: 'clicks',
  setting_format: 'decimal',
  setting_constraints: { min: 0, max: 5, step: 0.5 },
  mapping: { '100': 1 },
}

describe('parseInput', () => {
  it('parses integer/decimal correctly', () => {
    expect(parseInput('3', 'integer')).toBe(3)
    expect(parseInput('3.2', 'integer')).toBeNull()
    expect(parseInput('3.2', 'decimal')).toBeCloseTo(3.2)
  })
})

describe('validateRangeAndStep', () => {
  it('validates range and step', () => {
    expect(validateRangeAndStep(1.0, g).ok).toBe(true)
    expect(validateRangeAndStep(1.2, g).ok).toBe(false)
    expect(validateRangeAndStep(10, g).ok).toBe(false)
  })
})

describe('roundToStep', () => {
  it('rounds to nearest step from min', () => {
    expect(roundToStep(1.26, g)).toBeCloseTo(1.5)
    expect(roundToStep(1.24, g)).toBeCloseTo(1.0)
  })
})
