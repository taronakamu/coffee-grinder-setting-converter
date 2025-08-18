import type { Grinder } from './types'

export function parseInput(value: string, format: Grinder['setting_format']): number | null {
  if (value.trim() === '') return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  if (format === 'integer' && !Number.isInteger(n)) return null
  return n
}

export function validateRangeAndStep(n: number, grinder: Grinder): { ok: boolean; message?: string } {
  const { min, max, step } = grinder.setting_constraints
  if (n < min || n > max) {
    return {
      ok: false,
      message: `Value ${n} is out of range for ${grinder.display_name} (allowed: ${min}–${max}, step ${step}).`,
    }
  }
  // step validation: n should be min + k*step (within float tolerance)
  const k = (n - min) / step
  const nearest = Math.round(k)
  const diff = Math.abs(k - nearest)
  if (diff > 1e-9) {
    return {
      ok: false,
      message: `Value must align to step ${step} starting from ${min}.`,
    }
  }
  return { ok: true }
}

export function roundToStep(n: number, grinder: Grinder): number {
  const { min, step } = grinder.setting_constraints
  const k = Math.round((n - min) / step)
  let r = min + k * step
  if (grinder.setting_format === 'integer') r = Math.round(r)
  // Normalize tiny floating errors
  r = Number.parseFloat(r.toFixed(6))
  return r
}
