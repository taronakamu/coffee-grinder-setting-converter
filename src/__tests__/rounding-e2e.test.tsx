import { describe, it, expect } from 'vitest'
import { roundToStep } from '../lib/validation'
import type { Grinder } from '../lib/types'

describe('roundToStep format behavior', () => {
  const gInt: Grinder = {
    grinder_id: 'int',
    display_name: 'Int',
    setting_type: 'clicks',
    setting_format: 'integer',
    setting_constraints: { min: 0, max: 10, step: 1 },
    mapping: { '100': 1 }
  }
  const gDec: Grinder = {
    grinder_id: 'dec',
    display_name: 'Dec',
    setting_type: 'dial',
    setting_format: 'decimal',
    setting_constraints: { min: 0, max: 10, step: 0.2 },
    mapping: { '100': 1 }
  }

  it('rounds integers', () => {
    expect(roundToStep(3.6, gInt)).toBe(4)
  })
  it('rounds decimals to steps', () => {
    expect(roundToStep(3.58, gDec)).toBeCloseTo(3.6)
    expect(roundToStep(3.49, gDec)).toBeCloseTo(3.4)
  })
})
