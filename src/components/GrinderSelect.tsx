import { useEffect, useMemo, useRef, useState } from 'react'
import type { Grinder } from '../lib/types'
import { useI18n } from '../lib/i18n'

interface Option {
  label: string
  value: string // fileName
}

export function GrinderSelect({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string
  label: string
  options: Option[]
  value: string | null
  onChange: (value: string | null) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const listRef = useRef<HTMLUListElement>(null)
  const { t } = useI18n()

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    function onDocKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onDocKey)
    return () => document.removeEventListener('keydown', onDocKey)
  }, [open])

  const selectedLabel = options.find((o) => o.value === value)?.label ?? ''

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium mb-2 dark:text-white">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
          placeholder={selectedLabel || t('searchPlaceholder')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
        />
        {open && (
          <ul
            id={`${id}-list`}
            role="listbox"
            ref={listRef}
            className="absolute z-50 mt-2 w-full max-h-72 p-1 space-y-0.5 bg-white border border-gray-200 rounded-lg overflow-hidden overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 dark:bg-neutral-900 dark:border-neutral-700 shadow-lg"
          >
            {filtered.length === 0 && (
              <li className="py-2 px-4 w-full text-sm text-gray-500 dark:text-neutral-500" aria-disabled>
                {t('noResults')}
              </li>
            )}
            {filtered.map((o) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                tabIndex={0}
                className={`py-2 px-4 w-full text-sm text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-800 ${
                  o.value === value ? 'bg-gray-100 dark:bg-neutral-800' : ''
                }`}
                onClick={() => {
                  onChange(o.value)
                  setQuery('')
                  setOpen(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onChange(o.value)
                    setQuery('')
                    setOpen(false)
                  }
                }}
              >
                {o.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default GrinderSelect
