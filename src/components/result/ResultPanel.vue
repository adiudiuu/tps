<script setup>
import { useI18n } from 'vue-i18n'
import { fmtCtx, fmtParams } from '../../utils/format.js'
import { getAttentionSummary } from '../../utils/model.js'
import VramCard from './VramCard.vue'
import SpeedCard from './SpeedCard.vue'
import LatencyCard from './LatencyCard.vue'
import RooflineChart from './RooflineChart.vue'
import VramPieChart from './VramPieChart.vue'
import WarningList from './WarningList.vue'

const { t } = useI18n()
defineProps({
  result: Object,
  model: Object,
  quantMatrix: Array,
  gpuVendor: String,
  gpu: Object,
  gpuCount: Number,
  compact: Boolean,
  readonly: Boolean,
})
const framework = defineModel('framework', { required: true })
const quant = defineModel('quant', { required: true })
</script>

<template>
  <div class="space-y-4">
    <div v-if="model" class="bg-white rounded-xl border border-gray-200 p-4">
      <!-- 顶部：模型名 + GPU -->
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-center gap-2 min-w-0">
          <span
            :class="model.type === 'moe' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'"
            class="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          >{{ model.type === 'moe' ? 'MoE' : 'Dense' }}</span>
          <div class="text-base font-bold text-gray-900 truncate">{{ model.name }}</div>
        </div>
        <div v-if="gpu" class="flex-shrink-0 text-right">
          <div class="text-[10px] text-gray-400 mb-0.5">{{ t('result.current_gpu') }}</div>
          <div class="text-sm font-semibold text-gray-800">{{ gpu.name }}</div>
          <div v-if="gpuCount > 1" class="text-xs text-gray-500 mt-0.5">× {{ gpuCount }}</div>
        </div>
      </div>
      <!-- 底部：模型参数横排 -->
      <div class="grid grid-cols-3 divide-x divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
        <div class="px-3 py-2 min-w-0">
          <div class="text-[10px] text-gray-400 whitespace-nowrap">{{ t('model.custom.params') }}</div>
          <div class="text-sm font-bold text-gray-800 mt-0.5">{{ fmtParams(model.params) }}</div>
        </div>
        <div class="px-3 py-2 min-w-0">
          <div class="text-[10px] text-gray-400 whitespace-nowrap">{{ t('model.custom.max_ctx') }}</div>
          <div class="text-sm font-bold text-gray-800 mt-0.5">{{ fmtCtx(model.max_ctx) }}</div>
        </div>
        <div class="px-3 py-2 min-w-0" v-if="model.type !== 'moe'">
          <div class="text-[10px] text-gray-400 whitespace-nowrap">{{ t('model.attention') }}</div>
          <div class="text-sm font-bold text-gray-800 mt-0.5">{{ getAttentionSummary(model) }}</div>
        </div>
        <div class="px-3 py-2 min-w-0" v-if="model.type === 'moe'">
          <div class="text-[10px] text-gray-400 whitespace-nowrap">{{ t('model.custom.active_params') }}</div>
          <div class="text-sm font-bold text-gray-800 mt-0.5">{{ fmtParams(model.active_params ?? model.params) }}</div>
        </div>
      </div>
    </div>
    <WarningList :result="result" />
    <VramCard :result="result" :quant-matrix="quantMatrix" :current-quant-id="result?.quantId" @select-quant="quant = $event" />
    <SpeedCard :result="result" :gpu-vendor="gpuVendor" :readonly="readonly" v-model:framework="framework" />
    <LatencyCard :result="result" />
    <div :class="compact ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 lg:grid-cols-2 gap-4'">
      <RooflineChart :result="result" />
      <VramPieChart :result="result" />
    </div>
  </div>
</template>
