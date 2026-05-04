<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { fmtGB, fmtToks, fmtMs } from '../../utils/format.js'

const { t, locale } = useI18n()

const props = defineProps({
  row: { type: Object, required: true },
  isPareto: { type: Boolean, default: false },
})

const emit = defineEmits(['use'])

// 速度评级颜色
const speedColor = computed(() => {
  const s = props.row.decodeSpeed
  if (s >= 100) return 'text-emerald-600'
  if (s >= 50)  return 'text-blue-600'
  if (s >= 20)  return 'text-amber-600'
  return 'text-red-500'
})

// 显存利用率颜色
const vramColor = computed(() => {
  const pct = props.row.vramPct
  if (pct > 95) return 'text-red-500'
  if (pct > 80) return 'text-amber-600'
  return 'text-gray-600'
})

// 框架 label
const frameworkLabel = computed(() => {
  const id = props.row.framework?.id
  if (!id) return '—'
  return t(`framework.${id}`) || id
})

// 量化 label
const quantLabel = computed(() => props.row.quant?.label ?? '—')

// GPU 配置描述（模式 A）
const gpuDesc = computed(() => {
  if (!props.row.gpu) return '—'
  return `${props.row.gpu.name} × ${props.row.gpuCount}`
})

const totalGpuCount = computed(() => props.row.totalGpuCount ?? props.row.gpuCount ?? 1)
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center gap-3">
    <!-- 主信息 -->
    <div class="flex-1 min-w-0">
      <!-- 标题行 -->
      <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
        <span class="font-medium text-sm text-gray-900 truncate">{{ gpuDesc }}</span>

        <!-- 量化 + 框架 badges -->
        <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">{{ quantLabel }}</span>
        <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">{{ frameworkLabel }}</span>
        <span v-if="row.ppCount > 1" class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-100 text-violet-700">PP{{ row.ppCount }}</span>
        <span v-if="row.epCount > 1" class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-fuchsia-100 text-fuchsia-700">EP{{ row.epCount }}</span>
      </div>

      <!-- 指标行 -->
      <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <!-- Decode 速度 -->
        <div class="flex items-center gap-1">
          <span class="text-gray-400">{{ t('result.decode') }}</span>
          <span :class="speedColor" class="font-semibold">{{ fmtToks(row.decodeSpeed) }}</span>
        </div>
        <!-- TTFT -->
        <div class="flex items-center gap-1">
          <span class="text-gray-400">TTFT</span>
          <span class="text-gray-700 font-medium">{{ fmtMs(row.ttft) }}</span>
        </div>
        <!-- 显存 -->
        <div class="flex items-center gap-1">
          <span class="text-gray-400">{{ t('result.vram') }}</span>
          <span :class="vramColor" class="font-medium">
            {{ fmtGB(row.vramNeeded) }}
            <span class="text-gray-400 font-normal">/ {{ fmtGB(row.totalVram) }}</span>
          </span>
        </div>
        <!-- GPU 数量（模式 A 时显示） -->
        <div class="flex items-center gap-1">
          <span class="text-gray-400">{{ t('solver.gpu_count_label') }}</span>
          <span class="text-gray-700 font-medium">{{ totalGpuCount }}</span>
        </div>
        <!-- 速度/卡 -->
        <div class="flex items-center gap-1">
          <span class="text-gray-400">{{ t('solver.speed_per_gpu') }}</span>
          <span class="text-gray-700 font-medium">{{ fmtToks(row.decodeSpeed / totalGpuCount) }}</span>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <button
      @click="emit('use')"
      class="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
      :class="isPareto
        ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'"
    >
      {{ t('solver.use_config') }}
    </button>
  </div>
</template>
