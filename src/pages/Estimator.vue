<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
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
import { KV_CACHE_MAP, PCIE_BW_OPTIONS, CPU_MEM_BW_OPTIONS, PCIE_WIDTH_OPTIONS } from '../data/runtime.js'
import { calcAll, calcBatchSweep, aggregateGpuSlots, getQuantBytes } from '../utils/calc.js'
import { readUrlState, resolveUrlState, watchUrlState } from '../utils/useUrlState.js'
import { currentLangParam } from '../utils/lang.js'

const { t } = useI18n()
const router = useRouter()
const _url = resolveUrlState(readUrlState())
const defaultModel = ALL_MODELS.find(m => m.id === 'qwen38_27b') ?? ALL_MODELS[0]
const defaultGpu = GPU_LIST.find(g => g.id === 'rtx4090') ?? GPU_LIST[0]
// 产品默认：NVIDIA → vllm，Apple → mlx；theory 仍可选
function defaultFrameworkForGpu(gpu) {
  if (gpu?.vendor === 'apple') return FRAMEWORK_MAP.find(f => f.id === 'mlx') ?? FRAMEWORK_MAP.find(f => f.id === 'vllm')
  return FRAMEWORK_MAP.find(f => f.id === 'vllm') ?? FRAMEWORK_MAP.find(f => f.id !== 'theory')
}
const PROMPT_LEN_MAX = 262144
const OUTPUT_LEN_MAX = 131072
function clampPromptLen(v, ctxLen) {
  const cap = Math.min(PROMPT_LEN_MAX, Math.max(1, ctxLen ?? PROMPT_LEN_MAX))
  return Math.max(1, Math.min(cap, Number(v) || 1))
}
function clampOutputLen(v) {
  return Math.max(1, Math.min(OUTPUT_LEN_MAX, Number(v) || 1))
}

const gpuSlots       = ref(_url.gpuSlots     ?? [{ gpu: defaultGpu, count: 1 }])
const gpuCount       = computed(() => gpuSlots.value.reduce((s, g) => s + g.count, 0))
const interconnect   = ref(_url.interconnect ?? INTERCONNECT_MAP[0])
const model          = ref(_url.model        ?? defaultModel)
const quant          = ref(_url.quant        ?? QUANT_MAP.find(q => q.id === 'bf16'))
const ctx            = ref(_url.ctx          ?? Math.min(model.value?.max_ctx ?? 16384, 16384))
const batch          = ref(_url.batch        ?? 1)
const promptLen      = ref(clampPromptLen(_url.promptLen ?? 1024, ctx.value))
const outputLen      = ref(clampOutputLen(_url.outputLen ?? 1024))
const framework      = ref(_url.framework    ?? defaultFrameworkForGpu(gpuSlots.value[0]?.gpu))
const flashAttention = ref(_url.flashAttention ?? true)
const kvCacheQuant   = ref(_url.kvCacheQuant ?? KV_CACHE_MAP[0])
const prefixCacheHit = ref(_url.prefixCacheHit ?? 0)
// 共享内存（iGPU 专用）
const sharedVram     = ref(_url.sharedVram    ?? 16)

// 共享内存 iGPU：用用户设置的共享内存大小覆盖 vram=0
const effectiveGpu = computed(() => {
  const slots = gpuSlots.value.map(s => {
    let g = s.gpu
    if (g?.sharedMemory && g?.vram === 0) g = { ...g, vram: sharedVram.value }
    return { ...s, gpu: g }
  })
  return slots.length === 1 ? slots[0].gpu : aggregateGpuSlots(slots)
})

