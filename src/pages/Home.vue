<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import TopBar from '../components/layout/TopBar.vue'
import TwoColumn from '../components/layout/TwoColumn.vue'
import ScrollingNotice from '../components/ui/ScrollingNotice.vue'
import GpuConfig from '../components/config/GpuConfig.vue'
import ModelPicker from '../components/config/ModelPicker.vue'
import RunConfig from '../components/config/RunConfig.vue'
import ResultPanel from '../components/result/ResultPanel.vue'
import { GPU_LIST } from '../data/gpus/index.js'
import { ALL_MODELS } from '../data/models/index.js'
import { QUANT_MAP, INTERCONNECT_MAP, FRAMEWORK_MAP } from '../data/constants.js'
import { KV_CACHE_MAP, PCIE_BW_OPTIONS, CPU_MEM_BW_OPTIONS } from '../data/runtime.js'
import { calcAll, calcBatchSweep, aggregateGpuSlots } from '../utils/calc.js'
import { readUrlState, resolveUrlState, watchUrlState } from '../utils/useUrlState.js'

const { t } = useI18n()
const _url = resolveUrlState(readUrlState())
const defaultModel = ALL_MODELS.find(m => m.id === 'qwen3_6_35b_a3b') ?? ALL_MODELS[0]

const gpuSlots       = ref(_url.gpuSlots     ?? [{ gpu: GPU_LIST.find(g => g.id === 'h100_sxm') ?? GPU_LIST[0], count: 1 }])
const gpuCount       = computed(() => gpuSlots.value.reduce((s, g) => s + g.count, 0))
const interconnect   = ref(_url.interconnect ?? INTERCONNECT_MAP[0])
const model          = ref(_url.model        ?? defaultModel)
const quant          = ref(_url.quant        ?? QUANT_MAP.find(q => q.id === 'bf16'))
const ctx            = ref(_url.ctx          ?? Math.min(model.value?.max_ctx ?? 16384, 16384))
const batch          = ref(_url.batch        ?? 1)
const promptLen      = ref(_url.promptLen    ?? 1024)
const outputLen      = ref(_url.outputLen    ?? 1024)
const framework      = ref(_url.framework    ?? FRAMEWORK_MAP.find(f => f.id === 'theory'))
const flashAttention = ref(_url.flashAttention ?? true)
const kvCacheQuant   = ref(_url.kvCacheQuant ?? KV_CACHE_MAP[0])
const prefixCacheHit = ref(_url.prefixCacheHit ?? 0)
// 共享内存（iGPU 专用）
const sharedVram     = ref(_url.sharedVram    ?? 16)
// 只有 MoE 模型放不下显存时（INT4 权重 > 可用显存）才自动开启 CPU 卸载
function needsCpuOffload(m, g, n) {
  if (!m || m.type !== 'moe' || !m.active_params) return false
  const weightGB = m.params * 0.5  // INT4 bytes per param
  const totalVram = (g?.vram ?? 0) * (n ?? 1) * (g?.usableRatio ?? 1.0)
  return weightGB > totalVram
}
const cpuOffload     = ref(_url.cpuOffload   ?? needsCpuOffload(model.value, gpuSlots.value[0]?.gpu, gpuCount.value))
const pcieBw         = ref(_url.pcieBw       ?? PCIE_BW_OPTIONS[1])
const pureCpu        = ref(_url.pureCpu      ?? false)
const cpuMemBw       = ref(_url.cpuMemBw     ?? CPU_MEM_BW_OPTIONS[3])  // 默认 DDR5-4800

// 共享内存 iGPU：用用户设置的共享内存大小覆盖 vram=0
const effectiveGpu = computed(() => {
  const slots = gpuSlots.value.map(s => {
    let g = s.gpu
    if (g?.sharedMemory && g?.vram === 0) g = { ...g, vram: sharedVram.value }
    return { ...s, gpu: g }
  })
  return slots.length === 1 ? slots[0].gpu : aggregateGpuSlots(slots)
})
const speculativeDecoding = ref(_url.speculativeDecoding ?? false)
const acceptanceRate = ref(_url.acceptanceRate ?? 0.7)
const draftLen       = ref(_url.draftLen       ?? 4)
const ppCount        = ref(_url.ppCount        ?? 1)
const imageCount     = ref(_url.imageCount     ?? 0)

