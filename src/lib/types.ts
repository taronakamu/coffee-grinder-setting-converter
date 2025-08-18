export interface Grinder {
  grinder_id: string
  display_name: string
  setting_type: 'clicks' | 'dial'
  setting_format: 'integer' | 'decimal'
  setting_constraints: { min: number; max: number; step: number }
  mapping: Record<string, number>
}

export interface Manifest {
  files: string[]
}
