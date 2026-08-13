import { resolveLocale } from '../i18n/locales.js'

/**
 * 读取当前 URL 上的 lang 参数。
 *
 * 语言切换走 history.replaceState（见 LanguageSelect.vue），vue-router 的 route.query
 * 不会跟着更新，所以这里直接读 window.location，保证跨页跳转时带上的是最新语言。
 *
 * @returns {string|undefined} 未指定语言或简体中文时返回 undefined，router 会自动省略该参数
 */
export function currentLangParam() {
  const raw = new URLSearchParams(window.location.search).get('lang')
  const resolved = resolveLocale(raw)
  if (!resolved || resolved === 'zh') return undefined
  return resolved
}

/** Query object for RouterLink so ?lang= survives in-app navigation. */
export function langQuery() {
  const lang = currentLangParam()
  return lang ? { lang } : {}
}
