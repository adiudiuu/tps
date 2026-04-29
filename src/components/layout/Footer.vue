<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const route = useRoute()

const SESSION_KEY = 'tps_calc_query'
const homeLink = computed(() => {
  if (route.path === '/') return '/'
  const saved = sessionStorage.getItem(SESSION_KEY) ?? ''
  const query = Object.fromEntries(new URLSearchParams(saved))
  return { path: '/', query }
})
</script>

<template>
  <!-- 移动端底部导航栏 -->
  <nav class="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-gray-200 flex h-14 safe-area-inset-bottom">
    <RouterLink
      :to="homeLink"
      class="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
      :class="route.path === '/'
        ? 'text-emerald-700 bg-emerald-100 rounded-xl mx-1'
        : 'text-gray-500'"
    >
      <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm0 4a1 1 0 000 2h1a1 1 0 100-2H7zm5 0a1 1 0 100 2h1a1 1 0 100-2h-1zm-5 4a1 1 0 100 2h1a1 1 0 100-2H7zm5 0a1 1 0 100 2h1a1 1 0 100-2h-1zm-3 0a1 1 0 100 2h1a1 1 0 100-2h-1z" clip-rule="evenodd"/>
      </svg>
      <span>{{ t('nav.calc_short') }}</span>
    </RouterLink>
    <RouterLink
      to="/supported"
      class="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors"
      :class="route.path === '/supported'
        ? 'text-emerald-700 bg-emerald-100 rounded-xl mx-1'
        : 'text-gray-500'"
    >
      <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h2a2 2 0 012 2v9a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2V4zm2 1h6V4H7v1zm-2 2H3v9h14V7H5zm2 2a.75.75 0 000 1.5h6a.75.75 0 000-1.5H7zm0 3a.75.75 0 000 1.5h4a.75.75 0 000-1.5H7z" clip-rule="evenodd"/>
      </svg>
      <span>{{ t('nav.supported') }}</span>
    </RouterLink>
  </nav>
</template>
