import React, { createContext, useContext, useMemo, useState } from 'react'

type Locale = 'en' | 'ja'

type Messages = Record<string, string>

const messages: Record<Locale, Messages> = {
  en: {
    title: 'Coffee Grinder Setting Converter',
    subtitle: 'This tool matches median particle size (µm). Results are approximations.',
    fromGrinder: 'From grinder',
    toGrinder: 'To grinder',
    fromSetting: 'From setting',
    resultTitle: 'Result',
    enterPrompt: 'Select grinders and enter a valid source setting.',
    toSettingApprox: 'To setting ≈',
    medianMatch: '~ {um} µm (median match)',
    warningClamped: 'Warning: result outside target range, clamped to nearest setting.',
    invalidValue: 'Invalid value',
    errorSourceRange: 'Value {value} is out of range for {name} (allowed: {min}–{max}, step {step}).',
    errorStepAlign: 'Value must align to step {step} starting from {min}.',
    failedManifest: 'Failed to load manifest: {error}',
    searchPlaceholder: 'Search grinder...',
    noResults: 'No results',
    disclaimerTitle: 'Disclaimer',
    disclaimerText:
      'This tool provides approximate conversions between grinders based on the median particle size (µm). Coffee flavor depends heavily on the full grind size distribution, not just the median value. Results can vary due to grinder design, manufacturing tolerances, and burr wear over time. Therefore, the output should be treated only as a reference to help achieve comparable brews — it cannot guarantee identical flavor profiles.',
    langEnglish: 'English (US)',
    langJapanese: 'Japanese',
  },
  ja: {
    title: 'Coffee Grinder Setting Converter',
    subtitle: 'このツールは中央値（µm）でマッチングします。結果は概算値です。',
    fromGrinder: '変換元グラインダー',
    toGrinder: '変換先グラインダー',
    fromSetting: '変換元の設定値',
    resultTitle: '結果',
    enterPrompt: 'グラインダーを選択し、有効な変換元の設定値を入力してください。',
    toSettingApprox: '変換先の設定 ≈',
    medianMatch: '~ {um} µm（中央値をマッチ）',
    warningClamped: '警告: 変換先の範囲外のため、最も近い設定にクランプしました。',
    invalidValue: '無効な値です',
    errorSourceRange: '{name} の範囲外の値 {value} です（許容: {min}–{max}, ステップ {step}）。',
    errorStepAlign: '{min} を基準にステップ {step} に揃えてください。',
    failedManifest: 'マニフェストの読み込みに失敗しました: {error}',
    searchPlaceholder: 'グラインダーを選択…',
    noResults: '該当なし',
    disclaimerTitle: '免責事項',
    disclaimerText:
      'このツールは中央値（µm）に基づいてグラインダー間の概算変換を提供します。コーヒーの風味は中央値だけでなく粒度分布全体に強く依存します。グラインダーの設計、公差、刃の摩耗、経年劣化などにより結果は変動します。そのため、本ツールの出力は同等の抽出を目指すための参考値に留まり、同一の風味を保証するものではありません。',
    langEnglish: '英語 (米国)',
    langJapanese: '日本語',
  },
}

function format(str: string, params?: Record<string, string | number>) {
  if (!params) return str
  return str.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? ''))
}

function detectDefaultLocale(): Locale {
  const saved = localStorage.getItem('locale') as Locale | null
  if (saved === 'en' || saved === 'ja') return saved
  const nav = (navigator.language || '').toLowerCase()
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz === 'Asia/Tokyo') return 'ja'
  } catch {}
  if (nav.startsWith('ja')) return 'ja'
  return 'en'
}

const I18nCtx = createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
} | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => detectDefaultLocale())
  const setLocale = (l: Locale) => {
    setLocaleState(l)
    localStorage.setItem('locale', l)
  }
  const t = (key: string, params?: Record<string, string | number>) => {
    const table = messages[locale] || messages.en
    return format(table[key] ?? key, params)
  }
  const value = useMemo(() => ({ locale, setLocale, t }), [locale])
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nCtx)
  if (!ctx) throw new Error('I18nProvider is missing')
  return ctx
}

export type { Locale }
