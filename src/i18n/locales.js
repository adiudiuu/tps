/** Canonical UI language list. Order is fixed — do not sort alphabetically.
 *  Insert new languages between ru and ko. ko is always second-last; ja is always last.
 */
export const LANGS = [
  { code: 'zh', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'es', label: 'Español' },
  { code: 'ko', label: '한국어' },
  { code: 'ja', label: '日本語' },
]

export const SUPPORTED = LANGS.map(l => l.code)

const ALIASES = {
  'zh-hant': 'zh-TW',
  'zh-tw': 'zh-TW',
  'zh-hk': 'zh-TW',
  'zh-mo': 'zh-TW',
  'zh-cn': 'zh',
  'zh-hans': 'zh',
  'zh-sg': 'zh',
  'ko-kr': 'ko',
  'ja-jp': 'ja',
  'ru-ru': 'ru',
  'en-us': 'en',
  'en-gb': 'en',
  'es-es': 'es',
  'es-mx': 'es',
}

/** Map URL / browser tag to a supported locale code, or null. */
export function resolveLocale(raw) {
  if (!raw) return null
  const lower = String(raw).toLowerCase().replace(/_/g, '-')
  if (ALIASES[lower]) return ALIASES[lower]
  if (SUPPORTED.includes(raw)) return raw
  if (lower.startsWith('zh-hant') || lower.startsWith('zh-tw') || lower.startsWith('zh-hk') || lower.startsWith('zh-mo')) return 'zh-TW'
  if (lower.startsWith('zh')) return 'zh'
  if (lower.startsWith('ru')) return 'ru'
  if (lower.startsWith('ko')) return 'ko'
  if (lower.startsWith('ja')) return 'ja'
  if (lower.startsWith('es')) return 'es'
  if (lower.startsWith('en')) return 'en'
  return null
}

export function detectBrowserLocale() {
  const langs = []
  if (typeof navigator !== 'undefined') {
    if (Array.isArray(navigator.languages)) langs.push(...navigator.languages)
    if (navigator.language) langs.push(navigator.language)
    if (navigator.userLanguage) langs.push(navigator.userLanguage)
  }
  for (const tag of langs) {
    const resolved = resolveLocale(tag)
    if (resolved) return resolved
  }
  return 'en'
}
