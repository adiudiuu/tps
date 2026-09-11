/** Canonical public origin for absolute SEO / OG / share URLs.
 *
 * Live site, README, and AGENTS.md use tps.bunai.cc.
 * tps.bunai.com does not resolve (NXDOMAIN); do not use it in crawler-facing tags.
 */
export const SITE_ORIGIN = 'https://tps.bunai.cc'
export const SITE_HOST = 'tps.bunai.cc'

/** UI locale codes; must match src/i18n/ and public/llms*.txt naming. */
export const OG_LOCALES = ['zh', 'zh-TW', 'en', 'es', 'ja', 'ko', 'ru']

export const HTML_LANG = {
    zh: 'zh-CN',
    'zh-TW': 'zh-TW',
    en: 'en',
    ru: 'ru',
    es: 'es',
    ko: 'ko',
    ja: 'ja',
}

export const OG_LOCALE = {
    zh: 'zh_CN',
    'zh-TW': 'zh_TW',
    en: 'en_US',
    ru: 'ru_RU',
    es: 'es_ES',
    ko: 'ko_KR',
    ja: 'ja_JP',
}

export const HREFLANG = {
    zh: 'zh-CN',
    'zh-TW': 'zh-Hant',
    en: 'en',
    ru: 'ru',
    es: 'es',
    ko: 'ko',
    ja: 'ja',
}

export function ogCoverFile(locale) {
    if (locale && OG_LOCALES.includes(locale)) return `og-cover.${locale}.png`
    return 'og-cover.png'
}

export function ogCoverUrl(locale) {
    return `${SITE_ORIGIN}/${ogCoverFile(locale)}`
}

/** Build absolute URL for a locale (zh omits ?lang= to match LanguageSelect). */
export function localeUrl(path, locale) {
    const cleanPath = !path || path === '/' ? '/' : path
    const url = new URL(cleanPath, SITE_ORIGIN)
    url.search = ''
    if (locale && locale !== 'zh') url.searchParams.set('lang', locale)
    return url.toString()
}
