import { useEffect, useMemo, useState } from 'react'
import { I18nProvider, useI18n } from './lib/i18n'
import ReactFlagsSelect from 'react-flags-select'
import GrinderSelect from './components/GrinderSelect'
import { loadGrinder, loadManifest } from './lib/data'
import { convertBetweenGrinders } from './lib/interpolate'
import { parseInput, roundToStep, validateRangeAndStep } from './lib/validation'
import { grindCategoryLabel } from './lib/grindCategory'
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

function AppInner() {
  const { t, locale, setLocale } = useI18n()
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
  if (n === null) return { n, err: fromSettingText ? t('invalidValue') : null }
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
    <div className="min-h-screen text-gray-900 dark:text-white dark:bg-neutral-900">
      <header className="bg-white border-b border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
        <div className="mx-auto max-w-4xl px-4 py-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('title')}</h1>
            <p className="text-sm text-gray-600 mt-1 dark:text-neutral-400">{t('subtitle')}</p>
          </div>
          <div className="flex items-center" aria-label="Language picker">
            <label htmlFor="lang-flags" className="sr-only">Language</label>
            <ReactFlagsSelect
              id="lang-flags"
              countries={["US", "JP"]}
              customLabels={{ US: '', JP: '' }}
              selected={locale === 'ja' ? 'JP' : 'US'}
              onSelect={(code) => setLocale(code === 'JP' ? 'ja' : 'en')}
              showSelectedLabel={false}
              showOptionLabel={false}
              selectedSize={18}
              optionsSize={16}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4 space-y-6">
        {manifestError && (
          <div role="alert" className="bg-red-50 border border-red-200 text-sm text-red-800 rounded-lg p-4 dark:bg-red-800/10 dark:border-red-900 dark:text-red-500">
            {t('failedManifest', { error: manifestError })}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <GrinderSelect id="from-grinder" label={t('fromGrinder')} options={options} value={fromFile} onChange={setFromFile} />
          <GrinderSelect id="to-grinder" label={t('toGrinder')} options={options} value={toFile} onChange={setToFile} />
        </section>

        <section className="grid gap-4 md:grid-cols-2 items-end">
          <div>
            <label htmlFor="from-setting" className="block text-sm font-medium mb-2 dark:text-white">
              {t('fromSetting')}
            </label>
            {/* Placeholder reflects step granularity (e.g., 0.0 – 16.0 for step 0.1) */}
            <input
              id="from-setting"
              inputMode="decimal"
              className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
              placeholder={(() => {
                if (!fromGrinder) return ''
                const { min, max, step } = fromGrinder.setting_constraints
                // Count decimals in step to decide formatting (supports scientific notation)
                const countDecimals = (n: number) => {
                  if (Number.isInteger(n)) return 0
                  const s = n.toString().toLowerCase()
                  if (s.includes('e-')) {
                    const parts = s.split('e-')
                    const exp = parseInt(parts[1] || '0', 10)
                    return exp
                  }
                  return (s.split('.')[1] || '').length
                }
                const decimals = countDecimals(step)
                const fmt = (v: number) => decimals > 0 ? v.toFixed(decimals) : String(v)
                return `${fmt(min)} – ${fmt(max)}`
              })()}
              value={fromSettingText}
              onChange={(e) => setFromSettingText(e.target.value)}
              aria-invalid={!!parsed.err}
              aria-describedby="from-setting-error"
            />
            {parsed.err && (
              <p id="from-setting-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-500">
                {parsed.err}
              </p>
            )}
          </div>
        </section>

        <section className="mt-4">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{t('resultTitle')}</h2>
          {!result && <p className="text-gray-600 dark:text-neutral-400">{t('enterPrompt')}</p>}
          {result && toGrinder && (
            <div className="space-y-2">
              <p className="text-xl text-gray-800 dark:text-gray-200">
                {t('toSettingApprox')} <span className="font-semibold">{result.rounded}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-neutral-400">
                {t('medianMatch', {
                  um: result.micrometer.toFixed(1),
                  grindCategory: grindCategoryLabel(t, result.micrometer),
                })}
              </p>
              {result.clamped && (
                <p role="alert" className="text-sm text-amber-700 dark:text-amber-500">
                  {t('warningClamped')}
                </p>
              )}
            </div>
          )}
        </section>

        <section
          role="note"
          aria-labelledby="disclaimer-title"
          className="mt-8 flex flex-col bg-white border shadow-sm rounded-xl p-4 md:p-5 dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70"
        >
          <h2 id="disclaimer-title" className="text-base font-semibold mb-2 text-gray-800 dark:text-white">{t('disclaimerTitle')}</h2>
          <p className="text-sm leading-relaxed text-gray-500 dark:text-neutral-400">{t('disclaimerText')}</p>
        </section>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <AppInner />
    </I18nProvider>
  )
}
