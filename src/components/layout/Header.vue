<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { generateMarkdown, downloadMarkdown, buildFilename } from '../../utils/exportMd.js'

const { t, locale } = useI18n()
const route = useRoute()

const SESSION_KEY = 'tps_calc_query'
const homeLink = computed(() => {
  if (route.path === '/') return '/'
  const saved = sessionStorage.getItem(SESSION_KEY) ?? ''
  const query = Object.fromEntries(new URLSearchParams(saved))
  return { path: '/', query }
})

const props = defineProps({
  result: Object, model: Object,
  gpu: Object, gpuCount: Number, interconnect: Object,
  quant: Object, framework: Object,
  ctx: Number, batch: Number, promptLen: Number, outputLen: Number,
  flashAttention: Boolean, kvCacheQuant: Object,
  prefixCacheHit: Number, cpuOffload: Boolean, pcieBw: Object,
})

const githubUrl = 'https://github.com/adiudiuu/tps'
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
  <header class="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between gap-4">
    <div class="flex items-center gap-4 min-w-0">
      <div class="flex items-center gap-2 flex-shrink-0">
        <RouterLink :to="homeLink" class="flex items-center gap-2">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
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
          <div class="flex flex-col">
            <span class="text-sm sm:text-base font-semibold text-gray-900 tracking-tight leading-tight">{{ t('nav.title') }}</span>
            <span class="text-[10px] text-gray-400 leading-tight whitespace-nowrap">{{ t('nav.updated') }} 2026/04/30 15:00</span>
          </div>
        </RouterLink>
      </div>

      <!-- 导航菜单（桌面） -->
      <nav class="hidden sm:flex items-center gap-1 border-l border-gray-200 pl-4">
        <RouterLink
          :to="homeLink"
          class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
          :class="route.path === '/'
            ? 'text-emerald-700 bg-emerald-100 font-semibold'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
        >
          {{ t('nav.calc') }}
        </RouterLink>
        <RouterLink
          to="/ranking"
          class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
          :class="route.path === '/ranking'
            ? 'text-emerald-700 bg-emerald-100 font-semibold'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
        >
          {{ t('nav.ranking') }}
        </RouterLink>
        <RouterLink
          to="/library"
          class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
          :class="route.path === '/library'
            ? 'text-emerald-700 bg-emerald-100 font-semibold'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
        >
          {{ t('nav.supported') }}
        </RouterLink>
      </nav>
    </div>
    <div class="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
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
      <a
        :href="githubUrl"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 sm:px-3 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors border border-gray-300"
        title="GitHub"
      >
        <svg viewBox="0 0 24 24" class="w-4 h-4 flex-shrink-0" fill="currentColor" aria-hidden="true">
          <path d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.1 3.3 9.42 7.87 10.95.58.1.79-.25.79-.56v-2.15c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.72-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.19 1.19a11.02 11.02 0 0 1 5.8 0c2.22-1.5 3.19-1.2 3.19-1.2.64 1.6.24 2.78.12 3.07.74.8 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.08.78 2.18v3.23c0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12C23.5 5.66 18.35.5 12 .5Z"/>
        </svg>
        <span class="hidden sm:inline">GitHub</span>
      </a>
      <button
        @click="toggleLang"
        class="text-xs font-medium px-2 py-1.5 sm:px-3 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 whitespace-nowrap"
      >
        {{ locale === 'zh' ? 'EN' : '中文' }}
      </button>
    </div>
  </header>
</template>
