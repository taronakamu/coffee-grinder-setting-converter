import { useMemo, useState } from 'react'
import { useI18n } from '../lib/i18n'
import { useGrinders } from '../hooks/useGrinders'
import { convertMicronsToSetting } from '../lib/interpolate'
import { roundToStep } from '../lib/validation'
import { grindCategoryLabel } from '../lib/grindCategory'

export default function TableView() {
  const { t } = useI18n()
  const { grinders, error, loading } = useGrinders()
  const [micronsText, setMicronsText] = useState('')

  const microns = useMemo(() => {
    const n = parseFloat(micronsText)
    return isNaN(n) ? null : n
  }, [micronsText])

  const results = useMemo(() => {
    if (microns === null) return []
    return grinders.map(({ grinder }) => {
      const { setting, clamped } = convertMicronsToSetting(grinder, microns)
      const rounded = roundToStep(setting, grinder)
      return {
        name: grinder.display_name,
        setting: rounded,
        clamped
      }
    })
  }, [grinders, microns])

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-sm text-red-800 rounded-lg p-4 dark:bg-red-800/10 dark:border-red-900 dark:text-red-500">
          {t('failedManifest', { error })}
        </div>
      )}
      {loading && <p className="text-gray-600 dark:text-neutral-400">Loading...</p>}

      <div>
        <label htmlFor="microns-input" className="block text-sm font-medium mb-2 dark:text-white">
          {t('enterMicrons')}
        </label>
        <div className="relative">
          <input
            id="microns-input"
            type="number"
            inputMode="decimal"
            className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
            placeholder="e.g. 600"
            value={micronsText}
            onChange={(e) => setMicronsText(e.target.value)}
          />
          {microns !== null && (
            <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-4">
              <span className="text-gray-500 dark:text-neutral-500 text-sm">
                {grindCategoryLabel(t, microns)}
              </span>
            </div>
          )}
        </div>
      </div>

      {microns !== null && (
        <div className="flex flex-col">
          <div className="-m-1.5 overflow-x-auto">
            <div className="p-1.5 min-w-full inline-block align-middle">
              <div className="border rounded-lg overflow-hidden dark:border-neutral-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                  <thead className="bg-gray-50 dark:bg-neutral-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-400">{t('grinderName')}</th>
                      <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-400">{t('setting')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                    {results.map((res, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200">{res.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200">
                          {res.setting}
                          {res.clamped && <span className="ml-2 text-amber-600 dark:text-amber-500 text-xs">({t('warningClamped')})</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
