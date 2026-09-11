/**
 * Cloudflare Pages Function: serve locale-specific HTML (with crawler-visible
 * og:image / twitter:image) when the request has ?lang=.
 *
 * Why a Function (not _redirects / SPA runtime meta):
 * - i18n is query-based (?lang=en), not path-based. CF Pages _redirects cannot
 *   match query parameters.
 * - X/Twitter crawlers do not execute JS, so applyPageSeo() cannot change cards.
 * - Share URLs include extra query params (model, gpu, …); the Function still
 *   sees lang= and returns /og/{locale}.html generated at build time.
 *
 * Static PNG covers live at /og-cover.{locale}.png (and /og-cover.png fallback).
 * Those paths are excluded from Functions via public/_routes.json so crawlers
 * get image/png 200 without HTML rewriting.
 */
const OG_LOCALES = ['zh', 'zh-TW', 'en', 'es', 'ja', 'ko', 'ru']

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

function resolveLocale(raw) {
    if (!raw) return null
    const lower = String(raw).toLowerCase().replace(/_/g, '-')
    if (ALIASES[lower]) return ALIASES[lower]
    if (OG_LOCALES.includes(raw)) return raw
    if (lower.startsWith('zh-hant') || lower.startsWith('zh-tw') || lower.startsWith('zh-hk') || lower.startsWith('zh-mo')) return 'zh-TW'
    if (lower.startsWith('zh')) return 'zh'
    if (lower.startsWith('ru')) return 'ru'
    if (lower.startsWith('ko')) return 'ko'
    if (lower.startsWith('ja')) return 'ja'
    if (lower.startsWith('es')) return 'es'
    if (lower.startsWith('en')) return 'en'
    return null
}

function isDocumentPath(pathname) {
    if (!pathname || pathname === '/') return true
    const last = pathname.split('/').pop() || ''
    return !last.includes('.')
}

export async function onRequest(context) {
    const url = new URL(context.request.url)
    if (!isDocumentPath(url.pathname)) return context.next()

    const locale = resolveLocale(url.searchParams.get('lang')) || 'zh'
    if (locale === 'zh') return context.next()

    const assets = context.env && context.env.ASSETS
    if (!assets || typeof assets.fetch !== 'function') return context.next()

    const ogUrl = new URL(`/og/${encodeURIComponent(locale)}.html`, url.origin)
    const assetRes = await assets.fetch(new Request(ogUrl, { method: 'GET' }))
    if (!assetRes.ok) return context.next()

    const html = await assetRes.text()
    const headers = new Headers(assetRes.headers)
    headers.set('content-type', 'text/html; charset=utf-8')
    return new Response(html, { status: 200, headers })
}