// 只有 MoE 模型放不下显存时才自动开启 CPU 卸载。
// 按当前量化（含 GGUF/Apple 口径）的实际权重体积判断，而不是写死 INT4。
function needsCpuOffload(m, g, n, q, fw) {
  if (!m || m.type !== 'moe' || !m.active_params) return false
  const weightGB = m.params * getQuantBytes(q, g, fw)
  const totalVram = (g?.vram ?? 0) * (n ?? 1) * (g?.usableRatio ?? 1.0)
  return weightGB > totalVram
}
const cpuOffload     = ref(_url.cpuOffload   ?? needsCpuOffload(model.value, effectiveGpu.value, gpuCount.value, quant.value, framework.value))
const pcieBw         = ref(_url.pcieBw       ?? PCIE_BW_OPTIONS[1])
const pcieWidth      = ref(_url.pcieWidth     ?? PCIE_WIDTH_OPTIONS[1])  // 默认 x8
const pureCpu        = ref(_url.pureCpu      ?? false)
const cpuMemBw       = ref(_url.cpuMemBw     ?? CPU_MEM_BW_OPTIONS[3])  // 默认 DDR5-4800
const sysRam         = ref(_url.sysRam       ?? 64)  // 默认 64 GB
const speculativeDecoding = ref(_url.speculativeDecoding ?? false)
const acceptanceRate = ref(_url.acceptanceRate ?? 0.7)
const draftLen       = ref(_url.draftLen       ?? 4)
const draftModelParams = ref(_url.draftModelParams ?? null)
const ppCount        = ref(_url.ppCount        ?? 1)
const epCount        = ref(_url.epCount        ?? 1)
const imageCount     = ref(_url.imageCount     ?? 0)
const nglCount       = ref(_url.nglCount       ?? null)

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
    // 快照所有运行参数，固定列不再引用实时 ref
    ctx: ctx.value,
    batch: batch.value,
    interconnect: interconnect.value,
    cpuOffload: cpuOffload.value,
    pcieBw: pcieBw.value,
    pcieWidth: pcieWidth.value,
    flashAttention: flashAttention.value,
    kvCacheQuant: kvCacheQuant.value,
    prefixCacheHit: prefixCacheHit.value,
    speculativeDecoding: speculativeDecoding.value,
    acceptanceRate: acceptanceRate.value,
    draftLen: draftLen.value,
    draftModelParams: draftModelParams.value,
    ppCount: ppCount.value,
    epCount: epCount.value,
    imageCount: imageCount.value,
    promptLen: promptLen.value,
    outputLen: outputLen.value,
    nglCount: nglCount.value,
    sysRam: sysRam.value,
    pureCpu: pureCpu.value,
    cpuMemBw: cpuMemBw.value,
  }
}

function unpinResult() {
  pinnedResult.value = null
  pinnedConfig.value = null
}

function goToUpgrade() {
  if (!result.value || !effectiveGpu.value || !model.value || !quant.value) return
  
  // 构建升级模式的 URL 参数
  const query = {
    upgrade: '1',
    gpus: gpuSlots.value.map(s => `${s.gpu.id}:${s.count}`).join(','),
    model: model.value.id,
    quant: quant.value.id,
    target: Math.ceil(result.value.singleToks * 1.5), // 目标速度：当前速度的 1.5 倍
    ctx: ctx.value,
    b: batch.value,
    pl: promptLen.value,
    ol: outputLen.value,
    // 保留当前语言，避免分享出去的链接丢掉 lang
    lang: currentLangParam(),
  }

  router.push({ path: '/solver', query })
}

watch(model, (m, prev) => {
  // 只在超出新模型上限时收敛，保留用户已设置的长上下文
  if (m?.max_ctx && ctx.value > m.max_ctx) ctx.value = m.max_ctx
  // MoE 模型：仅在放不下显存时才自动开启 CPU 卸载；能放下则关闭；切换到非 MoE 时关闭
  if (m?.type === 'moe' && m?.active_params) {
    cpuOffload.value = needsCpuOffload(m, effectiveGpu.value, gpuCount.value, quant.value, framework.value)
  } else if (prev?.type === 'moe') {
    cpuOffload.value = false
  }
})

watch([promptLen, ctx], () => {
  const next = clampPromptLen(promptLen.value, ctx.value)
  if (promptLen.value !== next) promptLen.value = next
})
watch(outputLen, (v) => {
  const next = clampOutputLen(v)
  if (v !== next) outputLen.value = next
})

watch(() => gpuSlots.value[0]?.gpu, (g, prev) => {
  if (g?.vendor === 'apple') {
    const mlxFw = FRAMEWORK_MAP.find(f => f.id === 'mlx')
    if (mlxFw) framework.value = mlxFw
  } else if (prev?.vendor === 'apple' && g?.vendor !== 'apple' && framework.value?.id === 'mlx') {
    // 从 Apple 切回 CUDA 系时，若仍停在 mlx，切到 vllm
    const vllmFw = FRAMEWORK_MAP.find(f => f.id === 'vllm')
    if (vllmFw) framework.value = vllmFw
  }
})

