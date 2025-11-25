import { useMemo } from 'react'
import { useGrinders } from '../hooks/useGrinders'
import { useI18n } from '../lib/i18n'

export default function RangeView() {
  const { t } = useI18n()
  const { grinders, loading, error } = useGrinders()

  const ranges = useMemo(() => {
    if (!grinders.length) return []
    return grinders.map(({ grinder }) => {
      const values = Object.values(grinder.mapping)
      if (!values.length) return { name: grinder.display_name, min: 0, max: 0 }
      return {
        name: grinder.display_name,
        min: Math.min(...values),
        max: Math.max(...values),
      }
    }).sort((a, b) => a.min - b.min)
  }, [grinders])

  const { globalMin, globalMax } = useMemo(() => {
    if (!ranges.length) return { globalMin: 0, globalMax: 1000 }
    const mins = ranges.map(r => r.min)
    const maxs = ranges.map(r => r.max)
    return {
      globalMin: Math.min(...mins),
      globalMax: Math.max(...maxs),
    }
  }, [ranges])

  if (loading) return <div className="p-4 text-center text-gray-500 dark:text-gray-400">{t('loading')}</div>
  if (error) return <div className="p-4 text-center text-red-500">{t('failedManifest', { error })}</div>

  // Round to nearest 100 for chart scale
  const chartMin = Math.floor(globalMin / 100) * 100
  const chartMax = Math.ceil(globalMax / 100) * 100
  const totalRange = chartMax - chartMin || 1 // avoid division by zero

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
      <div className="space-y-6">
        {ranges.map((range) => {
          const left = ((range.min - chartMin) / totalRange) * 100
          const width = ((range.max - range.min) / totalRange) * 100
          
          return (
            <div key={range.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-200">{range.name}</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {Math.round(range.min)} - {Math.round(range.max)} µm
                </span>
              </div>
              <div className="h-4 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden relative">
                <div
                  className="absolute top-0 bottom-0 bg-blue-500 dark:bg-blue-600 rounded-full opacity-80 hover:opacity-100 transition-opacity"
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              </div>
            </div>
          )
        })}
        
        {/* Scale */}
        <div className="relative h-6 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-neutral-700 mt-4 pt-2">
           <div className="flex justify-between">
             <span>{chartMin} µm</span>
             <span>{chartMax} µm</span>
           </div>
           {/* Intermediate ticks could be added here if needed */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 pt-2">
             {Math.round((chartMin + chartMax) / 2)} µm
           </div>
        </div>
      </div>
    </div>
  )
}
