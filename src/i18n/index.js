// src/i18n/index.js
import { createI18n } from 'vue-i18n'
import zh from './zh.js'
import zhTW from './zh-TW.js'
import en from './en.js'
import ru from './ru.js'
import es from './es.js'
import ko from './ko.js'
import ja from './ja.js'
import { SUPPORTED, resolveLocale, detectBrowserLocale } from './locales.js'

const urlLang = new URLSearchParams(window.location.search).get('lang')
let locale = resolveLocale(urlLang)
if (locale) {
  localStorage.setItem('lang', locale)
} else {
  const savedLang = resolveLocale(localStorage.getItem('lang'))
  if (savedLang && SUPPORTED.includes(savedLang)) {
    locale = savedLang
  } else {
    locale = detectBrowserLocale()
  }
}

export const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'en',
  messages: {
    zh,
    'zh-TW': zhTW,
    en,
    ru,
    es,
    ko,
    ja,
  },
})

export default i18n
