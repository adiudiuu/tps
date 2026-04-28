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
defineProps({ result: Object, model: Object, quantMatrix: Array })
const framework = defineModel('framework', { required: true })
</script>

<template>
  <div class="space-y-4">
    <div v-if="model" class="bg-white rounded-xl border border-gray-200 p-4">
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-sm font-semibold text-gray-700">{{ t('result.current_model') }}</h3>
        <span
          :class="model.type === 'moe' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'"
          class="text-xs font-medium px-2 py-0.5 rounded-full"
        >
          {{ model.type === 'moe' ? 'MoE' : 'Dense' }}
        </span>
      </div>
      <div class="mt-2 text-base font-semibold text-gray-900">{{ model.name }}</div>
      <div class="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div class="bg-gray-50 rounded-lg px-2.5 py-2 text-gray-500">
          {{ t('model.custom.params') }}
          <span class="ml-1 font-medium text-gray-800">{{ fmtParams(model.params) }}</span>
        </div>
        <div class="bg-gray-50 rounded-lg px-2.5 py-2 text-gray-500">
          {{ t('model.custom.max_ctx') }}
          <span class="ml-1 font-medium text-gray-800">{{ fmtCtx(model.max_ctx) }}</span>
        </div>
        <div class="bg-gray-50 rounded-lg px-2.5 py-2 text-gray-500">
          {{ t('model.attention') }}
          <span class="ml-1 font-medium text-gray-800">{{ getAttentionSummary(model) }}</span>
        </div>
        <div v-if="model.type === 'moe'" class="bg-gray-50 rounded-lg px-2.5 py-2 text-gray-500">
          {{ t('model.custom.active_params') }}
          <span class="ml-1 font-medium text-gray-800">{{ fmtParams(model.active_params ?? model.params) }}</span>
        </div>
      </div>
    </div>
    <WarningList :result="result" />
    <VramCard :result="result" :quant-matrix="quantMatrix" :current-quant-id="result?.quantId" />
    <SpeedCard :result="result" v-model:framework="framework" />
    <LatencyCard :result="result" />
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <RooflineChart :result="result" />
      <VramPieChart :result="result" />
    </div>
  </div>
</template>
