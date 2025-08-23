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
    <div className="min-h-screen text-gray-900">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-4xl px-4 py-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t('title')}</h1>
            <p className="text-sm text-gray-600 mt-1">{t('subtitle')}</p>
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
          <div role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-red-800">
            {t('failedManifest', { error: manifestError })}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <GrinderSelect id="from-grinder" label={t('fromGrinder')} options={options} value={fromFile} onChange={setFromFile} />
          <GrinderSelect id="to-grinder" label={t('toGrinder')} options={options} value={toFile} onChange={setToFile} />
        </section>

        <section className="grid gap-4 md:grid-cols-2 items-end">
          <div>
            <label htmlFor="from-setting" className="block text-sm font-medium text-gray-700 mb-1">
              {t('fromSetting')}
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
          <h2 className="text-lg font-semibold mb-2">{t('resultTitle')}</h2>
          {!result && <p className="text-gray-600">{t('enterPrompt')}</p>}
          {result && toGrinder && (
            <div className="space-y-2">
              <p className="text-xl">
                {t('toSettingApprox')} <span className="font-semibold">{result.rounded}</span>
              </p>
              <p className="text-sm text-gray-600">
                {t('medianMatch', {
                  um: result.micrometer.toFixed(1),
                  grindCategory: grindCategoryLabel(t, result.micrometer),
                })}
              </p>
              {result.clamped && (
                <p role="alert" className="text-sm text-amber-700">
                  {t('warningClamped')}
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
          <h2 id="disclaimer-title" className="text-base font-semibold mb-2">{t('disclaimerTitle')}</h2>
          <p className="text-sm leading-relaxed">{t('disclaimerText')}</p>
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
