<script setup>
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { QUANT_MAP } from '../../data/constants.js'
import { KV_CACHE_MAP, PREFIX_CACHE_OPTIONS, PCIE_BW_OPTIONS } from '../../data/runtime.js'
import { fmtCtx } from '../../utils/format.js'
import TipIcon from '../ui/TipIcon.vue'

const { t } = useI18n()

const props = defineProps({
  model: { type: Object, default: null },
  framework: { type: Object, default: null },
  gpuCount: { type: Number, default: 1 },
})

const quant = defineModel('quant', { required: true })
const ctx = defineModel('ctx', { required: true })
const batch = defineModel('batch', { required: true })
const promptLen = defineModel('promptLen', { required: true })
const outputLen = defineModel('outputLen', { required: true })
const flashAttention = defineModel('flashAttention', { required: true })
const kvCacheQuant = defineModel('kvCacheQuant', { required: true })
const prefixCacheHit = defineModel('prefixCacheHit', { required: true })
const cpuOffload = defineModel('cpuOffload', { required: true })
const pcieBw = defineModel('pcieBw', { required: true })
const speculativeDecoding = defineModel('speculativeDecoding', { required: true })
const acceptanceRate = defineModel('acceptanceRate', { required: true })
const draftLen = defineModel('draftLen', { required: true })
const ppCount = defineModel('ppCount', { required: true })
const imageCount = defineModel('imageCount', { required: true })

// PP 显示条件：至少 2 张卡且模型参数 >= 30B
const ppSupported = computed(() => props.gpuCount >= 2 && (props.model?.params ?? 0) >= 30)
// 隐藏 PP 控件时自动重置为 1
watch(ppSupported, (v) => { if (!v) ppCount.value = 1 })
const speculativeSupported = computed(() => {
  const supportedFrameworks = ['vllm', 'trtllm']
  return supportedFrameworks.includes(props.framework?.id)
})

// 当切换到不支持的框架时，自动关闭 Speculative Decoding
watch(() => props.framework, (newFramework) => {
  if (newFramework && !speculativeSupported.value && speculativeDecoding.value) {
    speculativeDecoding.value = false
  }
})

const BASE_CTX_OPTIONS = [512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 10485760]
const BATCH_OPTIONS = [1, 2, 4, 8, 16, 32, 64, 128, 256]

const ctxOptions = computed(() => {
  const maxCtx = props.model?.max_ctx
  if (!maxCtx) return BASE_CTX_OPTIONS
  const filtered = BASE_CTX_OPTIONS.filter(v => v <= maxCtx)
  if (filtered.length === 0 || filtered[filtered.length - 1] !== maxCtx) {
    filtered.push(maxCtx)
  }
  return filtered
})
</script>

