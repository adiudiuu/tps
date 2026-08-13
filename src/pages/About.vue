<script setup>
import { useI18n } from 'vue-i18n'
import TopBar from '../components/layout/TopBar.vue'

const { t } = useI18n()

const githubUrl = 'https://github.com/adiudiuu/tps'

const sections = [
  { key: 'why', titleKey: 'about.why_title', bodyKey: 'about.why' },
  { key: 'ads', titleKey: 'about.ads_title', bodyKey: 'about.ads' },
  { key: 'sources', titleKey: 'about.sources_title', bodyKey: 'about.sources' },
  { key: 'estimates', titleKey: 'about.estimates_title', bodyKey: 'about.estimates' },
  { key: 'limits', titleKey: 'about.limits_title', bodyKey: 'about.limits' },
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 overflow-x-hidden pt-12 sm:pt-14 pb-20 sm:pb-8">
    <TopBar />

    <div class="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
      <h1 class="text-base sm:text-lg font-semibold text-gray-900">{{ t('about.title') }}</h1>
      <p class="mt-1 text-sm text-gray-600 leading-snug">{{ t('about.intro') }}</p>

      <section
        v-for="s in sections"
        :key="s.key"
        class="mt-3 pt-2.5 border-t border-gray-200"
      >
        <h2 class="text-sm font-semibold text-gray-900">{{ t(s.titleKey) }}</h2>
        <p class="mt-0.5 text-sm text-gray-600 leading-snug">{{ t(s.bodyKey) }}</p>
      </section>

      <div class="mt-3 pt-2.5 border-t border-gray-200 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <p class="text-sm text-gray-600 leading-snug">{{ t('about.support') }}</p>
        <a
          :href="githubUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <svg viewBox="0 0 16 16" class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" aria-hidden="true">
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
          </svg>
          {{ t('about.star') }}
        </a>
        <span class="text-sm text-gray-500">{{ t('about.coffee') }}</span>
      </div>
    </div>
  </div>
</template>
