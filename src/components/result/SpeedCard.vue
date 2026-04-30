<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { fmtToks, fmtToksRange, fmtPct, fmtGB } from '../../utils/format.js'
import { FRAMEWORK_MAP } from '../../data/constants.js'
import TipIcon from '../ui/TipIcon.vue'

const { t } = useI18n()
const props = defineProps({ result: Object, gpuVendor: String, readonly: Boolean })
const framework = defineModel('framework', { required: true })

const speedRating = computed(() => {
  const toks = props.result?.singleToksMax
  if (toks == null) return null
  if (toks >= 100) return { grade: 'S', c1: '#22c55e', c2: '#15803d', label: t('result.speed_rating_blazing'), desc: t('result.speed_rating_s_desc') }
  if (toks >= 60)  return { grade: 'A', c1: '#60a5fa', c2: '#2563eb', label: t('result.speed_rating_blazing'), desc: t('result.speed_rating_blazing_desc') }
  if (toks >= 30)  return { grade: 'B', c1: '#fbbf24', c2: '#d97706', label: t('result.speed_rating_smooth'),  desc: t('result.speed_rating_smooth_desc') }
  if (toks >= 15)  return { grade: 'C', c1: '#a78bfa', c2: '#7c3aed', label: t('result.speed_rating_usable'),  desc: t('result.speed_rating_usable_desc') }
  return                  { grade: 'F', c1: '#f87171', c2: '#dc2626', label: t('result.speed_rating_slow'),    desc: t('result.speed_rating_slow_desc') }
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

    <!-- 显存不足时：OOM 提示条（替换速度评级） -->
    <div
      v-if="result && !result.vramOk"
      class="rounded-xl overflow-hidden flex items-center gap-3 px-4 py-3"
      style="background:linear-gradient(135deg,#fef2f215 0%,#fee2e206 100%);border:1px solid #fca5a528"
    >
      <div class="w-1 self-stretch flex-shrink-0 rounded-full" style="background:linear-gradient(to bottom,#f87171,#dc2626)" />
      <div class="flex-1 min-w-0">
        <div class="text-sm font-bold text-red-600">{{ t('result.oom_no_speed_title') }}</div>
        <div class="text-xs text-red-400 leading-snug mt-0.5">{{ t('result.oom_no_speed_desc') }}</div>
      </div>
      <div class="flex flex-col items-end flex-shrink-0">
        <div class="text-2xl font-black leading-none text-red-300 line-through tabular-nums">
          {{ result.singleToks.toFixed(1) }}
        </div>
        <div class="text-xs font-semibold text-red-300 mt-0.5">tok/s</div>
      </div>
    </div>

    <!-- 速度体验评级徽章（仅显存够用时显示） -->
    <div
      v-else-if="speedRating && result"
      class="rounded-xl overflow-hidden flex items-center gap-1"
      :style="{ background: `linear-gradient(135deg, ${speedRating.c1}15 0%, ${speedRating.c2}06 100%)`, border: `1px solid ${speedRating.c1}28` }"
    >
      <div class="w-1 self-stretch flex-shrink-0" :style="{ background: `linear-gradient(to bottom, ${speedRating.c1}, ${speedRating.c2})` }" />

      <!-- 圆形图标徽章 -->
      <div class="flex items-center justify-center px-2 py-2 flex-shrink-0">
        <svg viewBox="0 0 64 56" xmlns="http://www.w3.org/2000/svg" style="width:64px;height:56px">
          <defs>
            <radialGradient :id="`badge-${speedRating.grade}`" cx="35%" cy="30%" r="65%">
              <stop offset="0%" :stop-color="speedRating.c1"/>
              <stop offset="100%" :stop-color="speedRating.c2"/>
            </radialGradient>
            <radialGradient :id="`icon-${speedRating.grade}`" cx="35%" cy="30%" r="65%">
              <stop offset="0%" :stop-color="speedRating.c1"/>
              <stop offset="100%" :stop-color="speedRating.c2"/>
            </radialGradient>
          </defs>

          <!-- 外发光环 -->
          <circle cx="28" cy="28" r="27" :fill="speedRating.c1" opacity="0.15"/>
          <!-- 主圆 -->
          <circle cx="28" cy="28" r="24" :fill="`url(#badge-${speedRating.grade})`"/>
          <!-- 内环描边 -->
          <circle cx="28" cy="28" r="22" fill="none" stroke="white" stroke-width="1" opacity="0.22"/>
          <!-- 高光椭圆 -->
          <ellipse cx="21" cy="18" rx="9" ry="6" fill="white" opacity="0.22"/>
          <!-- 底部阴影 -->
          <ellipse cx="28" cy="50" rx="12" ry="2" fill="black" opacity="0.08"/>
          <!-- 等级字母 -->
          <text x="28" y="37" text-anchor="middle"
            font-size="28" font-weight="900" fill="white"
            font-family="ui-sans-serif, system-ui, sans-serif">{{ speedRating.grade }}</text>

          <!-- 角标圆背景 (右下角叠加) -->
          <circle cx="49" cy="45" r="11" fill="white"/>
          <circle cx="49" cy="45" r="10" :fill="`url(#icon-${speedRating.grade})`"/>
          <circle cx="49" cy="45" r="9" fill="none" stroke="white" stroke-width="0.8" opacity="0.3"/>

          <!-- S：火箭 -->
          <g v-if="speedRating.grade === 'S'" transform="translate(49,45)">
            <g transform="rotate(-40)">
              <ellipse cx="0" cy="0" rx="2.5" ry="5.5" fill="white"/>
              <polygon points="-2.5,3 -4.5,7 0,5" fill="white" opacity="0.85"/>
              <polygon points="2.5,3 4.5,7 0,5" fill="white" opacity="0.85"/>
              <ellipse cx="0" cy="6.5" rx="1.8" ry="2" fill="#fbbf24" opacity="0.9"/>
            </g>
          </g>

          <!-- A：闪电 -->
          <g v-else-if="speedRating.grade === 'A'" transform="translate(49,45)">
            <polygon points="2,-7.5 -4,0.5 0.5,0.5 -2,7.5 5.5,-0.5 1,-0.5" fill="white"/>
          </g>

          <!-- B：速度计（指针偏右，快） -->
          <g v-else-if="speedRating.grade === 'B'" transform="translate(49,47)">
            <path d="M -7,0 A 7,7 0 0,1 7,0" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <line x1="-7" y1="0" x2="-5.5" y2="-1.5" stroke="white" stroke-width="1" opacity="0.6"/>
            <line x1="0" y1="-7" x2="0" y2="-5.5" stroke="white" stroke-width="1" opacity="0.6"/>
            <line x1="7" y1="0" x2="5.5" y2="-1.5" stroke="white" stroke-width="1" opacity="0.6"/>
            <line x1="0" y1="0" x2="4.5" y2="-5" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <circle cx="0" cy="0" r="1.8" fill="white"/>
          </g>

          <!-- C：速度计（指针偏左，慢） -->
          <g v-else-if="speedRating.grade === 'C'" transform="translate(49,47)">
            <path d="M -7,0 A 7,7 0 0,1 7,0" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <line x1="-7" y1="0" x2="-5.5" y2="-1.5" stroke="white" stroke-width="1" opacity="0.6"/>
            <line x1="0" y1="-7" x2="0" y2="-5.5" stroke="white" stroke-width="1" opacity="0.6"/>
            <line x1="7" y1="0" x2="5.5" y2="-1.5" stroke="white" stroke-width="1" opacity="0.6"/>
            <line x1="0" y1="0" x2="-5" y2="-4" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <circle cx="0" cy="0" r="1.8" fill="white"/>
          </g>

          <!-- F：蜗牛 -->
          <g v-else-if="speedRating.grade === 'F'" transform="translate(49,45)">
            <!-- 壳 -->
            <circle cx="2" cy="-2" r="5.5" fill="none" stroke="white" stroke-width="1.8"/>
            <circle cx="2" cy="-2" r="2.5" fill="white" opacity="0.5"/>
            <!-- 身体 -->
            <ellipse cx="-2" cy="4" rx="4.5" ry="2.2" fill="white"/>
            <!-- 头 -->
            <circle cx="-5.5" cy="3" r="2" fill="white"/>
            <!-- 触角 -->
            <line x1="-5.5" y1="1.5" x2="-7.5" y2="-1.5" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
            <line x1="-4.5" y1="1.5" x2="-6" y2="-1.5" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
            <circle cx="-7.5" cy="-1.5" r="1" fill="white"/>
            <circle cx="-6" cy="-1.5" r="1" fill="white"/>
          </g>
        </svg>
      </div>

      <!-- 描述文字 -->
      <div class="flex-1 flex flex-col justify-center py-3 min-w-0">
        <div class="text-xs text-gray-400 leading-snug">{{ speedRating.desc }}</div>
      </div>

      <!-- 速度值 -->
      <div class="flex flex-col items-end justify-center px-4 py-3 flex-shrink-0">
        <div class="text-2xl font-black leading-none tabular-nums" :style="{ color: speedRating.c1 }">
          {{ result.singleToks.toFixed(1) }}
        </div>
        <div class="text-xs font-semibold mt-0.5" :style="{ color: speedRating.c2 }">tok/s</div>
      </div>
    </div>

    <!-- 推理框架选择 -->
    <div>
      <p class="text-xs text-gray-500 mb-2">{{ t('run.framework') }}</p>
      <div class="grid grid-cols-3 sm:grid-cols-5 gap-1 overflow-x-auto">
        <button
          v-for="f in availableFrameworks"
          :key="f.id"
          @click="!props.readonly && f.available && (framework = f)"
          :disabled="!f.available || props.readonly"
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
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-gray-100">
      <!-- Decode -->
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-2">
          {{ t('result.decode') }}
          <TipIcon :text="t('result.decode_tip')" />
        </h3>
        <div v-if="result" class="space-y-1.5">
          <div class="bg-gray-50 rounded-lg px-3 py-2">
            <div class="text-[10px] text-gray-500 mb-0.5">{{ t('result.bw_limit') }}</div>
            <div class="text-sm font-bold text-gray-900">{{ fmtToks(result.bwLimit) }}</div>
          </div>
          <div class="bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-200">
            <div class="text-[10px] text-emerald-700 mb-0.5 flex items-center gap-1">
              {{ t('result.actual') }}
              <TipIcon :text="t('result.actual_tip')" />
            </div>
            <div class="text-base font-bold text-emerald-700">{{ fmtToksRange(result.decodeToksMin, result.decodeToksMax) }}</div>
          </div>
          <div class="bg-gray-50 rounded-lg px-3 py-2">
            <div class="text-[10px] text-gray-500 mb-0.5 flex items-center gap-1">
              {{ t('result.single') }}
              <TipIcon :text="t('result.single_tip')" />
            </div>
            <div class="text-sm font-bold text-gray-900">{{ fmtToksRange(result.singleToksMin, result.singleToksMax) }}</div>
          </div>
          <div class="bg-gray-50 rounded-lg px-3 py-2">
            <div class="text-[10px] text-gray-500 mb-0.5">{{ t('result.kv_read') }}</div>
            <div class="text-sm font-bold text-gray-900">{{ fmtGB(result.kvReadGB) }}</div>
          </div>
          <div class="bg-gray-50 rounded-lg px-3 py-2">
            <div class="text-[10px] text-gray-500 mb-0.5 flex items-center gap-1">
              {{ t('result.tpot') }}
              <TipIcon :text="t('result.tpot_tip')" />
            </div>
            <div class="text-sm font-bold text-gray-900">{{ result.tpot.toFixed(1) }} ms/tok</div>
          </div>
          <div class="bg-gray-50 rounded-lg px-3 py-2">
            <div class="text-[10px] text-gray-500 mb-1 flex items-center gap-1">
              {{ t('result.bw_util') }}
              <TipIcon :text="t('result.bw_util_tip')" />
            </div>
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :style="{ width: Math.min(100, result.decodeToks / result.bwLimit * 100).toFixed(1) + '%', background: '#10b981' }"
                />
              </div>
              <span class="text-sm font-bold text-gray-900 tabular-nums w-10 text-right">{{ (result.decodeToks / result.bwLimit * 100).toFixed(0) }}%</span>
            </div>
          </div>
          <div class="bg-gray-50 rounded-lg px-3 py-2">
            <div class="text-[10px] text-gray-500 mb-0.5 flex items-center gap-1">
              {{ t('result.avg_decode_seq') }}
              <TipIcon :text="t('result.avg_decode_seq_tip')" />
            </div>
            <div class="text-sm font-bold text-gray-900">{{ result.avgDecodeSeqLen.toLocaleString() }} tok</div>
          </div>
          <div v-if="result.tpEfficiency < 1" class="bg-yellow-50 rounded-lg px-3 py-2 border border-yellow-200">
            <div class="text-[10px] text-yellow-700 mb-0.5">{{ t('result.tp_eff') }}</div>
            <div class="text-sm font-bold text-yellow-700">{{ fmtPct(result.tpEfficiency * 100) }}</div>
          </div>
          <div v-if="result.speculativeDecoding" class="bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-200">
            <div class="text-[10px] text-emerald-700 mb-0.5 flex items-center gap-1">
              {{ t('result.speculative_speedup') }}
              <TipIcon :text="t('result.speculative_speedup_tip')" />
            </div>
            <div class="text-sm font-bold text-emerald-700">x{{ result.speculativeSpeedup.toFixed(1) }}</div>
          </div>
        </div>
      </div>

      <!-- Prefill -->
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-2">
          {{ t('result.prefill') }}
          <TipIcon :text="t('result.prefill_tip')" />
        </h3>
        <div v-if="result" class="space-y-1.5">
          <div class="bg-gray-50 rounded-lg px-3 py-2">
            <div class="text-[10px] text-gray-500 mb-0.5">{{ t('result.compute_limit') }}</div>
            <div class="text-sm font-bold text-gray-900">{{ fmtToks(result.computeLimit) }}</div>
          </div>
          <div class="bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-200">
            <div class="text-[10px] text-emerald-700 mb-0.5">{{ t('result.actual') }}</div>
            <div class="text-base font-bold text-emerald-700">{{ fmtToksRange(result.prefillToksMin, result.prefillToksMax) }}</div>
          </div>
          <div class="bg-gray-50 rounded-lg px-3 py-2">
            <div class="text-[10px] text-gray-500 mb-0.5">{{ t('result.flash_factor') }}</div>
            <div class="text-sm font-bold text-gray-900">x{{ result.flashFactorMin.toFixed(1) }} - x{{ result.flashFactorMax.toFixed(1) }}</div>
          </div>
          <div class="bg-gray-50 rounded-lg px-3 py-2">
            <div class="text-[10px] text-gray-500 mb-0.5">{{ t('result.attention_factor') }}</div>
            <div class="text-sm font-bold text-gray-900">x{{ result.prefillAttentionFactor.toFixed(2) }}</div>
          </div>
          <div class="bg-gray-50 rounded-lg px-3 py-2">
            <div class="text-[10px] text-gray-500 mb-0.5">{{ t('result.effective_prompt') }}</div>
            <div class="text-sm font-bold text-gray-900">{{ result.effectivePromptLen }} tok</div>
          </div>
          <div class="bg-gray-50 rounded-lg px-3 py-2">
            <div class="text-[10px] text-gray-500 mb-0.5">{{ t('result.bottleneck') }}</div>
            <div :class="result.bottleneck === 'bandwidth' ? 'text-orange-600' : 'text-emerald-700'" class="text-sm font-bold">
              {{ t('result.' + result.bottleneck) }}
            </div>
          </div>
          <div class="bg-gray-50 rounded-lg px-3 py-2">
            <div class="text-[10px] text-gray-500 mb-0.5">{{ t('result.roofline') }}</div>
            <div class="text-sm font-bold text-gray-900">{{ result.roofline.toFixed(2) }}</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