// llama.cpp hybrid 模式失效时重置 nglCount
watch([cpuOffload, framework], ([co, fw]) => {
  if (!(co && fw?.id === 'llamacpp')) nglCount.value = null
})

watchUrlState({ gpuSlots, interconnect, model, quant, ctx, batch,
  promptLen, outputLen, framework, flashAttention, kvCacheQuant,
  prefixCacheHit, cpuOffload, pcieBw, pcieWidth, pureCpu, cpuMemBw, sysRam,
  speculativeDecoding, acceptanceRate, draftLen, draftModelParams, ppCount, epCount, imageCount, sharedVram, nglCount })

const SPECULATIVE_FRAMEWORKS = ['vllm', 'trtllm', 'sglang', 'lmdeploy']
function speculativeAllowed(fw) {
  return SPECULATIVE_FRAMEWORKS.includes(fw?.id)
}

// 主结果、量化矩阵、batch sweep 共用同一份参数，避免各处漏传导致数字互相打架
const calcParams = computed(() => ({
  gpu: effectiveGpu.value,
  gpuCount: gpuCount.value,
  interconnect: interconnect.value,
  model: model.value,
  quant: quant.value,
  ctx: ctx.value,
  batch: batch.value,
  promptLen: promptLen.value,
  outputLen: outputLen.value,
  framework: framework.value,
  flashAttention: flashAttention.value,
  kvCacheQuant: kvCacheQuant.value,
  prefixCacheHit: prefixCacheHit.value,
  cpuOffload: cpuOffload.value,
  pcieBw: pcieBw.value,
  pcieWidth: pcieWidth.value,
  pureCpu: pureCpu.value,
  cpuMemBw: cpuMemBw.value,
  sysRam: sysRam.value,
  // 双保险：不支持 speculative 的框架强制关闭，避免 URL/时序导致仍计入加速与 draft IO
  speculativeDecoding: speculativeAllowed(framework.value) && speculativeDecoding.value,
  acceptanceRate: acceptanceRate.value,
  draftLen: draftLen.value,
  draftModelParams: draftModelParams.value,
  ppCount: ppCount.value,
  epCount: epCount.value,
  imageCount: imageCount.value,
  nglCount: nglCount.value,
}))

// 固定列快照对应的参数集合（结构与 calcParams 完全一致）
const pinnedCalcParams = computed(() => {
  const c = pinnedConfig.value
  if (!c) return null
  return {
    gpu: c.gpu,
    gpuCount: c.gpuCount,
    interconnect: c.interconnect,
    model: c.model,
    quant: c.quant,
    ctx: c.ctx,
    batch: c.batch,
    promptLen: c.promptLen,
    outputLen: c.outputLen,
    framework: c.framework,
    flashAttention: c.flashAttention,
    kvCacheQuant: c.kvCacheQuant,
    prefixCacheHit: c.prefixCacheHit,
    cpuOffload: c.cpuOffload,
    pcieBw: c.pcieBw,
    pcieWidth: c.pcieWidth,
    pureCpu: c.pureCpu,
    cpuMemBw: c.cpuMemBw,
    sysRam: c.sysRam,
    speculativeDecoding: speculativeAllowed(c.framework) && c.speculativeDecoding,
    acceptanceRate: c.acceptanceRate,
    draftLen: c.draftLen,
    draftModelParams: c.draftModelParams,
    ppCount: c.ppCount,
    epCount: c.epCount,
    imageCount: c.imageCount,
    nglCount: c.nglCount,
  }
})

const result = computed(() => {
  if (!effectiveGpu.value || !model.value || !quant.value || !framework.value) return null
  try {
    return { ...calcAll(calcParams.value), quantId: quant.value.id }
  } catch (e) {
    if (import.meta.env.DEV) console.error('[calcAll error]', e)
    return null
  }
})

/** 按给定参数集合构建量化对比矩阵（OOM 行额外试算 CPU 卸载后能否容纳） */
function buildQuantMatrix(params) {
  if (!params?.gpu || !params.model || !params.framework) return []
  return QUANT_MAP.map(q => {
    try {
      const r = calcAll({ ...params, quant: q })
      let cpuOffloadFeasible = false
      let offloadVramGB = null
      if (!r.vramOk && !params.cpuOffload && params.model?.type === 'moe' && params.model?.active_params) {
        try {
          const fallbackPcie = params.pcieBw ?? INTERCONNECT_MAP.find(x => x.id === 'pcie4')
          const ro = calcAll({ ...params, quant: q, cpuOffload: true, pcieBw: fallbackPcie, pureCpu: false })
          cpuOffloadFeasible = ro.vramOk
          offloadVramGB = ro.displayNeeded ?? ro.totalNeeded
        } catch { /* ignore */ }
      }
      return { quant: q, vramGB: r.displayNeeded ?? r.totalNeeded, vramOk: r.vramOk, vramPct: r.vramPct, decodeToks: r.decodeToks, cpuOffloadFeasible, offloadVramGB }
    } catch { return null }
  }).filter(Boolean)
}

