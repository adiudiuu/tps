<script setup>
import { useI18n } from 'vue-i18n'
import TopBar from '../components/layout/TopBar.vue'

const { t } = useI18n()

const githubUrl = 'https://github.com/adiudiuu/tps'

const sections = [
  {
    key: 'why',
    titleKey: 'about.why_title',
    bodyKey: 'about.why',
    wrap: 'bg-white border-gray-200',
    iconWrap: 'bg-emerald-100 text-emerald-700',
  },
  {
    key: 'ads',
    titleKey: 'about.ads_title',
    bodyKey: 'about.ads',
    wrap: 'bg-white border-gray-200',
    iconWrap: 'bg-blue-100 text-blue-700',
  },
  {
    key: 'sources',
    titleKey: 'about.sources_title',
    bodyKey: 'about.sources',
    wrap: 'bg-white border-gray-200',
    iconWrap: 'bg-amber-100 text-amber-700',
  },
  {
    key: 'estimates',
    titleKey: 'about.estimates_title',
    bodyKey: 'about.estimates',
    wrap: 'bg-amber-50/70 border-amber-200',
    iconWrap: 'bg-amber-100 text-amber-800',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 overflow-x-hidden pt-12 sm:pt-14 pb-20 sm:pb-8">
    <TopBar />

    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4">
      <div class="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ t('about.title') }}</h1>
        <p class="text-sm sm:text-base text-gray-600 leading-relaxed">{{ t('about.intro') }}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <section
          v-for="s in sections"
          :key="s.key"
          :class="['rounded-xl border shadow-sm p-5 h-full', s.wrap]"
        >
          <div class="flex items-center gap-2.5 mb-3">
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', s.iconWrap]">
              <svg v-if="s.key === 'why'" viewBox="0 0 20 20" class="w-4 h-4" fill="currentColor" aria-hidden="true">
                <path d="M2 5.75A.75.75 0 0 1 2.75 5h8.5a.75.75 0 0 1 0 1.5h-8.5A.75.75 0 0 1 2 5.75zM14 5a2 2 0 1 1 4 0 2 2 0 0 1-4 0zM2 10.75A.75.75 0 0 1 2.75 10h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75zM8 10a2 2 0 1 1 4 0 2 2 0 0 1-4 0zM12.75 10.75a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H13.5a.75.75 0 0 1-.75-.75zM2 15.75A.75.75 0 0 1 2.75 15h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75zM14 15a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"/>
              </svg>
              <svg v-else-if="s.key === 'ads'" viewBox="0 0 20 20" class="w-4 h-4" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5z" clip-rule="evenodd"/>
              </svg>
              <svg v-else-if="s.key === 'sources'" viewBox="0 0 20 20" class="w-4 h-4" fill="currentColor" aria-hidden="true">
                <path d="M10.75 16.82A7.462 7.462 0 0 1 15 15.5c.71 0 1.396.107 2.042.308V5.821A7.456 7.456 0 0 0 15 5.5c-1.79 0-3.417.652-4.25 1.72v9.6zM8.5 7.22C7.667 6.152 6.04 5.5 4.25 5.5c-.71 0-1.396.107-2.042.308v10.987A7.462 7.462 0 0 1 4.25 16.5c1.79 0 3.417-.652 4.25-1.72V7.22z"/>
              </svg>
              <svg v-else viewBox="0 0 20 20" class="w-4 h-4" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clip-rule="evenodd"/>
              </svg>
            </div>
            <h2 class="text-sm font-semibold text-gray-900">{{ t(s.titleKey) }}</h2>
          </div>
          <p class="text-sm text-gray-600 leading-relaxed">{{ t(s.bodyKey) }}</p>
        </section>
      </div>

      <section class="rounded-xl border border-gray-200 bg-white shadow-sm p-5 sm:p-6">
        <div class="flex items-center gap-2.5 mb-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-700">
            <svg viewBox="0 0 20 20" class="w-4 h-4" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h2 class="text-sm font-semibold text-gray-900">{{ t('about.limits_title') }}</h2>
        </div>
        <p class="text-sm text-gray-600 leading-relaxed">{{ t('about.limits') }}</p>
      </section>

      <div class="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
        <p class="text-sm text-gray-600 leading-relaxed mb-4">{{ t('about.support') }}</p>
        <div class="flex flex-wrap items-center gap-3">
          <a
            :href="githubUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 transition-colors"
          >
            <svg viewBox="0 0 16 16" class="w-4 h-4 flex-shrink-0" fill="currentColor" aria-hidden="true">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
            </svg>
            {{ t('about.star') }}
          </a>
          <span class="inline-flex items-center gap-2 text-sm text-gray-500 px-1 py-2">
            <svg viewBox="0 0 20 20" class="w-4 h-4 text-amber-700 flex-shrink-0" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M3.75 4.5A.75.75 0 0 0 3 5.25v6A4.75 4.75 0 0 0 7.75 16h1.5A4.75 4.75 0 0 0 14 11.25v-6a.75.75 0 0 0-.75-.75h-9.5zM14.5 7h.75a2.25 2.25 0 1 1 0 4.5h-.75V7zM5.25 17a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5z" clip-rule="evenodd"/>
            </svg>
            {{ t('about.coffee') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
