<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getWarnings } from '../../utils/calc.js'

const { t } = useI18n()
const props = defineProps({ result: Object })

const warnings = computed(() => {
  if (!props.result) return []
  return getWarnings(props.result, t)
})

const levelStyle = {
  error: { dot: 'bg-red-500',    bg: 'bg-red-50 border-red-200 text-red-700' },
  warn:  { dot: 'bg-yellow-500', bg: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  info:  { dot: 'bg-slate-500',  bg: 'bg-slate-50 border-slate-200 text-slate-700' },
}

function getText(w) {
  const key = `warning.${w.key}`
  return t(key, w)
}
</script>

<template>
  <div v-if="warnings.length > 0" class="space-y-2">
    <div
      v-for="(w, i) in warnings"
      :key="i"
      :class="['flex items-start gap-2 rounded-lg border px-3 py-2 text-sm', levelStyle[w.level].bg]"
    >
      <div :class="['w-2 h-2 rounded-full mt-1 flex-shrink-0', levelStyle[w.level].dot]" />
      <span>{{ getText(w) }}</span>
    </div>
  </div>
</template>
