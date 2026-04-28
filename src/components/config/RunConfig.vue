<script setup>
import { useI18n } from 'vue-i18n'
import { QUANT_MAP } from '../../data/constants.js'
import { KV_CACHE_MAP, PREFIX_CACHE_OPTIONS, PCIE_BW_OPTIONS } from '../../data/runtime.js'
import { fmtCtx } from '../../utils/format.js'
import TipIcon from '../ui/TipIcon.vue'

const { t } = useI18n()

const props = defineProps({
  model: { type: Object, default: null },
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

import { computed } from 'vue'

const BASE_CTX_OPTIONS = [512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 2097152, 4194304, 10485760]
const BATCH_OPTIONS = [1, 2, 4, 8, 16, 32, 64, 128]

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
                ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
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
                  ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
              ]"
            >
              {{ option.label }} <span class="opacity-70">({{ option.bw }} GB/s)</span>
            </button>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
