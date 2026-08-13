<script setup>
import { useI18n } from 'vue-i18n'
import TopBar from '../components/layout/TopBar.vue'

const { t } = useI18n()

const githubUrl = 'https://github.com/adiudiuu/tps'
</script>

<template>
  <div class="min-h-screen bg-gray-50 overflow-x-hidden pt-12 sm:pt-14 pb-20 sm:pb-8">
    <TopBar />

    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div class="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t('about.title') }}</h1>
        <div class="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
          <p>{{ t('about.intro') }}</p>
          <p>{{ t('about.why') }}</p>
          <p>{{ t('about.ads') }}</p>
          <p>{{ t('about.sources') }}</p>
          <p>{{ t('about.estimates') }}</p>
          <p>{{ t('about.support') }}</p>
        </div>
        <div class="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
          <a
            :href="githubUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            <svg viewBox="0 0 16 16" class="w-4 h-4 flex-shrink-0" fill="currentColor" aria-hidden="true">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
            </svg>
            {{ t('about.star') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
