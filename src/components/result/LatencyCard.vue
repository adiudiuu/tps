<script setup>
import { useI18n } from 'vue-i18n'
import { fmtMs } from '../../utils/format.js'
import TipIcon from '../ui/TipIcon.vue'

const { t } = useI18n()
defineProps({ result: Object })
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
  </div>
</template>
