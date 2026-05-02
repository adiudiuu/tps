<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { fmtMs } from '../../utils/format.js'
import TipIcon from '../ui/TipIcon.vue'

const { t } = useI18n()
const props = defineProps({ result: Object, readonly: Boolean })

// 利特尔定理（Little's Law）：L = λW
//   L = 系统内平均并发请求数（有效 batch size）
//   λ = 请求到达率（QPS）
//   W = 平均请求在系统内的时间（totalLatency，ms → s）
//
// 两个方向：
//   给定 QPS → 有效 batch：effectiveBatch = QPS × (totalLatency / 1000)
//   给定 batch → 最大 QPS：maxQPS = batch / (totalLatency / 1000)

const targetQps = ref(1.0)  // 用户输入的目标 QPS

const littlesBatch = computed(() => {
  if (!props.result?.totalLatency || props.result.totalLatency <= 0) return null
  const W = props.result.totalLatency / 1000  // ms → s
  return targetQps.value * W
})

const maxQps = computed(() => {
  if (!props.result?.totalLatency || props.result.totalLatency <= 0) return null
  const W = props.result.totalLatency / 1000  // ms → s
  // 当前 batch 配置满载时能支撑的最大 QPS
  // effectiveToks / singleToks = batch（有效并发数）
  const currentBatch = props.result.effectiveToks > 0 && props.result.singleToks > 0
    ? props.result.effectiveToks / props.result.singleToks
    : 1
  return currentBatch / W
})

// 利用率：目标 QPS 对应的 batch / 当前配置 batch
const utilization = computed(() => {
  if (!littlesBatch.value || !props.result) return null
  const currentBatch = props.result.effectiveToks > 0 && props.result.singleToks > 0
    ? props.result.effectiveToks / props.result.singleToks
    : 1
  return Math.min(1, littlesBatch.value / currentBatch)
})
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ t('result.latency_title') }}</h3>

    <!-- 三大指标 -->
    <div v-if="result" class="grid grid-cols-3 divide-x divide-gray-100 border border-gray-100 rounded-xl">
      <div class="px-4 py-3 min-w-0">
        <div class="text-[10px] text-gray-400 mb-1 flex items-center gap-1 whitespace-nowrap">
          {{ t('result.ttft') }}
          <TipIcon :text="t('result.ttft_tip')" />
        </div>
        <div class="text-xl font-bold text-emerald-600 tabular-nums">{{ fmtMs(result.ttft) }}</div>
      </div>
      <div class="px-4 py-3 min-w-0">
        <div class="text-[10px] text-gray-400 mb-1 whitespace-nowrap">{{ t('result.tpot') }}</div>
        <div class="text-xl font-bold text-amber-500 tabular-nums">{{ fmtMs(result.tpot) }}</div>
      </div>
      <div class="px-4 py-3 min-w-0">
        <div class="text-[10px] text-gray-400 mb-1 whitespace-nowrap">{{ t('result.latency') }}</div>
        <div class="text-xl font-bold text-blue-500 tabular-nums">{{ fmtMs(result.totalLatency) }}</div>
      </div>
    </div>

    <!-- 细节行 -->
    <div v-if="result" class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 mt-3 pt-3 border-t border-gray-100">
      <div>
        <div class="text-[10px] text-gray-400">{{ t('result.attention') }}</div>
        <div class="text-xs font-semibold text-gray-700 mt-0.5">{{ result.attentionSummary }}</div>
      </div>
      <div>
        <div class="text-[10px] text-gray-400">{{ t('result.runtime') }}</div>
        <div class="text-xs font-semibold text-gray-700 mt-0.5">{{ result.flashAttention ? 'FlashAttention' : 'Vanilla Attention' }}</div>
      </div>
      <div>
        <div class="text-[10px] text-gray-400">{{ t('run.kv_cache_quant') }}</div>
        <div class="text-xs font-semibold text-gray-700 mt-0.5">{{ result.kvCacheLabel }}</div>
      </div>
      <div>
        <div class="text-[10px] text-gray-400">{{ t('result.prefix_hit') }}</div>
        <div class="text-xs font-semibold text-gray-700 mt-0.5">{{ result.prefixCacheHit }}% / {{ result.effectivePromptLen }} tok</div>
      </div>
    </div>

    <!-- 能效比 -->
    <div v-if="result && result.tokPerJoule != null" class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-1.5">
        <span class="text-[10px] text-gray-400">{{ t('result.energy_efficiency') }}</span>
        <TipIcon :text="t('result.energy_efficiency_tip')" />
      </div>
      <div class="text-xs font-semibold text-gray-700">
        {{ result.tokPerJoule.toFixed(2) }} tok/J
        <span class="text-gray-400 font-normal ml-1">({{ (result.totalPower * 1000).toFixed(0) }} W)</span>
      </div>
    </div>

    <!-- 连续批处理估算（利特尔定理）-->
    <div v-if="result && result.totalLatency > 0" class="mt-3 pt-3 border-t border-gray-100 space-y-2">
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-semibold text-gray-700">{{ t('result.little_title') }}</span>
        <TipIcon :text="t('result.little_tip')" />
      </div>

      <!-- 最大 QPS（当前 batch 满载时）-->
      <div class="flex items-center justify-between text-xs">
        <span class="text-gray-500">{{ t('result.little_max_qps') }}</span>
        <span class="font-semibold text-gray-800 tabular-nums">
          {{ maxQps != null ? maxQps.toFixed(2) + ' req/s' : '—' }}
        </span>
      </div>

      <!-- QPS 输入 → 有效 batch -->
      <div class="flex items-center gap-2">
        <span class="text-[10px] text-gray-400 whitespace-nowrap">{{ t('result.little_target_qps') }}</span>
        <input
          v-model.number="targetQps"
          type="number"
          min="0.1"
          step="0.5"
          :disabled="readonly"
          :class="[
            'w-20 border rounded px-2 py-0.5 text-xs focus:outline-none tabular-nums',
            readonly
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-1 focus:ring-emerald-500'
          ]"
        />
        <span class="text-[10px] text-gray-400">req/s</span>
        <span class="ml-auto text-xs font-semibold tabular-nums"
          :class="utilization != null && utilization >= 1 ? 'text-red-600' : 'text-gray-800'"
        >
          {{ littlesBatch != null ? '≈ ' + littlesBatch.toFixed(1) + ' ' + t('result.little_batch_unit') : '—' }}
        </span>
      </div>

      <!-- 利用率进度条 -->
      <div v-if="utilization != null" class="space-y-0.5">
        <div class="flex justify-between text-[10px] text-gray-400">
          <span>{{ t('result.little_utilization') }}</span>
          <span :class="utilization >= 1 ? 'text-red-500 font-medium' : ''">
            {{ (utilization * 100).toFixed(0) }}%
            <span v-if="utilization >= 1"> — {{ t('result.little_overloaded') }}</span>
          </span>
        </div>
        <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="utilization >= 1 ? 'bg-red-500' : utilization >= 0.8 ? 'bg-amber-400' : 'bg-emerald-500'"
            :style="{ width: Math.min(100, utilization * 100).toFixed(1) + '%' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
