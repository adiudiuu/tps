/** Shared OG / locale HTML helpers (Node + Vite build). */

import { ALL_MODELS } from '../src/data/models/index.js'
import { GPU_LIST } from '../src/data/gpus/index.js'
import {
    OG_LOCALES,
    HTML_LANG,
    OG_LOCALE,
    localeUrl,
    ogCoverUrl,
} from '../src/data/site.js'
import zh from '../src/i18n/zh.js'
import zhTW from '../src/i18n/zh-TW.js'
import en from '../src/i18n/en.js'
import es from '../src/i18n/es.js'
import ja from '../src/i18n/ja.js'
import ko from '../src/i18n/ko.js'
import ru from '../src/i18n/ru.js'

export const MESSAGES = {
    zh,
    'zh-TW': zhTW,
    en,
    es,
    ja,
    ko,
    ru,
}

export { OG_LOCALES }

function lookup(messages, key) {
    return key.split('.').reduce((o, k) => o?.[k], messages)
}

export function interpolate(str, vars = {}) {
    return String(str).replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : ''))
}

export function seoVars(messages) {
    return {
        models: ALL_MODELS.length,
        gpus: GPU_LIST.length,
        highlightModels: messages.seo.highlights.models,
        highlightGpus: messages.seo.highlights.gpus,
        updated: messages.seo.highlights.updated,
    }
}

export function pageSeo(locale, pageKey = 'estimator', path = '/') {
    const messages = MESSAGES[locale] || MESSAGES.en
    const vars = seoVars(messages)
    const title = interpolate(lookup(messages, `seo.pages.${pageKey}.title`), vars)
    const description = interpolate(lookup(messages, `seo.pages.${pageKey}.description`), vars)
    return {
        locale,
        htmlLang: HTML_LANG[locale] || 'en',
        ogLocale: OG_LOCALE[locale] || 'en_US',
        title,
        description,
        keywords: lookup(messages, 'seo.keywords') || '',
        pageUrl: localeUrl(path, locale),
        ogImage: ogCoverUrl(locale),
        ogImageAlt: title,
        cover: messages.seo.ogCover,
        models: vars.models,
        gpus: vars.gpus,
        langCount: OG_LOCALES.length,
    }
}

function escAttr(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
}

function escText(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
}

function setMetaBy(html, attr, key, content) {
    const re = new RegExp(`(<meta\\s[^>]*${attr}="${key}"[^>]*content=")[^"]*(")`, 'i')
    if (re.test(html)) return html.replace(re, `$1${escAttr(content)}$2`)
    return html
}

function setLinkHref(html, rel, href) {
    const re = new RegExp(`(<link\\s[^>]*rel="${rel}"[^>]*href=")[^"]*(")`, 'i')
    if (re.test(html)) return html.replace(re, `$1${escAttr(href)}$2`)
    return html
}

/** Rewrite crawler-visible tags in a built index.html for one locale. */
export function patchHtmlForLocale(html, locale) {
    const seo = pageSeo(locale)
    let out = html
    out = out.replace(/<html\s+lang="[^"]*"/, `<html lang="${seo.htmlLang}"`)
    out = out.replace(/<title>[^<]*<\/title>/, `<title>${escText(seo.title)}</title>`)
    out = setMetaBy(out, 'name', 'description', seo.description)
    out = setMetaBy(out, 'name', 'keywords', seo.keywords)
    out = setLinkHref(out, 'canonical', seo.pageUrl)
    out = setMetaBy(out, 'property', 'og:title', seo.title)
    out = setMetaBy(out, 'property', 'og:description', seo.description)
    out = setMetaBy(out, 'property', 'og:url', seo.pageUrl)
    out = setMetaBy(out, 'property', 'og:image', seo.ogImage)
    out = setMetaBy(out, 'property', 'og:image:alt', seo.ogImageAlt)
    out = setMetaBy(out, 'property', 'og:locale', seo.ogLocale)
    out = out.replace(/\n\s*<meta property="og:locale:alternate"[^>]*>/g, '')
    const altBlock = OG_LOCALES
        .filter((loc) => loc !== locale)
        .map((loc) => `    <meta property="og:locale:alternate" content="${OG_LOCALE[loc]}" data-seo-og-alt="1" />`)
        .join('\n')
    out = out.replace(
        /(<meta property="og:locale" content="[^"]*"\s*\/>)/,
        `$1\n${altBlock}`,
    )
    out = setMetaBy(out, 'name', 'twitter:title', seo.title)
    out = setMetaBy(out, 'name', 'twitter:description', seo.description)
    out = setMetaBy(out, 'name', 'twitter:image', seo.ogImage)
    out = setMetaBy(out, 'name', 'twitter:card', 'summary_large_image')
    return out
}

export function localeOgHtmlPlugin() {
    return {
        name: 'locale-og-html',
        apply: 'build',
        async closeBundle() {
            const { mkdir, readFile, writeFile } = await import('node:fs/promises')
            const { dirname, join } = await import('node:path')
            const { fileURLToPath } = await import('node:url')
            const root = join(dirname(fileURLToPath(import.meta.url)), '..')
            const dist = join(root, 'dist')
            const indexPath = join(dist, 'index.html')
            let index
            try {
                index = await readFile(indexPath, 'utf8')
            } catch {
                return
            }
            await mkdir(join(dist, 'og'), { recursive: true })
            for (const locale of OG_LOCALES) {
                const html = patchHtmlForLocale(index, locale)
                await writeFile(join(dist, 'og', `${locale}.html`), html)
            }
        },
    }
}