// 双列对比模式
const pinnedResult = ref(null)
const pinnedConfig = ref(null)

function pinCurrentResult() {
  if (!result.value) return
  pinnedResult.value = { ...result.value }
  pinnedConfig.value = {
    gpu: effectiveGpu.value,
    gpuCount: gpuCount.value,
    model: model.value,
    quant: quant.value,
    framework: framework.value,
    ctx: ctx.value,
    batch: batch.value,
  }
}

function unpinResult() {
  pinnedResult.value = null
  pinnedConfig.value = null
}

watch(model, (m, prev) => {
  if (m?.max_ctx) ctx.value = Math.min(m.max_ctx, 16384)
  // MoE 模型：仅在放不下显存时才自动开启 CPU 卸载；能放下则关闭；切换到非 MoE 时关闭
  if (m?.type === 'moe' && m?.active_params) {
    cpuOffload.value = needsCpuOffload(m, effectiveGpu.value, gpuCount.value)
  } else if (prev?.type === 'moe') {
    cpuOffload.value = false
  }
})

watch(() => gpuSlots.value[0]?.gpu, (g) => {
  if (g?.vendor === 'apple') {
    const metal = FRAMEWORK_MAP.find(f => f.id === 'llamacpp_metal')
    if (metal) framework.value = metal
  }
})

watchUrlState({ gpuSlots, interconnect, model, quant, ctx, batch,
  promptLen, outputLen, framework, flashAttention, kvCacheQuant,
  prefixCacheHit, cpuOffload, pcieBw, pureCpu, cpuMemBw,
  speculativeDecoding, acceptanceRate, draftLen, ppCount, imageCount, sharedVram })

const result = computed(() => {
  if (!effectiveGpu.value || !model.value || !quant.value || !framework.value) return null
  try {
    return { ...calcAll({
      gpu: effectiveGpu.value, gpuCount: gpuCount.value, interconnect: interconnect.value,
      model: model.value, quant: quant.value, ctx: ctx.value, batch: batch.value,
      promptLen: promptLen.value, outputLen: outputLen.value, framework: framework.value,
      flashAttention: flashAttention.value, kvCacheQuant: kvCacheQuant.value,
      prefixCacheHit: prefixCacheHit.value, cpuOffload: cpuOffload.value, pcieBw: pcieBw.value,
      pureCpu: pureCpu.value, cpuMemBw: cpuMemBw.value,
      speculativeDecoding: speculativeDecoding.value, acceptanceRate: acceptanceRate.value, draftLen: draftLen.value,
      ppCount: ppCount.value,
      imageCount: imageCount.value,
    }), quantId: quant.value.id }
  } catch (e) {
    if (import.meta.env.DEV) console.error('[calcAll error]', e)
    return null
  }
})

const quantMatrix = computed(() => {
  if (!effectiveGpu.value || !model.value || !framework.value) return []
  return QUANT_MAP.map(q => {
    try {
      const r = calcAll({
        gpu: effectiveGpu.value, gpuCount: gpuCount.value, interconnect: interconnect.value,
        model: model.value, quant: q, ctx: ctx.value, batch: batch.value,
        promptLen: promptLen.value, outputLen: outputLen.value, framework: framework.value,
        flashAttention: flashAttention.value, kvCacheQuant: kvCacheQuant.value,
        prefixCacheHit: prefixCacheHit.value, cpuOffload: cpuOffload.value, pcieBw: pcieBw.value,
        pureCpu: pureCpu.value, cpuMemBw: cpuMemBw.value,
        speculativeDecoding: speculativeDecoding.value, acceptanceRate: acceptanceRate.value, draftLen: draftLen.value,
        ppCount: ppCount.value,
      })
      // 当前行 OOM 且未开启 CPU 卸载时，额外计算"启用卸载后能否容纳"
      let cpuOffloadFeasible = false
      let offloadVramGB = null
      if (!r.vramOk && !cpuOffload.value && model.value?.type === 'moe' && model.value?.active_params) {
        try {
          const fallbackPcie = pcieBw.value ?? INTERCONNECT_MAP.find(x => x.id === 'pcie4')
          const ro = calcAll({
            gpu: effectiveGpu.value, gpuCount: gpuCount.value, interconnect: interconnect.value,
            model: model.value, quant: q, ctx: ctx.value, batch: batch.value,
            promptLen: promptLen.value, outputLen: outputLen.value, framework: framework.value,
            flashAttention: flashAttention.value, kvCacheQuant: kvCacheQuant.value,
            prefixCacheHit: prefixCacheHit.value, cpuOffload: true, pcieBw: fallbackPcie,
            pureCpu: false, cpuMemBw: cpuMemBw.value,
            speculativeDecoding: speculativeDecoding.value, acceptanceRate: acceptanceRate.value, draftLen: draftLen.value,
            ppCount: ppCount.value,
          })
          cpuOffloadFeasible = ro.vramOk
          offloadVramGB = ro.totalNeeded
        } catch { /* ignore */ }
      }
      return { quant: q, vramGB: r.totalNeeded, vramOk: r.vramOk, vramPct: r.vramPct, decodeToks: r.decodeToks, cpuOffloadFeasible, offloadVramGB }
    } catch { return null }
  }).filter(Boolean)
})

