import type { Grinder, Manifest } from './types'

const base = (import.meta as any).env?.BASE_URL ?? '/'
const manifestUrl = `${base}grinders/index.json`

const cache: {
  manifest?: Manifest
  grinders: Record<string, Grinder>
} = { grinders: {} }

export async function loadManifest(): Promise<Manifest> {
  if (cache.manifest) return cache.manifest
  const res = await fetch(manifestUrl)
  if (!res.ok) throw new Error('Failed to load manifest')
  const m = (await res.json()) as Manifest
  cache.manifest = m
  return m
}

export async function loadGrinder(fileName: string): Promise<Grinder> {
  if (cache.grinders[fileName]) return cache.grinders[fileName]
  const res = await fetch(`${base}grinders/${fileName}`)
  if (!res.ok) throw new Error(`Failed to load grinder: ${fileName}`)
  const g = (await res.json()) as Grinder
  cache.grinders[fileName] = g
  return g
}

export function clearCache() {
  cache.manifest = undefined
  cache.grinders = {}
}
