// src/i18n/index.js
import { createI18n } from 'vue-i18n'
import zh from './zh.js'
import en from './en.js'

// 从 URL 参数读取语言，默认中文
const urlLang = new URLSearchParams(window.location.search).get('lang')
const locale = urlLang === 'en' ? 'en' : 'zh'

export const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'zh',
  messages: { zh, en },
})

export default i18n
