// src/i18n/index.js
import { createI18n } from 'vue-i18n'
import zh from './zh.js'
import en from './en.js'
import es from './es.js'
import ja from './ja.js'

const SUPPORTED = ['zh', 'en', 'es', 'ja']

// 优先级：URL 参数 > localStorage > 浏览器语言 > 英文
const urlLang = new URLSearchParams(window.location.search).get('lang')
let locale
if (SUPPORTED.includes(urlLang)) {
  locale = urlLang
  localStorage.setItem('lang', locale)
} else {
  const savedLang = localStorage.getItem('lang')
  if (SUPPORTED.includes(savedLang)) {
    locale = savedLang
  } else {
    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase()
    if (browserLang.startsWith('zh')) locale = 'zh'
    else if (browserLang.startsWith('es')) locale = 'es'
    else if (browserLang.startsWith('ja')) locale = 'ja'
    else locale = 'en'
  }
}

export const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'en',
  messages: { zh, en, es, ja },
})

export default i18n
