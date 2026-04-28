<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { fmtGB, fmtPct } from '../../utils/format.js'

const { t } = useI18n()
const props = defineProps({ result: Object })

const barColor = computed(() => {
  if (!props.result) return 'bg-emerald-500'
  if (!props.result.vramOk) return 'bg-red-500'
  if (props.result.vramPct > 95) return 'bg-yellow-400'
  return 'bg-emerald-500'
})

const barWidth = computed(() => {
  if (!props.result) return '0%'
  return Math.min(100, props.result.vramPct).toFixed(1) + '%'
})

const pieData = computed(() => {
  if (!props.result) return []
  const { weightGB, kvGB, overheadGB } = props.result
  return [
    { label: t('result.weight'), value: weightGB, color: 'bg-emerald-500' },
    { label: t('result.kv'),     value: kvGB,     color: 'bg-amber-500' },
    { label: t('result.overhead'), value: overheadGB, color: 'bg-slate-500' },
  ]
})
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-700">{{ t('result.vram') }}</h3>
      <span v-if="result" :class="['text-xs font-medium px-2 py-0.5 rounded-full', result.vramOk ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700']">
        {{ result.vramOk ? t('result.vram_ok') : t('result.vram_oom') }}
      </span>
    </div>

    <!-- 进度条 -->
    <div v-if="result" class="space-y-1">
      <div class="flex justify-between text-xs text-gray-500">
        <span>{{ fmtGB(result.totalNeeded) }} / {{ fmtGB(result.totalVram) }}</span>
        <span>{{ fmtPct(result.vramPct) }}</span>
      </div>
      <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          :class="['h-full rounded-full transition-all duration-500', barColor]"
          :style="{ width: barWidth }"
        />
      </div>
    </div>

    <!-- 构成列表 -->
    <div v-if="result" class="space-y-1.5">
      <div v-for="item in pieData" :key="item.label" class="flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <div :class="['w-2 h-2 rounded-full', item.color]" />
          <span class="text-gray-500">{{ item.label }}</span>
        </div>
        <span class="text-gray-800 font-medium">{{ fmtGB(item.value) }}</span>
      </div>
      <div class="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
        <span class="text-gray-500">{{ t('result.available') }}</span>
        <span class="text-gray-800 font-medium">{{ fmtGB(result.totalVram) }}</span>
      </div>
    </div>
  </div>
</template>
