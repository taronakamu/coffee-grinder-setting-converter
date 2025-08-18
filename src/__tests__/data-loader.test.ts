import { describe, it, expect } from 'vitest'
import { clearCache } from '../lib/data'

describe('data cache', () => {
  it('clears cache without throwing', () => {
    expect(() => clearCache()).not.toThrow()
  })
})
