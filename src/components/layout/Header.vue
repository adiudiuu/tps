<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { generateMarkdown, downloadMarkdown, buildFilename } from '../../utils/exportMd.js'
import { buildShareSummary } from '../../utils/shareText.js'
import { renderShareCardBlob, downloadBlob, copyBlobToClipboard, shareImageFilename } from '../../utils/shareImage.js'
import { UPDATED_AT_BEIJING } from '../../data/appMeta.js'
import LanguageSelect from './LanguageSelect.vue'
import { currentLangParam, langQuery } from '../../utils/lang.js'

const { t, locale } = useI18n()
const route = useRoute()

const SESSION_KEY = 'tps_estimator_query'
const LEGACY_SESSION_KEY = 'tps_calc_query'

function parseBeijingTime(input) {
  const match = input.match(/^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})$/)
  if (!match) return null
  const [, year, month, day, hour, minute] = match
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour) - 8, Number(minute), 0))
}

const updatedAtText = computed(() => {
  const sourceDate = parseBeijingTime(UPDATED_AT_BEIJING)
  if (!sourceDate) return UPDATED_AT_BEIJING
  const localeTag = locale.value === 'zh' ? 'zh-CN'
    : locale.value === 'zh-TW' ? 'zh-TW'
    : locale.value === 'es' ? 'es-ES'
    : locale.value === 'ja' ? 'ja-JP'
    : locale.value === 'ko' ? 'ko-KR'
    : locale.value === 'ru' ? 'ru-RU'
    : 'en-CA'
  const formatter = new Intl.DateTimeFormat(localeTag, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timeZoneName: 'short',
  })
  const parts = Object.fromEntries(
    formatter
      .formatToParts(sourceDate)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value])
  )
  return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute} ${parts.timeZoneName}`
})

const homeLink = computed(() => {
  if (route.path === '/') return { path: '/', query: langQuery() }
  const saved = sessionStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(LEGACY_SESSION_KEY) ?? ''
  const query = { ...Object.fromEntries(new URLSearchParams(saved)), ...langQuery() }
  const lang = currentLangParam()
  if (!lang) delete query.lang
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
const shareMenuOpen = ref(false)
const linkState = ref('idle') // 'idle' | 'copied' | 'error'
const imgState = ref('idle')  // 'idle' | 'working' | 'copied' | 'downloaded' | 'error'

// 有模型/GPU/结果上下文时才能生成分享图与成绩单文案
const hasContext = computed(() => !!(props.result && props.model && props.gpu))

// 分享文案：复用导出报告口径（runnable + 单请求 tok/s + 显存 + TTFT），无上下文退回通用文案
const shareText = computed(() =>
  buildShareSummary(props.result, props.model, props.gpu, props.quant, t)
)

function toggleShareMenu() { shareMenuOpen.value = !shareMenuOpen.value }
function closeShareMenu() { shareMenuOpen.value = false }

function isCoarsePointer() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(pointer: coarse)').matches
}

function makeShareBlob() {
  return renderShareCardBlob({
    result: props.result, model: props.model, gpu: props.gpu, quant: props.quant, t, scale: 2,
  })
}

// 移动端优先系统分享（可带分享图附件）；无能力/用户取消时回退菜单
async function tryNativeShare() {
  const url = window.location.href
  const text = shareText.value
  try {
    if (hasContext.value && navigator.canShare) {
      const blob = await makeShareBlob()
      const file = new File([blob], shareImageFilename(props.model, props.gpu), { type: 'image/png' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ title: t('nav.title'), text, url, files: [file] })
        return true
      }
    }
    if (navigator.share) {
      await navigator.share({ title: t('nav.title'), text, url })
      return true
    }
  } catch {
    // 用户取消或分享失败：回退到菜单，不视为错误
  }
  return false
}

async function onShareButton() {
  if (isCoarsePointer()) {
    const ok = await tryNativeShare()
    if (ok) return
  }
  toggleShareMenu()
}

async function copyLink() {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href)
    } else {
      // 降级方案（非 HTTPS / 旧浏览器）
      const el = document.createElement('textarea')
      el.value = window.location.href
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    linkState.value = 'copied'
  } catch {
    linkState.value = 'error'
  }
  setTimeout(() => { linkState.value = 'idle' }, 2000)
}

async function downloadShareImage() {
  if (!hasContext.value) return
  imgState.value = 'working'
  try {
    const blob = await makeShareBlob()
    downloadBlob(blob, shareImageFilename(props.model, props.gpu))
    imgState.value = 'downloaded'
  } catch {
    imgState.value = 'error'
  }
  setTimeout(() => { imgState.value = 'idle' }, 2000)
}

async function copyShareImage() {
  if (!hasContext.value) return
  imgState.value = 'working'
  try {
    const blob = await makeShareBlob()
    const ok = await copyBlobToClipboard(blob)
    if (ok) {
      imgState.value = 'copied'
    } else {
      // 剪贴板不支持图片：降级为下载
      downloadBlob(blob, shareImageFilename(props.model, props.gpu))
      imgState.value = 'downloaded'
    }
  } catch {
    imgState.value = 'error'
  }
  setTimeout(() => { imgState.value = 'idle' }, 2000)
}

// 分享到 X：复用当前可分享 URL 与成绩单文案，走 X Web Intent
function shareToX() {
  const url = window.location.href
  const intent = `https://x.com/intent/post?text=${encodeURIComponent(shareText.value)}&url=${encodeURIComponent(url)}`
  window.open(intent, '_blank', 'noopener,noreferrer')
  closeShareMenu()
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
            <span class="text-[10px] text-gray-400 leading-tight whitespace-nowrap">{{ t('nav.updated') }} {{ updatedAtText }}</span>
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
          {{ t('nav.estimator') }}
        </RouterLink>
        <RouterLink
          :to="{ path: '/solver', query: langQuery() }"
          class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
          :class="route.path === '/solver'
            ? 'text-emerald-700 bg-emerald-100 font-semibold'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
        >
          {{ t('nav.solver') }}
        </RouterLink>
        <RouterLink
          :to="{ path: '/ranking', query: langQuery() }"
          class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
          :class="route.path === '/ranking'
            ? 'text-emerald-700 bg-emerald-100 font-semibold'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
        >
          {{ t('nav.ranking') }}
        </RouterLink>
        <RouterLink
          :to="{ path: '/library', query: langQuery() }"
          class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
          :class="route.path === '/library'
            ? 'text-emerald-700 bg-emerald-100 font-semibold'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
        >
          {{ t('nav.library') }}
        </RouterLink>
        <RouterLink
          :to="{ path: '/about', query: langQuery() }"
          class="px-3 py-1.5 text-sm rounded-md transition-colors"
          :class="route.path === '/about'
            ? 'text-emerald-700 bg-emerald-100 font-semibold'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'"
        >
          {{ t('nav.about') }}
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
      <!-- 分享（聚合菜单）：复制链接 / 下载分享图 / 复制分享图 / 分享到 X；移动端优先系统分享 -->
      <div class="relative">
        <button
          @click="onShareButton"
          class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 sm:px-3 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors border border-gray-300"
          :class="shareMenuOpen ? 'bg-gray-200 text-gray-900' : ''"
          :title="t('nav.share')"
          :aria-label="t('nav.share')"
          aria-haspopup="menu"
          :aria-expanded="shareMenuOpen"
        >
          <svg viewBox="0 0 16 16" class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" aria-hidden="true">
            <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5z"/>
          </svg>
          <span class="hidden sm:inline">{{ t('nav.share') }}</span>
        </button>

        <!-- 点击遮罩关闭 -->
        <div v-if="shareMenuOpen" class="fixed inset-0 z-40" @click="closeShareMenu"></div>

        <!-- 下拉菜单 -->
        <div
          v-if="shareMenuOpen"
          class="absolute right-0 mt-2 w-56 z-50 bg-white rounded-lg border border-gray-200 shadow-lg py-1"
          role="menu"
        >
          <!-- 复制链接 -->
          <button
            @click="copyLink"
            role="menuitem"
            class="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg v-if="linkState === 'copied'" viewBox="0 0 16 16" class="w-4 h-4 flex-shrink-0 text-emerald-600" fill="currentColor" aria-hidden="true">
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
            </svg>
            <svg v-else-if="linkState === 'error'" viewBox="0 0 16 16" class="w-4 h-4 flex-shrink-0 text-red-600" fill="currentColor" aria-hidden="true">
              <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM7.5 4h1v5h-1V4zm0 6.5h1v1h-1v-1z"/>
            </svg>
            <svg v-else viewBox="0 0 16 16" class="w-4 h-4 flex-shrink-0 text-gray-500" fill="currentColor" aria-hidden="true">
              <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
              <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>
            </svg>
            <span :class="linkState === 'copied' ? 'text-emerald-600' : linkState === 'error' ? 'text-red-600' : ''">
              {{ linkState === 'copied' ? t('nav.copied') : linkState === 'error' ? t('nav.share_failed') : t('nav.copy_link') }}
            </span>
          </button>

          <!-- 下载分享图 -->
          <button
            @click="downloadShareImage"
            :disabled="!hasContext"
            role="menuitem"
            class="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg viewBox="0 0 16 16" class="w-4 h-4 flex-shrink-0 text-gray-500" fill="currentColor" aria-hidden="true">
              <path d="M8 1a.5.5 0 0 1 .5.5v7.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 .708-.708L7.5 9.293V1.5A.5.5 0 0 1 8 1zM2 13.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
            </svg>
            <span>{{ t('nav.download_image') }}</span>
          </button>

          <!-- 复制分享图 -->
          <button
            @click="copyShareImage"
            :disabled="!hasContext"
            role="menuitem"
            class="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg v-if="imgState === 'copied'" viewBox="0 0 16 16" class="w-4 h-4 flex-shrink-0 text-emerald-600" fill="currentColor" aria-hidden="true">
              <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
            </svg>
            <svg v-else viewBox="0 0 16 16" class="w-4 h-4 flex-shrink-0 text-gray-500" fill="currentColor" aria-hidden="true">
              <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
              <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
            </svg>
            <span :class="imgState === 'copied' ? 'text-emerald-600' : imgState === 'error' ? 'text-red-600' : ''">
              {{ imgState === 'copied' ? t('nav.image_copied') : imgState === 'error' ? t('nav.image_error') : t('nav.copy_image') }}
            </span>
          </button>

          <div class="my-1 border-t border-gray-100"></div>

          <!-- 分享到 X -->
          <button
            @click="shareToX"
            role="menuitem"
            class="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg viewBox="0 0 24 24" class="w-4 h-4 flex-shrink-0 text-gray-700" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>{{ t('nav.share_x') }}</span>
          </button>
        </div>
      </div>
      <RouterLink
        :to="{ path: '/about', query: langQuery() }"
        class="sm:hidden inline-flex items-center text-xs font-medium px-2 py-1.5 text-gray-500 hover:text-gray-900 transition-colors"
        :class="route.path === '/about' ? 'text-emerald-700' : ''"
      >
        {{ t('nav.about') }}
      </RouterLink>
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
      <LanguageSelect />
    </div>
  </header>
</template>
