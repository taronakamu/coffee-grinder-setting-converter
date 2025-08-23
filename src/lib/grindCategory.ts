// Grind size categorization helper.
// Determines a human-readable grind category from a median particle size (µm).

export type GrindCategoryKey =
  | 'grindExtraCoarse'
  | 'grindCoarse'
  | 'grindMediumCoarse'
  | 'grindMedium'
  | 'grindMediumFine'
  | 'grindFine'
  | 'grindExtraFine'

export function categorizeGrind(um: number): GrindCategoryKey {
  if (!Number.isFinite(um) || um < 0) return 'grindExtraFine'
  if (um >= 1200) return 'grindExtraCoarse'
  if (um >= 800) return 'grindCoarse'
  if (um >= 700) return 'grindMediumCoarse'
  if (um >= 500) return 'grindMedium'
  if (um >= 300) return 'grindMediumFine'
  if (um >= 100) return um < 130 ? 'grindExtraFine' : 'grindFine'
  return 'grindExtraFine'
}

export function grindCategoryLabel(t: (k: string) => string, um: number) {
  return t(categorizeGrind(um))
}
