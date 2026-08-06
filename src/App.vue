<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MobileNav from './components/layout/MobileNav.vue'
import { applyPageSeo } from './utils/seo.js'

const route = useRoute()
const { t, locale } = useI18n()

watch(
  [() => route.meta.seoKey, () => route.path, locale],
  ([seoKey, path]) => {
    applyPageSeo(seoKey || 'estimator', t, locale.value, path || '/')
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
  <MobileNav />
</template>
