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
    <div v-if="result" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="bg-gray-50 rounded-lg p-3">
        <div class="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
          {{ t('result.ttft') }}
          <TipIcon :text="t('result.ttft_tip')" />
        </div>
        <div class="text-2xl font-bold text-emerald-700">{{ fmtMs(result.ttft) }}</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-3">
        <div class="text-xs text-gray-500 mb-1.5">{{ t('result.tpot') }}</div>
        <div class="text-2xl font-bold text-amber-600">{{ fmtMs(result.tpot) }}</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-3">
        <div class="text-xs text-gray-500 mb-1.5">{{ t('result.latency') }}</div>
        <div class="text-2xl font-bold text-emerald-600">{{ fmtMs(result.totalLatency) }}</div>
      </div>
    </div>
    <div v-if="result" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3 text-xs text-gray-500">
      <div class="bg-gray-50 rounded-lg px-3 py-2">
        <span class="block sm:inline">{{ t('result.attention') }}:</span>
        <span class="text-gray-700 font-medium block sm:inline sm:ml-1">{{ result.attentionSummary }}</span>
      </div>
      <div class="bg-gray-50 rounded-lg px-3 py-2">
        <span class="block sm:inline">{{ t('result.runtime') }}:</span>
        <span class="text-gray-700 font-medium block sm:inline sm:ml-1">{{ result.flashAttention ? 'FlashAttention' : 'Vanilla Attention' }}</span>
      </div>
      <div class="bg-gray-50 rounded-lg px-3 py-2">
        <span class="block sm:inline">{{ t('run.kv_cache_quant') }}:</span>
        <span class="text-gray-700 font-medium block sm:inline sm:ml-1">{{ result.kvCacheLabel }}</span>
      </div>
      <div class="bg-gray-50 rounded-lg px-3 py-2">
        <span class="block sm:inline">{{ t('result.prefix_hit') }}:</span>
        <span class="text-gray-700 font-medium block sm:inline sm:ml-1">{{ result.prefixCacheHit }}% / {{ result.effectivePromptLen }} tok</span>
      </div>
    </div>
  </div>
</template>
