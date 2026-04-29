<script setup>
import { computed, ref, watch } from 'vue'
import TopBar from '../components/layout/TopBar.vue'
import TwoColumn from '../components/layout/TwoColumn.vue'
import GpuConfig from '../components/config/GpuConfig.vue'
import ModelPicker from '../components/config/ModelPicker.vue'
import RunConfig from '../components/config/RunConfig.vue'
import ResultPanel from '../components/result/ResultPanel.vue'
import { GPU_LIST } from '../data/gpus/index.js'
import { ALL_MODELS } from '../data/models/index.js'
import { QUANT_MAP, INTERCONNECT_MAP, FRAMEWORK_MAP } from '../data/constants.js'
import { KV_CACHE_MAP, PCIE_BW_OPTIONS } from '../data/runtime.js'
import { calcAll } from '../utils/calc.js'
import { readUrlState, resolveUrlState, watchUrlState } from '../utils/useUrlState.js'

const _url = resolveUrlState(readUrlState())
const defaultModel = ALL_MODELS[0]

const gpu            = ref(_url.gpu          ?? GPU_LIST.find(g => g.id === 'h100_sxm') ?? GPU_LIST[0])
const gpuCount       = ref(_url.gpuCount     ?? 1)
const interconnect   = ref(_url.interconnect ?? INTERCONNECT_MAP[0])
const model          = ref(_url.model        ?? defaultModel)
const quant          = ref(_url.quant        ?? QUANT_MAP.find(q => q.id === 'bf16'))
const ctx            = ref(_url.ctx          ?? Math.min(model.value?.max_ctx ?? 16384, 16384))
const batch          = ref(_url.batch        ?? 1)
const promptLen      = ref(_url.promptLen    ?? 1024)
const outputLen      = ref(_url.outputLen    ?? 1024)
const framework      = ref(_url.framework    ?? FRAMEWORK_MAP.find(f => f.id === 'vllm'))
const flashAttention = ref(_url.flashAttention ?? true)
const kvCacheQuant   = ref(_url.kvCacheQuant ?? KV_CACHE_MAP[0])
const prefixCacheHit = ref(_url.prefixCacheHit ?? 0)
const cpuOffload     = ref(_url.cpuOffload   ?? false)
const pcieBw         = ref(_url.pcieBw       ?? PCIE_BW_OPTIONS[1])

watch(model, (m) => {
  if (!m?.max_ctx) return
  ctx.value = Math.min(m.max_ctx, 16384)
})

watch(gpu, (g) => {
  if (g?.vendor === 'apple') {
    const metal = FRAMEWORK_MAP.find(f => f.id === 'llamacpp_metal')
    if (metal) framework.value = metal
  }
})

watchUrlState({ gpu, gpuCount, interconnect, model, quant, ctx, batch,
  promptLen, outputLen, framework, flashAttention, kvCacheQuant,
  prefixCacheHit, cpuOffload, pcieBw })

const result = computed(() => {
  if (!gpu.value || !model.value || !quant.value || !framework.value) return null
  try {
    return { ...calcAll({
      gpu: gpu.value, gpuCount: gpuCount.value, interconnect: interconnect.value,
      model: model.value, quant: quant.value, ctx: ctx.value, batch: batch.value,
      promptLen: promptLen.value, outputLen: outputLen.value, framework: framework.value,
      flashAttention: flashAttention.value, kvCacheQuant: kvCacheQuant.value,
      prefixCacheHit: prefixCacheHit.value, cpuOffload: cpuOffload.value, pcieBw: pcieBw.value,
    }), quantId: quant.value.id }
  } catch (e) {
    if (import.meta.env.DEV) console.error('[calcAll error]', e)
    return null
  }
})

const quantMatrix = computed(() => {
  if (!gpu.value || !model.value || !framework.value) return []
  return QUANT_MAP.map(q => {
    try {
      const r = calcAll({
        gpu: gpu.value, gpuCount: gpuCount.value, interconnect: interconnect.value,
        model: model.value, quant: q, ctx: ctx.value, batch: batch.value,
        promptLen: promptLen.value, outputLen: outputLen.value, framework: framework.value,
        flashAttention: flashAttention.value, kvCacheQuant: kvCacheQuant.value,
        prefixCacheHit: prefixCacheHit.value, cpuOffload: cpuOffload.value, pcieBw: pcieBw.value,
      })
      return { quant: q, vramGB: r.totalNeeded, vramOk: r.vramOk, vramPct: r.vramPct, decodeToks: r.decodeToks }
    } catch { return null }
  }).filter(Boolean)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 overflow-x-hidden pt-12 sm:pt-14 pb-14 sm:pb-0">
    <TopBar
      :result="result" :model="model" :gpu="gpu" :gpu-count="gpuCount"
      :interconnect="interconnect" :quant="quant" :framework="framework"
      :ctx="ctx" :batch="batch" :prompt-len="promptLen" :output-len="outputLen"
      :flash-attention="flashAttention" :kv-cache-quant="kvCacheQuant"
      :prefix-cache-hit="prefixCacheHit" :cpu-offload="cpuOffload" :pcie-bw="pcieBw"
    />
    <TwoColumn>
      <template #config>
        <GpuConfig v-model:gpu="gpu" v-model:gpuCount="gpuCount" v-model:interconnect="interconnect" />
        <ModelPicker v-model:model="model" />
        <RunConfig
          v-model:quant="quant" v-model:ctx="ctx" v-model:batch="batch"
          v-model:promptLen="promptLen" v-model:outputLen="outputLen"
          v-model:flashAttention="flashAttention" v-model:kvCacheQuant="kvCacheQuant"
          v-model:prefixCacheHit="prefixCacheHit" v-model:cpuOffload="cpuOffload"
          v-model:pcieBw="pcieBw" :model="model"
        />
      </template>
      <template #result>
        <ResultPanel :result="result" :model="model" :quant-matrix="quantMatrix" :gpu-vendor="gpu?.vendor" v-model:framework="framework" v-model:quant="quant" />
      </template>
    </TwoColumn>
  </div>
</template>
