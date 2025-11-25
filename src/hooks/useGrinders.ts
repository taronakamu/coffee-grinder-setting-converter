import { useEffect, useState } from 'react'
import { loadGrinder, loadManifest } from '../lib/data'
import type { Grinder } from '../lib/types'

export interface GrinderData {
  fileName: string
  grinder: Grinder
}

export function useGrinders() {
  const [grinders, setGrinders] = useState<GrinderData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadManifest()
      .then(async (m) => {
        const gs = await Promise.all(m.files.map((f) => loadGrinder(f)))
        setGrinders(gs.map((g, i) => ({ fileName: m.files[i], grinder: g })))
        setLoading(false)
      })
      .catch((e) => {
        setError(String(e))
        setLoading(false)
      })
  }, [])

  return { grinders, error, loading }
}