// 固定列的量化对比矩阵
const pinnedQuantMatrix = computed(() => {
  if (!pinnedConfig.value) return []
  const config = pinnedConfig.value
  return QUANT_MAP.map(q => {
    try {
      const r = calcAll({
        gpu: config.gpu, gpuCount: config.gpuCount, interconnect: interconnect.value,
        model: config.model, quant: q, ctx: ctx.value, batch: batch.value,
        promptLen: promptLen.value, outputLen: outputLen.value, framework: config.framework,
        flashAttention: flashAttention.value, kvCacheQuant: kvCacheQuant.value,
        prefixCacheHit: prefixCacheHit.value, cpuOffload: cpuOffload.value, pcieBw: pcieBw.value,
        speculativeDecoding: speculativeDecoding.value, acceptanceRate: acceptanceRate.value, draftLen: draftLen.value,
        ppCount: ppCount.value,
      })
      return { quant: q, vramGB: r.totalNeeded, vramOk: r.vramOk, vramPct: r.vramPct, decodeToks: r.decodeToks }
    } catch { return null }
  }).filter(Boolean)
})

const pinnedBatchSweepData = computed(() => {
  if (!pinnedConfig.value) return []
  const c = pinnedConfig.value
  return calcBatchSweep({
    gpu: c.gpu, gpuCount: c.gpuCount, model: c.model, quant: c.quant,
    ctx: c.ctx, batch: c.batch, framework: c.framework,
    interconnect: interconnect.value,
    promptLen: promptLen.value, outputLen: outputLen.value,
    flashAttention: flashAttention.value, kvCacheQuant: kvCacheQuant.value,
    prefixCacheHit: prefixCacheHit.value, cpuOffload: cpuOffload.value,
    pcieBw: pcieBw.value, speculativeDecoding: speculativeDecoding.value,
    acceptanceRate: acceptanceRate.value, draftLen: draftLen.value,
    ppCount: ppCount.value, imageCount: imageCount.value,
  })
})

