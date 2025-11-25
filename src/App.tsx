import { useState } from 'react'
import { I18nProvider, useI18n } from './lib/i18n'
import ReactFlagsSelect from 'react-flags-select'
import { ThemeToggle } from './components/ThemeToggle'
import ConverterView from './components/ConverterView'
import TableView from './components/TableView'
import RangeView from './components/RangeView'

function AppInner() {
  const { t, locale, setLocale } = useI18n()
  const [activeTab, setActiveTab] = useState<'converter' | 'table' | 'range'>('converter')

  return (
    <div className="min-h-screen text-gray-900 dark:text-white dark:bg-neutral-900">
      <header className="bg-white border-b border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
        <div className="mx-auto max-w-4xl px-4 py-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{t('title')}</h1>
            <p className="text-sm text-gray-600 mt-1 dark:text-neutral-400">{t('subtitle')}</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
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
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4 space-y-6">
        <div className="border-b border-gray-200 dark:border-neutral-700">
          <nav className="-mb-px flex gap-x-8" aria-label="Tabs">
            <button
              type="button"
              className={`py-4 px-1 inline-flex items-center gap-x-2 border-b-2 text-sm font-medium text-center whitespace-nowrap ${
                activeTab === 'converter'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-500'
              }`}
              onClick={() => setActiveTab('converter')}
              aria-current={activeTab === 'converter' ? 'page' : undefined}
            >
              {t('tabConverter')}
            </button>
            <button
              type="button"
              className={`py-4 px-1 inline-flex items-center gap-x-2 border-b-2 text-sm font-medium text-center whitespace-nowrap ${
                activeTab === 'table'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-500'
              }`}
              onClick={() => setActiveTab('table')}
              aria-current={activeTab === 'table' ? 'page' : undefined}
            >
              {t('tabTable')}
            </button>
            <button
              type="button"
              className={`py-4 px-1 inline-flex items-center gap-x-2 border-b-2 text-sm font-medium text-center whitespace-nowrap ${
                activeTab === 'range'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-500'
              }`}
              onClick={() => setActiveTab('range')}
              aria-current={activeTab === 'range' ? 'page' : undefined}
            >
              {t('tabRange')}
            </button>
          </nav>
        </div>

        <div className="mt-3">
          {activeTab === 'converter' && <ConverterView />}
          {activeTab === 'table' && <TableView />}
          {activeTab === 'range' && <RangeView />}
        </div>

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
