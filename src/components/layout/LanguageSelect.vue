<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const LANGS = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'ja', label: '日本語' },
]

const open = ref(false)
const rootRef = ref(null)
const triggerRef = ref(null)
const menuRef = ref(null)
const activeIndex = ref(0)

const currentLabel = computed(() =>
  LANGS.find(l => l.code === locale.value)?.label ?? 'English'
)

function applyLang(code) {
  locale.value = code
  localStorage.setItem('lang', code)
  const url = new URL(window.location.href)
  if (code === 'zh') {
    url.searchParams.delete('lang')
  } else {
    url.searchParams.set('lang', code)
  }
  window.history.replaceState({}, '', url.toString())
}

function close(focusTrigger = false) {
  if (!open.value) return
  open.value = false
  if (focusTrigger) triggerRef.value?.focus()
}

function openMenu() {
  open.value = true
  activeIndex.value = Math.max(0, LANGS.findIndex(l => l.code === locale.value))
  nextTick(() => focusItem(activeIndex.value))
}

function toggle() {
  if (open.value) close()
  else openMenu()
}

function selectLang(code) {
  applyLang(code)
  close(true)
}

function focusItem(index) {
  const len = LANGS.length
  const next = ((index % len) + len) % len
  activeIndex.value = next
  const items = menuRef.value?.querySelectorAll('[role="menuitemradio"]')
  items?.[next]?.focus()
}

function onTriggerKeydown(e) {
  switch (e.key) {
    case 'ArrowDown':
    case 'ArrowUp':
    case 'Enter':
    case ' ':
      e.preventDefault()
      if (!open.value) openMenu()
      else if (e.key === 'ArrowDown') focusItem(activeIndex.value + 1)
      else if (e.key === 'ArrowUp') focusItem(activeIndex.value - 1)
      break
    case 'Escape':
      if (open.value) {
        e.preventDefault()
        close()
      }
      break
  }
}

function onMenuKeydown(e) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      focusItem(activeIndex.value + 1)
      break
    case 'ArrowUp':
      e.preventDefault()
      focusItem(activeIndex.value - 1)
      break
    case 'Home':
      e.preventDefault()
      focusItem(0)
      break
    case 'End':
      e.preventDefault()
      focusItem(LANGS.length - 1)
      break
    case 'Escape':
      e.preventDefault()
      close(true)
      break
    case 'Tab':
      close()
      break
    case 'Enter':
    case ' ':
      e.preventDefault()
      selectLang(LANGS[activeIndex.value].code)
      break
  }
}

function onPointerDownOutside(e) {
  if (!rootRef.value?.contains(e.target)) close()
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDownOutside)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', onPointerDownOutside)
})
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      ref="triggerRef"
      type="button"
      class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 sm:px-3 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 whitespace-nowrap"
      :aria-label="t('nav.language')"
      aria-haspopup="menu"
      :aria-expanded="open"
      :title="t('nav.language')"
      @click="toggle"
      @keydown="onTriggerKeydown"
    >
      <svg viewBox="0 0 16 16" class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" aria-hidden="true">
        <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653a12.5 12.5 0 0 0 .338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.174.324.33.682.468 1.068H11.91a9.27 9.27 0 0 0-.64-1.539 6.688 6.688 0 0 0-.597-.933A7.024 7.024 0 0 1 13.745 4h-2.146a13.66 13.66 0 0 0-.329-1.539z"/>
      </svg>
      <span>{{ currentLabel }}</span>
      <svg viewBox="0 0 16 16" class="w-3 h-3 flex-shrink-0 opacity-70" fill="currentColor" aria-hidden="true">
        <path d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"/>
      </svg>
    </button>

    <div
      v-show="open"
      ref="menuRef"
      role="menu"
      :aria-label="t('nav.language')"
      tabindex="-1"
      class="absolute right-0 top-full mt-1 z-[60] min-w-[9.5rem] max-w-[calc(100vw-1.5rem)] py-1 rounded-md bg-white border border-gray-200 shadow-lg origin-top-right"
      @keydown="onMenuKeydown"
    >
      <button
        v-for="(lang, index) in LANGS"
        :key="lang.code"
        type="button"
        role="menuitemradio"
        :aria-checked="locale === lang.code"
        class="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
        :class="locale === lang.code
          ? 'bg-emerald-50 text-emerald-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'"
        @click="selectLang(lang.code)"
        @mouseenter="activeIndex = index"
      >
        <svg
          viewBox="0 0 16 16"
          class="w-3.5 h-3.5 flex-shrink-0"
          :class="locale === lang.code ? 'opacity-100' : 'opacity-0'"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
        </svg>
        <span>{{ lang.label }}</span>
      </button>
    </div>
  </div>
</template>
