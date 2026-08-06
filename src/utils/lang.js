/**
 * 读取当前 URL 上的 lang 参数。
 *
 * 语言切换走 history.replaceState（见 LanguageSelect.vue），vue-router 的 route.query
 * 不会跟着更新，所以这里直接读 window.location，保证跨页跳转时带上的是最新语言。
 *
 * @returns {string|undefined} 未指定语言时返回 undefined，router 会自动省略该参数
 */
export function currentLangParam() {
  return new URLSearchParams(window.location.search).get('lang') ?? undefined
}
