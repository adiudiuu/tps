// src/i18n/index.js
import { createI18n } from 'vue-i18n'
import zh from './zh.js'
import en from './en.js'

// 优先级：URL 参数 > localStorage > 浏览器语言 > 英文
const urlLang = new URLSearchParams(window.location.search).get('lang')
let locale
if (urlLang === 'en' || urlLang === 'zh') {
  locale = urlLang
  localStorage.setItem('lang', locale)
} else {
  const savedLang = localStorage.getItem('lang')
  if (savedLang === 'en' || savedLang === 'zh') {
    locale = savedLang
  } else {
    const browserLang = navigator.language || navigator.userLanguage || ''
    locale = browserLang.toLowerCase().startsWith('zh') ? 'zh' : 'en'
  }
}

export const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'en',
  messages: { zh, en },
})

export default i18n
