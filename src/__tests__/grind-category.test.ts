import { describe, it, expect } from 'vitest'
import { categorizeGrind } from '../lib/grindCategory'

describe('categorizeGrind', () => {
  it('classifies extra coarse >=1200', () => {
    expect(categorizeGrind(1500)).toBe('grindExtraCoarse')
  })
  it('classifies coarse 800-<1200', () => {
    expect(categorizeGrind(800)).toBe('grindCoarse')
    expect(categorizeGrind(1199.9)).toBe('grindCoarse')
  })
  it('classifies medium coarse 700-<900 preferred over overlapping', () => {
    expect(categorizeGrind(750)).toBe('grindMediumCoarse')
  })
  it('classifies medium 500-<800 if not captured by medium coarse overlap', () => {
    // 650 is not in medium coarse interval (700-900) so should be medium
    expect(categorizeGrind(650)).toBe('grindMedium')
  })
  it('classifies medium fine 300-<600', () => {
    expect(categorizeGrind(350)).toBe('grindMediumFine')
  })
  it('classifies fine 100-<300', () => {
    expect(categorizeGrind(150)).toBe('grindFine')
  })
  it('classifies extra fine 100-<200 prioritized', () => {
    expect(categorizeGrind(120)).toBe('grindExtraFine')
  })
})
