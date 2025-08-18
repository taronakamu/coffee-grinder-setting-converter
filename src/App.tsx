import { useEffect, useMemo, useState } from 'react'
import GrinderSelect from './components/GrinderSelect'
import { loadGrinder, loadManifest } from './lib/data'
import { convertBetweenGrinders } from './lib/interpolate'
import { parseInput, roundToStep, validateRangeAndStep } from './lib/validation'
import type { Grinder } from './lib/types'

interface Option { label: string; value: string }

function useManifestOptions() {
  const [options, setOptions] = useState<Option[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    loadManifest()
      .then(async (m) => {
        const gs = await Promise.all(m.files.map((f) => loadGrinder(f)))
        setOptions(gs.map((g, i) => ({ label: g.display_name, value: m.files[i] })))
      })
      .catch((e) => setError(String(e)))
  }, [])
  return { options, error }
}

export default function App() {
  const { options, error: manifestError } = useManifestOptions()
  const [fromFile, setFromFile] = useState<string | null>(null)
  const [toFile, setToFile] = useState<string | null>(null)
  const [fromSettingText, setFromSettingText] = useState('')

  const [fromGrinder, setFromGrinder] = useState<Grinder | null>(null)
  const [toGrinder, setToGrinder] = useState<Grinder | null>(null)

  useEffect(() => {
    if (fromFile) loadGrinder(fromFile).then(setFromGrinder)
    else setFromGrinder(null)
  }, [fromFile])
  useEffect(() => {
    if (toFile) loadGrinder(toFile).then(setToGrinder)
    else setToGrinder(null)
  }, [toFile])

  const parsed = useMemo(() => {
    if (!fromGrinder) return { n: null as number | null, err: null as string | null }
    const n = parseInput(fromSettingText, fromGrinder.setting_format)
    if (n === null) return { n, err: fromSettingText ? 'Invalid value' : null }
    const vr = validateRangeAndStep(n, fromGrinder)
    if (!vr.ok) return { n, err: vr.message ?? 'Invalid value' }
    return { n, err: null }
  }, [fromSettingText, fromGrinder])

  const result = useMemo(() => {
    if (!fromGrinder || !toGrinder || parsed.n === null) return null
    const conv = convertBetweenGrinders(fromGrinder, toGrinder, parsed.n)
    const rounded = roundToStep(conv.setting, toGrinder)
    return { ...conv, rounded }
  }, [fromGrinder, toGrinder, parsed])

  return (
    <div className="min-h-screen text-gray-900">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-2xl font-semibold">Coffee Grinder Setting Converter</h1>
          <p className="text-sm text-gray-600 mt-1">
            This tool matches median particle size (µm). Results are approximations.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4 space-y-6">
        {manifestError && (
          <div role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-red-800">
            Failed to load manifest: {manifestError}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <GrinderSelect id="from-grinder" label="From grinder" options={options} value={fromFile} onChange={setFromFile} />
          <GrinderSelect id="to-grinder" label="To grinder" options={options} value={toFile} onChange={setToFile} />
        </section>

        <section className="grid gap-4 md:grid-cols-2 items-end">
          <div>
            <label htmlFor="from-setting" className="block text-sm font-medium text-gray-700 mb-1">
              From setting
            </label>
            <input
              id="from-setting"
              inputMode="decimal"
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={fromGrinder ? `${fromGrinder.setting_constraints.min} – ${fromGrinder.setting_constraints.max}` : ''}
              value={fromSettingText}
              onChange={(e) => setFromSettingText(e.target.value)}
              aria-invalid={!!parsed.err}
              aria-describedby="from-setting-error"
            />
            {parsed.err && (
              <p id="from-setting-error" role="alert" className="mt-1 text-sm text-red-700">
                {parsed.err}
              </p>
            )}
          </div>
        </section>

        <section className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Result</h2>
          {!result && <p className="text-gray-600">Select grinders and enter a valid source setting.</p>}
          {result && toGrinder && (
            <div className="space-y-2">
              <p className="text-xl">
                To setting ≈ <span className="font-semibold">{result.rounded}</span>
              </p>
              <p className="text-sm text-gray-600">~ {result.micrometer.toFixed(1)} µm (median match)</p>
              {result.clamped && (
                <p role="alert" className="text-sm text-amber-700">
                  Warning: result outside target range, clamped to nearest setting.
                </p>
              )}
            </div>
          )}
        </section>

        <section
          role="note"
          aria-labelledby="disclaimer-title"
          className="mt-8 rounded-md border border-gray-300 bg-gray-50 p-4 text-gray-800"
        >
          <h2 id="disclaimer-title" className="text-base font-semibold mb-2">Disclaimer</h2>
          <p className="text-sm leading-relaxed">
            This tool provides approximate conversions between grinders based on the median particle size (µm). Coffee
            flavor depends heavily on the full grind size distribution, not just the median value. Results can vary due
            to grinder design, manufacturing tolerances, and burr wear over time. Therefore, the output should be
            treated only as a reference to help achieve comparable brews — it cannot guarantee identical flavor
            profiles.
          </p>
        </section>
      </main>
    </div>
  )
}
