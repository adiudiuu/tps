<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { fmtToks, fmtToksRange, fmtPct, fmtGB } from '../../utils/format.js'
import { FRAMEWORK_MAP } from '../../data/constants.js'
import TipIcon from '../ui/TipIcon.vue'

const { t } = useI18n()
const props = defineProps({ result: Object, gpuVendor: String })
const framework = defineModel('framework', { required: true })

const speedRating = computed(() => {
  const toks = props.result?.singleToksMax
  if (toks == null) return null
  if (toks >= 60) return { dot: 'bg-green-500',  label: t('result.speed_rating_blazing'), desc: t('result.speed_rating_blazing_desc') }
  if (toks >= 30) return { dot: 'bg-yellow-400', label: t('result.speed_rating_smooth'),  desc: t('result.speed_rating_smooth_desc') }
  if (toks >= 15) return { dot: 'bg-orange-400', label: t('result.speed_rating_usable'),  desc: t('result.speed_rating_usable_desc') }
  return               { dot: 'bg-red-500',    label: t('result.speed_rating_slow'),    desc: t('result.speed_rating_slow_desc') }
})

// 根据当前 GPU vendor 过滤可用框架
const availableFrameworks = computed(() => {
  const vendor = props.gpuVendor
  return FRAMEWORK_MAP.map(f => {
    const available = !f.vendors || f.vendors.includes(vendor)
    const recommended = f.recommended === vendor
    return { ...f, available, recommended }
  })
})

function fmtFrameworkRange(min, max) {
  const lo = (min * 100).toFixed(0)
  const hi = (max * 100).toFixed(0)
  return lo === hi ? `${lo}%` : `${lo}-${hi}%`
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4 space-y-3">

    <!-- 速度体验评级 -->
    <div v-if="speedRating" class="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
      <div :class="['w-2.5 h-2.5 rounded-full flex-shrink-0', speedRating.dot]" />
      <span class="text-sm font-semibold text-gray-800">{{ speedRating.label }}</span>
      <span class="text-xs text-gray-400">{{ speedRating.desc }}</span>
    </div>

    <!-- 推理框架选择 -->
    <div>
      <p class="text-xs text-gray-500 mb-2">{{ t('run.framework') }}</p>
      <div class="grid grid-cols-3 sm:grid-cols-5 gap-1 overflow-x-auto">
        <button
          v-for="f in availableFrameworks"
          :key="f.id"
          @click="f.available && (framework = f)"
          :disabled="!f.available"
          :title="!f.available ? t('run.framework_unavailable', { vendor: gpuVendor }) : f.recommended ? t('run.framework_recommended') : ''"
          :class="[
            'flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg text-xs border transition-colors relative',
            !f.available
              ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed opacity-60'
              : framework.id === f.id
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
          ]"
        >
          <span :class="['font-medium leading-tight text-center', !f.available && 'line-through']">{{ t(f.labelKey) }}</span>
          <span v-if="f.recommended && f.available" class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" :title="t('run.framework_recommended')"></span>
          <span v-if="!f.available" class="text-[9px] leading-tight text-red-600 font-medium">{{ t('run.not_supported') }}</span>
          <template v-else>
            <span :class="['text-[10px] leading-tight', framework.id === f.id ? 'opacity-70' : 'opacity-50']">d {{ fmtFrameworkRange(f.decodeMin ?? f.decode, f.decodeMax ?? f.decode) }}</span>
            <span :class="['text-[10px] leading-tight', framework.id === f.id ? 'opacity-70' : 'opacity-50']">p {{ fmtFrameworkRange(f.prefillMin ?? f.prefill, f.prefillMax ?? f.prefill) }}</span>
          </template>
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
