<script setup>
import { useI18n } from 'vue-i18n'
import { fmtToks, fmtToksRange, fmtPct, fmtGB } from '../../utils/format.js'
import { FRAMEWORK_MAP } from '../../data/constants.js'
import TipIcon from '../ui/TipIcon.vue'

const { t } = useI18n()
defineProps({ result: Object })
const framework = defineModel('framework', { required: true })

function fmtFrameworkRange(min, max) {
  const lo = (min * 100).toFixed(0)
  const hi = (max * 100).toFixed(0)
  return lo === hi ? `${lo}%` : `${lo}-${hi}%`
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4 space-y-3">

    <!-- 推理框架选择 -->
    <div>
      <p class="text-xs text-gray-500 mb-2">{{ t('run.framework') }}</p>
      <div class="grid grid-cols-3 sm:grid-cols-5 gap-1 overflow-x-auto">
        <button
          v-for="f in FRAMEWORK_MAP"
          :key="f.id"
          @click="framework = f"
          :class="[
            'flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg text-xs border transition-colors',
            framework.id === f.id
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
              : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300'
          ]"
        >
          <span class="font-medium leading-tight text-center">{{ t(f.labelKey) }}</span>
          <span class="text-[10px] leading-tight opacity-50">d {{ fmtFrameworkRange(f.decodeMin ?? f.decode, f.decodeMax ?? f.decode) }}</span>
          <span class="text-[10px] leading-tight opacity-50">p {{ fmtFrameworkRange(f.prefillMin ?? f.prefill, f.prefillMax ?? f.prefill) }}</span>
        </button>
      </div>
    </div>

    <!-- Decode / Prefill -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-gray-100">
      <!-- Decode -->
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-1">
          {{ t('result.decode') }}
          <TipIcon :text="t('result.decode_tip')" />
        </h3>
        <div v-if="result" class="space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">{{ t('result.bw_limit') }}</span>
            <span class="text-gray-800">{{ fmtToks(result.bwLimit) }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">{{ t('result.actual') }}</span>
            <span class="text-emerald-600 font-semibold text-sm">{{ fmtToksRange(result.decodeToksMin, result.decodeToksMax) }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">{{ t('result.single') }}</span>
            <span class="text-emerald-700 font-medium">{{ fmtToksRange(result.singleToksMin, result.singleToksMax) }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">{{ t('result.kv_read') }}</span>
            <span class="text-gray-700">{{ fmtGB(result.kvReadGB) }}</span>
          </div>
          <div v-if="result.tpEfficiency < 1" class="flex justify-between text-xs">
            <span class="text-gray-500">{{ t('result.tp_eff') }}</span>
            <span class="text-yellow-600">{{ fmtPct(result.tpEfficiency * 100) }}</span>
          </div>
        </div>
      </div>

      <!-- Prefill -->
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-1">
          {{ t('result.prefill') }}
          <TipIcon :text="t('result.prefill_tip')" />
        </h3>
        <div v-if="result" class="space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">{{ t('result.compute_limit') }}</span>
            <span class="text-gray-800">{{ fmtToks(result.computeLimit) }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">{{ t('result.actual') }}</span>
            <span class="text-emerald-600 font-semibold text-sm">{{ fmtToksRange(result.prefillToksMin, result.prefillToksMax) }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">{{ t('result.flash_factor') }}</span>
            <span class="text-gray-700">x{{ result.flashFactorMin.toFixed(1) }} - x{{ result.flashFactorMax.toFixed(1) }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">{{ t('result.attention_factor') }}</span>
            <span class="text-gray-700">x{{ result.prefillAttentionFactor.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">{{ t('result.effective_prompt') }}</span>
            <span class="text-gray-700">{{ result.effectivePromptLen }} tok</span>
          </div>
          <div class="flex justify-between text-xs pt-1 border-t border-gray-200">
            <span class="text-gray-500">{{ t('result.bottleneck') }}</span>
            <span :class="result.bottleneck === 'bandwidth' ? 'text-orange-600' : 'text-emerald-700'" class="font-medium text-xs">
              {{ t('result.' + result.bottleneck) }}
            </span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">{{ t('result.roofline') }}</span>
            <span class="text-gray-700">{{ result.roofline.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
