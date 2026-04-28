<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { generateMarkdown, downloadMarkdown, buildFilename } from '../../utils/exportMd.js'

const { t, locale } = useI18n()
const props = defineProps({
  result: Object, model: Object,
  gpu: Object, gpuCount: Number, interconnect: Object,
  quant: Object, framework: Object,
  ctx: Number, batch: Number, promptLen: Number, outputLen: Number,
  flashAttention: Boolean, kvCacheQuant: Object,
  prefixCacheHit: Number, cpuOffload: Boolean, pcieBw: Object,
})
const copied = ref(false)

function toggleLang() {
  const newLang = locale.value === 'zh' ? 'en' : 'zh'
  locale.value = newLang
  const url = new URL(window.location.href)
  if (newLang === 'en') {
    url.searchParams.set('lang', 'en')
  } else {
    url.searchParams.delete('lang')
  }
  window.history.replaceState({}, '', url.toString())
}

function shareUrl() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}

function exportMarkdown() {
  if (!props.result || !props.model) return
  const content = generateMarkdown({
    gpu: props.gpu, gpuCount: props.gpuCount, interconnect: props.interconnect,
    model: props.model, quant: props.quant, framework: props.framework,
    ctx: props.ctx, batch: props.batch, promptLen: props.promptLen, outputLen: props.outputLen,
    flashAttention: props.flashAttention, kvCacheQuant: props.kvCacheQuant,
    prefixCacheHit: props.prefixCacheHit, cpuOffload: props.cpuOffload, pcieBw: props.pcieBw,
    result: props.result, t, locale: locale.value,
  })
  downloadMarkdown(content, buildFilename(props.model, props.gpu, props.quant))
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between gap-2">
    <div class="flex items-center gap-2 min-w-0">
      <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm flex-shrink-0">
        <svg viewBox="0 0 64 64" class="w-4 h-4 sm:w-5 sm:h-5" fill="none" aria-hidden="true">
          <path d="M18 42L27 33L34 37L46 23" stroke="url(#topbar-accent)" stroke-linecap="round" stroke-linejoin="round" stroke-width="5" />
          <path d="M23 19H41" stroke="#e2e8f0" stroke-linecap="round" stroke-width="5" />
          <path d="M32 19V45" stroke="#e2e8f0" stroke-linecap="round" stroke-width="5" />
          <circle cx="46" cy="23" r="4" fill="#f8fafc" />
          <defs>
            <linearGradient id="topbar-accent" x1="16" y1="18" x2="50" y2="46" gradientUnits="userSpaceOnUse">
              <stop stop-color="#38bdf8" />
              <stop offset="1" stop-color="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span class="text-sm sm:text-lg font-semibold text-gray-900 tracking-tight truncate">{{ t('nav.title') }}</span>
      <span class="hidden md:inline text-xs text-gray-400 border-l border-gray-200 pl-3 whitespace-nowrap">
        {{ t('nav.updated') }} 2026-04-28 10:00
      </span>
    </div>
    <div class="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
      <!-- 分享 -->
      <button
        @click="shareUrl"
        class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 sm:px-3 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors border border-gray-300"
        :title="t('nav.share')"
      >
        <svg v-if="!copied" viewBox="0 0 16 16" class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" aria-hidden="true">
          <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/>
        </svg>
        <svg v-else viewBox="0 0 16 16" class="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="currentColor" aria-hidden="true">
          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
        </svg>
        <span class="hidden sm:inline" :class="copied ? 'text-emerald-600' : ''">{{ copied ? t('nav.copied') : t('nav.share') }}</span>
      </button>
      <!-- 导出报告 -->
      <button
        v-if="result"
        @click="exportMarkdown"
        class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 sm:px-3 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors border border-gray-300"
        :title="t('nav.export')"
      >
        <svg viewBox="0 0 16 16" class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" aria-hidden="true">
          <path d="M8 1a.5.5 0 0 1 .5.5v7.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 .708-.708L7.5 9.293V1.5A.5.5 0 0 1 8 1zM2 13.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
        </svg>
        <span class="hidden sm:inline">{{ t('nav.export') }}</span>
      </button>
      <button
        @click="toggleLang"
        class="text-xs font-medium px-2 py-1.5 sm:px-3 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 whitespace-nowrap"
      >
        {{ locale === 'zh' ? 'EN' : '中文' }}
      </button>
    </div>
  </header>
</template>
