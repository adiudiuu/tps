<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()

const homeLink = computed(() => {
  if (route.path === '/') return '/'
  const SESSION_KEY = 'tps_calc_query'
  const saved = sessionStorage.getItem(SESSION_KEY) ?? ''
  const query = Object.fromEntries(new URLSearchParams(saved))
  return { path: '/', query }
})

// 判断当前路由是否激活
const isActive = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <!-- 移动端底部导航 -->
  <nav class="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
    <div class="grid grid-cols-3 h-16">
      <RouterLink
        :to="homeLink"
        class="relative flex flex-col items-center justify-center gap-1 transition-colors text-gray-500"
        :class="route.path === '/' ? 'bg-emerald-50' : ''"
        exact-active-class="!text-emerald-600"
      >
        <span
          class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full transition-colors"
          :class="route.path === '/' ? 'bg-emerald-500' : 'bg-transparent'"
        />
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <span class="text-xs font-medium">{{ t('nav.calc_short') }}</span>
      </RouterLink>

      <RouterLink
        to="/ranking"
        class="relative flex flex-col items-center justify-center gap-1 transition-colors text-gray-500"
        :class="isActive('/ranking') ? 'bg-emerald-50' : ''"
        exact-active-class="!text-emerald-600"
      >
        <span
          class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full transition-colors"
          :class="isActive('/ranking') ? 'bg-emerald-500' : 'bg-transparent'"
        />
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-xs font-medium">{{ t('nav.ranking_short') }}</span>
      </RouterLink>

      <RouterLink
        to="/supported"
        class="relative flex flex-col items-center justify-center gap-1 transition-colors text-gray-500"
        :class="isActive('/supported') ? 'bg-emerald-50' : ''"
        exact-active-class="!text-emerald-600"
      >
        <span
          class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full transition-colors"
          :class="isActive('/supported') ? 'bg-emerald-500' : 'bg-transparent'"
        />
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <span class="text-xs font-medium">{{ t('nav.supported_short') }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