const batchSweepData = computed(() => {
  if (!effectiveGpu.value || !model.value || !quant.value) return []
  return calcBatchSweep({
    gpu: effectiveGpu.value,
    gpuCount: gpuCount.value,
    interconnect: interconnect.value,
    model: model.value,
    quant: quant.value,
    ctx: ctx.value,
    promptLen: promptLen.value,
    outputLen: outputLen.value,
    framework: framework.value,
    flashAttention: flashAttention.value,
    kvCacheQuant: kvCacheQuant.value,
    prefixCacheHit: prefixCacheHit.value,
    cpuOffload: cpuOffload.value,
    pcieBw: pcieBw.value,
    pureCpu: pureCpu.value,
    cpuMemBw: cpuMemBw.value,
    speculativeDecoding: speculativeDecoding.value,
    acceptanceRate: acceptanceRate.value,
    draftLen: draftLen.value,
    ppCount: ppCount.value,
    imageCount: imageCount.value,
  })
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 overflow-x-hidden pt-12 sm:pt-14 pb-20 sm:pb-0">
    <TopBar
      :result="result" :model="model" :gpu="effectiveGpu" :gpu-count="gpuCount"
      :interconnect="interconnect" :quant="quant" :framework="framework"
      :ctx="ctx" :batch="batch" :prompt-len="promptLen" :output-len="outputLen"
      :flash-attention="flashAttention" :kv-cache-quant="kvCacheQuant"
      :prefix-cache-hit="prefixCacheHit" :cpu-offload="cpuOffload" :pcie-bw="pcieBw"
    />
    <ScrollingNotice />
    <TwoColumn>
      <template #config>
        <GpuConfig v-model:gpuSlots="gpuSlots" v-model:interconnect="interconnect" v-model:sharedVram="sharedVram" />
        <ModelPicker v-model:model="model" />
        <RunConfig
          v-model:quant="quant" v-model:ctx="ctx" v-model:batch="batch"
          v-model:promptLen="promptLen" v-model:outputLen="outputLen"
          v-model:flashAttention="flashAttention" v-model:kvCacheQuant="kvCacheQuant"
          v-model:prefixCacheHit="prefixCacheHit" v-model:cpuOffload="cpuOffload"
          v-model:pcieBw="pcieBw" v-model:pureCpu="pureCpu" v-model:cpuMemBw="cpuMemBw"
          :model="model" :framework="framework" :gpuCount="gpuCount"
          v-model:speculativeDecoding="speculativeDecoding"
          v-model:acceptanceRate="acceptanceRate" v-model:draftLen="draftLen"
          v-model:ppCount="ppCount" v-model:imageCount="imageCount"
        />
      </template>
      <template #result>
        <div v-if="pinnedResult" class="space-y-4">
          <!-- 双列对比模式 -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
            <div class="flex items-start gap-2.5 min-w-0">
              <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span class="text-sm font-semibold text-blue-900">{{ t('result.compare_mode_active') }}</span>
                <p class="text-xs text-blue-600/80 mt-0.5 leading-relaxed">{{ t('result.compare_mode_hint') }}</p>
              </div>
            </div>
            <button
              @click="unpinResult"
              class="text-xs px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-300 transition-colors flex-shrink-0"
            >
              {{ t('result.unpin') }}
            </button>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- 固定列 (ref) -->
            <div class="rounded-xl border-2 border-blue-300 overflow-hidden">
              <div class="bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {{ t('result.pinned_config') }}
              </div>
              <div class="bg-blue-50/60 p-3">
                <ResultPanel
                  compact
                  readonly
                  :result="pinnedResult"
                  :model="pinnedConfig.model"
                  :quant-matrix="pinnedQuantMatrix"
                  :gpu-vendor="pinnedConfig.gpu.vendor"
                  :gpu="pinnedConfig.gpu"
                  :gpu-count="pinnedConfig.gpuCount"
                  :sweep-data="pinnedBatchSweepData"
                  :current-batch="pinnedConfig.batch"
                  v-model:framework="pinnedConfig.framework"
                  v-model:quant="pinnedConfig.quant"
                />
              </div>
            </div>
            <!-- 当前列 (current) -->
            <div class="rounded-xl border-2 border-emerald-400 overflow-hidden">
              <div class="bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {{ t('result.current_config') }}
              </div>
              <div class="bg-emerald-50/60 p-3">
                <ResultPanel
                  compact
                  :result="result"
                  :model="model"
                  :quant-matrix="quantMatrix"
                  :gpu-vendor="effectiveGpu?.vendor"
                  :gpu="effectiveGpu"
                  :gpu-count="gpuCount"
                  :sweep-data="batchSweepData"
                  :current-batch="batch"
                  v-model:framework="framework"
                  v-model:quant="quant"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="space-y-4">
          <!-- 单列模式 + 固定按钮（仅桌面端显示） -->
          <div v-if="result" class="hidden sm:flex justify-end">
            <button
              @click="pinCurrentResult"
              class="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {{ t('result.pin_current') }}
            </button>
          </div>
          <ResultPanel
            :result="result"
            :model="model"
            :quant-matrix="quantMatrix"
            :gpu-vendor="effectiveGpu?.vendor"
            :gpu="effectiveGpu"
            :gpu-count="gpuCount"
            :sweep-data="batchSweepData"
            :current-batch="batch"
            v-model:framework="framework"
            v-model:quant="quant"
          />
        </div>
      </template>
    </TwoColumn>
  </div>
</template>