const quantMatrix = computed(() => buildQuantMatrix(calcParams.value))
const pinnedQuantMatrix = computed(() => buildQuantMatrix(pinnedCalcParams.value))

const batchSweepData = computed(() => {
  if (!effectiveGpu.value || !model.value || !quant.value) return []
  return calcBatchSweep(calcParams.value)
})

const pinnedBatchSweepData = computed(() => {
  if (!pinnedCalcParams.value) return []
  return calcBatchSweep(pinnedCalcParams.value)
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
          v-model:pcieWidth="pcieWidth" v-model:sysRam="sysRam"
          :model="model" :framework="framework" :gpuCount="gpuCount"
          v-model:speculativeDecoding="speculativeDecoding"
          v-model:acceptanceRate="acceptanceRate" v-model:draftLen="draftLen"
          v-model:draftModelParams="draftModelParams"
          v-model:ppCount="ppCount" v-model:imageCount="imageCount"
          v-model:nglCount="nglCount" v-model:epCount="epCount"
        />
      </template>
      <template #result>
        <div
          v-if="model?.status === 'preview'"
          class="mb-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 flex items-start gap-2.5"
        >
          <span class="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-600 text-white mt-0.5">{{ t('model.tag_preview') }}</span>
          <p class="text-xs text-violet-800 leading-relaxed">{{ t('model.preview_tip') }}</p>
        </div>
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
          <div class="grid grid-cols-2 gap-4">
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
                  :ctx="pinnedConfig.ctx"
                  :batch="pinnedConfig.batch"
                  :pp-count="pinnedConfig.ppCount"
                  :ep-count="pinnedConfig.epCount"
                  :kv-cache-quant="pinnedConfig.kvCacheQuant"
                  :prefix-cache-hit="pinnedConfig.prefixCacheHit"
                  :speculative-decoding="pinnedConfig.speculativeDecoding"
                  :draft-len="pinnedConfig.draftLen"
                  :cpu-offload="pinnedConfig.cpuOffload"
                  :pure-cpu="pinnedConfig.pureCpu"
                  :ngl-count="pinnedConfig.nglCount"
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
                  :ctx="ctx"
                  :batch="batch"
                  :pp-count="ppCount"
                  :ep-count="epCount"
                  :kv-cache-quant="kvCacheQuant"
                  :prefix-cache-hit="prefixCacheHit"
                  :speculative-decoding="speculativeDecoding"
                  :draft-len="draftLen"
                  :cpu-offload="cpuOffload"
                  :pure-cpu="pureCpu"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="space-y-4">
          <!-- 单列模式 + 固定按钮（仅桌面端显示）/ 移动端显示提示 -->
          <div v-if="result" class="flex justify-end items-center gap-2">
            <!-- 我想更快按钮 -->
            <button
              v-if="result.vramOk"
              @click="goToUpgrade"
              class="hidden sm:flex text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {{ t('solver.upgrade_button') }}
            </button>
            <!-- 桌面端：pin 按钮 -->
            <button
              @click="pinCurrentResult"
              class="hidden sm:flex text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {{ t('result.pin_current') }}
            </button>
            <!-- 移动端：提示文字 -->
            <p class="sm:hidden text-xs text-gray-400">{{ t('result.compare_desktop_only') }}</p>
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
            :ctx="ctx"
            :batch="batch"
            :pp-count="ppCount"
            :ep-count="epCount"
            :kv-cache-quant="kvCacheQuant"
            :prefix-cache-hit="prefixCacheHit"
            :speculative-decoding="speculativeDecoding"
            :draft-len="draftLen"
            :cpu-offload="cpuOffload"
            :pure-cpu="pureCpu"
            :ngl-count="nglCount"
          />
        </div>
      </template>
    </TwoColumn>
  </div>
</template>
