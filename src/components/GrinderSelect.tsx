import { useEffect, useMemo, useRef, useState } from 'react'
import type { Grinder } from '../lib/types'

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
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black"
          placeholder={selectedLabel || 'Search grinder...'}
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
            className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-gray-500" aria-disabled>
                No results
              </li>
            )}
            {filtered.map((o) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                tabIndex={0}
                className="cursor-pointer px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 text-black"
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
