/** Multilingual SEO / GEO helpers: title, meta, hreflang, JSON-LD. */

import { ALL_MODELS } from '../data/models/index.js'
import { GPU_LIST } from '../data/gpus/index.js'

export const SITE_ORIGIN = 'https://tps.bunai.com'
export const SEO_LOCALES = ['zh', 'en', 'es', 'ja']

const HTML_LANG = { zh: 'zh-CN', en: 'en', es: 'es', ja: 'ja' }
const OG_LOCALE = { zh: 'zh_CN', en: 'en_US', es: 'es_ES', ja: 'ja_JP' }
const HREFLANG = { zh: 'zh-CN', en: 'en', es: 'es', ja: 'ja' }

function setMeta(attr, key, content) {
  if (content == null || content === '') return
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href, extra = {}) {
  const selector = Object.entries({ rel, ...extra })
    .map(([k, v]) => `[${k}="${v}"]`)
    .join('')
  let el = document.head.querySelector(`link${selector}`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    for (const [k, v] of Object.entries(extra)) el.setAttribute(k, v)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/** Build absolute URL for a locale (zh omits ?lang= to match LanguageSelect). */
export function localeUrl(path, locale) {
  const cleanPath = !path || path === '/' ? '/' : path
  const url = new URL(cleanPath, SITE_ORIGIN)
  url.search = ''
  if (locale && locale !== 'zh') url.searchParams.set('lang', locale)
  return url.toString()
}

function syncHreflang(path) {
  // Remove previous alternate hreflang links we manage
  document.head.querySelectorAll('link[data-seo-hreflang]').forEach(el => el.remove())

  for (const loc of SEO_LOCALES) {
    const link = document.createElement('link')
    link.setAttribute('rel', 'alternate')
    link.setAttribute('hreflang', HREFLANG[loc])
    link.setAttribute('href', localeUrl(path, loc))
    link.setAttribute('data-seo-hreflang', '1')
    document.head.appendChild(link)
  }
  const def = document.createElement('link')
  def.setAttribute('rel', 'alternate')
  def.setAttribute('hreflang', 'x-default')
  def.setAttribute('href', localeUrl(path, 'zh'))
  def.setAttribute('data-seo-hreflang', '1')
  document.head.appendChild(def)
}

function seoVars(t) {
  return {
    models: ALL_MODELS.length,
    gpus: GPU_LIST.length,
    highlightModels: t('seo.highlights.models'),
    highlightGpus: t('seo.highlights.gpus'),
    updated: t('seo.highlights.updated'),
  }
}

function syncJsonLd(t, locale) {
  const vars = seoVars(t)
  const features = [
    t('seo.jsonLd.features.tps'),
    t('seo.jsonLd.features.vram'),
    t('seo.jsonLd.features.latency'),
    t('seo.jsonLd.features.roofline'),
    t('seo.jsonLd.features.multiGpu'),
    t('seo.jsonLd.features.frameworks'),
    t('seo.jsonLd.features.quants'),
    t('seo.jsonLd.features.gpuCount', vars),
    t('seo.jsonLd.features.modelCount', vars),
  ]

  const faqKeys = ['tps', 'vram', 'gpuSize', 'accuracy', 'frameworks']
  const mainEntity = faqKeys.map(k => ({
    '@type': 'Question',
    name: t(`seo.jsonLd.faq.${k}.q`),
    acceptedAnswer: {
      '@type': 'Answer',
      text: t(`seo.jsonLd.faq.${k}.a`, vars),
    },
  }))

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        url: SITE_ORIGIN + '/',
        name: t('seo.siteName'),
        description: t('seo.jsonLd.websiteDescription', vars),
        inLanguage: Object.values(HTML_LANG),
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_ORIGIN}/library?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_ORIGIN}/#app`,
        url: SITE_ORIGIN + '/',
        name: t('seo.siteName'),
        description: t('seo.jsonLd.appDescription', vars),
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web',
        browserRequirements: 'requires JavaScript',
        inLanguage: HTML_LANG[locale] || 'en',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: locale === 'zh' ? 'CNY' : 'USD',
        },
        featureList: features,
        keywords: t('seo.keywords'),
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_ORIGIN}/#faq`,
        inLanguage: HTML_LANG[locale] || 'en',
        mainEntity,
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_ORIGIN}/#organization`,
        name: t('seo.siteName'),
        url: SITE_ORIGIN + '/',
        description: t('seo.jsonLd.orgDescription'),
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_ORIGIN}/favicon.svg`,
          width: 512,
          height: 512,
        },
        sameAs: ['https://github.com/adiudiuu/tps'],
      },
    ],
  }

  let el = document.getElementById('seo-jsonld')
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = 'seo-jsonld'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(graph)
}

/**
 * @param {string} pageKey - estimator | ranking | library | solver
 * @param {(key: string, values?: Record<string, unknown>) => string} t
 * @param {string} locale - zh | en | es | ja
 * @param {string} [path] - route path
 */
export function applyPageSeo(pageKey, t, locale = 'zh', path = '/') {
  const key = ['estimator', 'ranking', 'library', 'solver'].includes(pageKey)
    ? pageKey
    : 'estimator'

  const vars = seoVars(t)
  const title = t(`seo.pages.${key}.title`)
  const description = t(`seo.pages.${key}.description`, vars)
  const keywords = t('seo.keywords')
  const pageUrl = localeUrl(path, locale)

  document.documentElement.lang = HTML_LANG[locale] || 'en'
  document.title = title

  setMeta('name', 'description', description)
  setMeta('name', 'keywords', keywords)
  setMeta('property', 'og:type', 'website')
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', description)
  setMeta('property', 'og:url', pageUrl)
  setMeta('property', 'og:locale', OG_LOCALE[locale] || 'en_US')
  setMeta('name', 'twitter:card', 'summary')
  setMeta('name', 'twitter:title', title)
  setMeta('name', 'twitter:description', description)
  setMeta('name', 'apple-mobile-web-app-title', t('seo.pwa.shortName'))

  setLink('canonical', pageUrl)
  syncHreflang(path)
  syncJsonLd(t, locale)
}
