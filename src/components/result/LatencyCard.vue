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
      <div class="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
        <div class="text-[10px] text-emerald-700 mb-1 flex items-center gap-1">
          {{ t('result.ttft') }}
          <TipIcon :text="t('result.ttft_tip')" />
        </div>
        <div class="text-2xl font-bold text-emerald-700">{{ fmtMs(result.ttft) }}</div>
      </div>
      <div class="bg-amber-50 rounded-lg p-3 border border-amber-200">
        <div class="text-[10px] text-amber-700 mb-1">{{ t('result.tpot') }}</div>
        <div class="text-2xl font-bold text-amber-700">{{ fmtMs(result.tpot) }}</div>
      </div>
      <div class="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div class="text-[10px] text-blue-700 mb-1">{{ t('result.latency') }}</div>
        <div class="text-2xl font-bold text-blue-700">{{ fmtMs(result.totalLatency) }}</div>
      </div>
    </div>
    <div v-if="result" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
      <div class="bg-gray-50 rounded-lg px-3 py-2">
        <div class="text-[10px] text-gray-500 mb-0.5">{{ t('result.attention') }}</div>
        <div class="text-xs font-semibold text-gray-900">{{ result.attentionSummary }}</div>
      </div>
      <div class="bg-gray-50 rounded-lg px-3 py-2">
        <div class="text-[10px] text-gray-500 mb-0.5">{{ t('result.runtime') }}</div>
        <div class="text-xs font-semibold text-gray-900">{{ result.flashAttention ? 'FlashAttention' : 'Vanilla Attention' }}</div>
      </div>
      <div class="bg-gray-50 rounded-lg px-3 py-2">
        <div class="text-[10px] text-gray-500 mb-0.5">{{ t('run.kv_cache_quant') }}</div>
        <div class="text-xs font-semibold text-gray-900">{{ result.kvCacheLabel }}</div>
      </div>
      <div class="bg-gray-50 rounded-lg px-3 py-2">
        <div class="text-[10px] text-gray-500 mb-0.5">{{ t('result.prefix_hit') }}</div>
        <div class="text-xs font-semibold text-gray-900">{{ result.prefixCacheHit }}% / {{ result.effectivePromptLen }} tok</div>
      </div>
    </div>
  </div>
</template>