<template>
  <section class="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
    <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">{{ t('run.title') }}</h2>

    <!-- 量化精度 -->
    <div>
      <label class="flex items-center gap-1 text-xs text-gray-500 mb-2">{{ t('run.quant') }}<TipIcon :text="t('run.quant_tip')" /></label>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="q in QUANT_MAP"
          :key="q.id"
          @click="quant = q"
          :class="[
            'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors',
            quant.id === q.id
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
          ]"
        >
          {{ q.label }}
        </button>
      </div>
    </div>

    <!-- 上下文长度 -->
    <div>
      <label class="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span class="flex items-center gap-1">{{ t('run.ctx') }}<TipIcon :text="t('run.ctx_tip')" /></span>
        <span class="text-emerald-700 font-medium">{{ fmtCtx(ctx) }}</span>
      </label>
      <select
        :value="ctx"
        @change="ctx = Number($event.target.value)"
        class="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        <option v-for="v in ctxOptions" :key="v" :value="v">{{ fmtCtx(v) }}</option>
      </select>
    </div>

    <!-- 并发数 -->
    <div>
      <label class="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span class="flex items-center gap-1">{{ t('run.batch') }}<TipIcon :text="t('run.batch_tip')" /></span>
        <span class="text-emerald-700 font-medium">{{ batch }}</span>
      </label>
      <div class="flex gap-1.5 flex-wrap">
        <button
          v-for="n in BATCH_OPTIONS"
          :key="n"
          @click="batch = n"
          :class="[
            'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
            batch === n
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
          ]"
        >{{ n }}</button>
      </div>
    </div>

    <!-- Prompt / Output 长度 -->
    <div class="grid grid-cols-1 gap-3">
      <div>
        <label class="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span class="flex items-center gap-1">{{ t('run.prompt') }}<TipIcon :text="t('run.prompt_tip')" /></span>
          <span class="text-emerald-700">{{ promptLen }}</span>
        </label>
        <input
          v-model.number="promptLen"
          type="number"
          min="1"
          step="64"
          class="w-full bg-gray-50 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <div>
        <label class="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span class="flex items-center gap-1">{{ t('run.output') }}<TipIcon :text="t('run.output_tip')" /></span>
          <span class="text-emerald-700">{{ outputLen }}</span>
        </label>
        <input
          v-model.number="outputLen"
          type="number"
          min="1"
          step="64"
          class="w-full bg-gray-50 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>
    </div>

    <!-- Attention / KV / Prefix -->
    <div class="space-y-3 pt-1 border-t border-gray-100">
      <div>
        <label class="flex items-center gap-1 text-xs text-gray-500 mb-2">{{ t('run.flash_attention') }}<TipIcon :text="t('run.flash_attention_tip')" /></label>
        <div class="grid grid-cols-2 gap-1.5">
          <button
            @click="flashAttention = true"
            :class="[
              'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              flashAttention
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
            ]"
          >{{ t('run.enabled') }}</button>
          <button
            @click="flashAttention = false"
            :class="[
              'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              !flashAttention
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
            ]"
          >{{ t('run.disabled') }}</button>
        </div>
      </div>

      <div>
        <label class="flex items-center gap-1 text-xs text-gray-500 mb-2">{{ t('run.kv_cache_quant') }}<TipIcon :text="t('run.kv_cache_quant_tip')" /></label>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="option in KV_CACHE_MAP"
            :key="option.id"
            @click="kvCacheQuant = option"
            :class="[
              'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              kvCacheQuant.id === option.id
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
            ]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div>
        <label class="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span class="flex items-center gap-1">{{ t('run.prefix_cache') }}<TipIcon :text="t('run.prefix_cache_tip')" /></span>
          <span class="text-emerald-700 font-medium">{{ prefixCacheHit }}%</span>
        </label>
        <div class="flex gap-1.5 flex-wrap">
          <button
            v-for="n in PREFIX_CACHE_OPTIONS"
            :key="n"
            @click="prefixCacheHit = n"
            :class="[
              'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
              prefixCacheHit === n
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
            ]"
          >{{ n }}%</button>
        </div>
      </div>

      <!-- MoE CPU Offload -->
      <div v-if="props.model?.type === 'moe'">
        <label class="flex items-center gap-1 text-xs text-gray-500 mb-2">
          {{ t('run.cpu_offload') }}<TipIcon :text="t('run.cpu_offload_tip')" />
        </label>
        <div class="grid grid-cols-2 gap-1.5 mb-2">
          <button
            @click="cpuOffload = true"
            :class="[
              'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              cpuOffload
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
            ]"
          >{{ t('run.enabled') }}</button>
          <button
            @click="cpuOffload = false"
            :class="[
              'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              !cpuOffload
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
            ]"
          >{{ t('run.disabled') }}</button>
        </div>
        <template v-if="cpuOffload">
          <label class="flex items-center gap-1 text-xs text-gray-500 mb-2">{{ t('run.pcie_bw') }}<TipIcon :text="t('run.pcie_bw_tip')" /></label>
          <div class="flex gap-1.5 flex-wrap">
            <button
              v-for="option in PCIE_BW_OPTIONS"
              :key="option.id"
              @click="pcieBw = option"
              :class="[
                'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                pcieBw.id === option.id
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
              ]"
            >
              {{ option.label }} <span class="opacity-70">({{ option.bw }} GB/s)</span>
            </button>
          </div>
        </template>
      </div>

      <!-- Speculative Decoding -->
      <div>
        <label class="flex items-center gap-1 text-xs text-gray-500 mb-2">
          {{ t('run.speculative_decoding') }}<TipIcon :text="t('run.speculative_decoding_tip')" />
          <span v-if="!speculativeSupported" class="text-red-600 text-[10px] ml-1">({{ t('run.framework_not_supported') }})</span>
        </label>
        <div class="grid grid-cols-2 gap-1.5 mb-2">
          <button
            @click="speculativeDecoding = true"
            :disabled="!speculativeSupported"
            :class="[
              'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              !speculativeSupported
                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                : speculativeDecoding
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
            ]"
          >{{ t('run.enabled') }}</button>
          <button
            @click="speculativeDecoding = false"
            :disabled="!speculativeSupported"
            :class="[
              'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              !speculativeSupported
                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                : !speculativeDecoding
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
            ]"
          >{{ t('run.disabled') }}</button>
        </div>
        <template v-if="speculativeDecoding && speculativeSupported">
          <div class="space-y-2">
            <div>
              <label class="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span class="flex items-center gap-1">{{ t('run.acceptance_rate') }}<TipIcon :text="t('run.acceptance_rate_tip')" /></span>
                <span class="text-emerald-700 font-medium">{{ (acceptanceRate * 100).toFixed(0) }}%</span>
              </label>
              <input
                type="range"
                v-model.number="acceptanceRate"
                min="0.3"
                max="0.9"
                step="0.05"
                class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
            <div>
              <label class="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span class="flex items-center gap-1">{{ t('run.draft_len') }}<TipIcon :text="t('run.draft_len_tip')" /></span>
                <span class="text-emerald-700 font-medium">{{ draftLen }} tok</span>
              </label>
              <input
                type="range"
                v-model.number="draftLen"
                min="2"
                max="8"
                step="1"
                class="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
            <div class="text-xs text-emerald-700 bg-emerald-50 rounded px-2 py-1.5 border border-emerald-200">
              {{ t('run.speculative_speedup', { speedup: (1 + acceptanceRate * draftLen).toFixed(1) }) }}
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Pipeline Parallel -->
    <div class="pt-1 border-t border-gray-100">
      <label class="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span class="flex items-center gap-1">
          {{ t('run.pp_count') }}<TipIcon :text="t('run.pp_count_tip')" />
          <span v-if="!ppSupported" class="text-orange-500 text-[10px] ml-1">({{ t('run.pp_not_applicable') }})</span>
        </span>
        <span class="text-emerald-700 font-medium">PP{{ ppCount }}</span>
      </label>
      <div class="flex gap-1.5 flex-wrap">
        <button
          v-for="n in [1, 2, 4, 8, 16]"
          :key="n"
          @click="ppCount = n"
          :disabled="!ppSupported && n > 1"
          :class="[
            'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
            !ppSupported && n > 1
              ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
              : ppCount === n
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
          ]"
        >PP{{ n }}</button>
      </div>
    </div>

    <!-- Vision Image Count (only for multimodal models) -->
    <div v-if="props.model?.vision_seq_tokens" class="pt-1 border-t border-gray-100">
      <label class="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span class="flex items-center gap-1">{{ t('run.image_count') }}<TipIcon :text="t('run.image_count_tip')" /></span>
        <span class="text-emerald-700 font-medium">{{ imageCount }} {{ t('run.images') }}</span>
      </label>
      <div class="flex gap-1.5 flex-wrap">
        <button
          v-for="n in [0, 1, 2, 4, 8]"
          :key="n"
          @click="imageCount = n"
          :class="[
            'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
            imageCount === n
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
          ]"
        >{{ n === 0 ? t('run.no_image') : n }}</button>
      </div>
      <p v-if="imageCount > 0" class="text-xs text-purple-600 bg-purple-50 rounded px-2 py-1.5 border border-purple-200 mt-2">
        {{ t('run.vision_patch_info', { tokens: (props.model.vision_seq_tokens * imageCount).toLocaleString(), per: props.model.vision_seq_tokens }) }}
      </p>
    </div>
  </section>
</template>
