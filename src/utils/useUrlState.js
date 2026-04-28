// src/utils/useUrlState.js
// 把关键配置序列化到 URL querystring，支持分享和浏览器历史回退

import { watch } from 'vue'
import { GPU_LIST } from '../data/gpus/index.js'
import { ALL_MODELS } from '../data/models/index.js'
import { QUANT_MAP, INTERCONNECT_MAP, FRAMEWORK_MAP } from '../data/constants.js'
import { KV_CACHE_MAP, PCIE_BW_OPTIONS } from '../data/runtime.js'

function getParams() {
  return new URLSearchParams(window.location.search)
}

function setParams(updates) {
  const url = new URL(window.location.href)
  for (const [k, v] of Object.entries(updates)) {
    if (v == null) url.searchParams.delete(k)
    else url.searchParams.set(k, v)
  }
  window.history.replaceState({}, '', url.toString())
}

/** 从 URL 读取初始状态，返回各 ref 的初始值 */
export function readUrlState() {
  const p = getParams()
  return {
    gpuId:          p.get('gpu'),
    gpuCount:       p.has('n')    ? Number(p.get('n'))    : null,
    interconnectId: p.get('ic'),
    modelId:        p.get('model'),
    quantId:        p.get('quant'),
    ctx:            p.has('ctx')  ? Math.max(512, Math.min(10_000_000, Number(p.get('ctx'))))  : null,
    batch:          p.has('b')    ? Math.max(1,   Math.min(256,         Number(p.get('b'))))    : null,
    promptLen:      p.has('pl')   ? Math.max(1,   Math.min(1_000_000,   Number(p.get('pl'))))   : null,
    outputLen:      p.has('ol')   ? Math.max(1,   Math.min(100_000,     Number(p.get('ol'))))   : null,
    frameworkId:    p.get('fw'),
    flashAttention: p.has('fa')   ? p.get('fa') !== '0'  : null,
    kvCacheQuantId: p.get('kv'),
    prefixCacheHit: p.has('pc')   ? Number(p.get('pc'))  : null,
    cpuOffload:     p.has('co')   ? p.get('co') === '1'  : null,
    pcieBwId:       p.get('pcie'),
  }
}

/** 解析初始值到对应对象 */
export function resolveUrlState(init) {
  return {
    gpu:          GPU_LIST.find(g => g.id === init.gpuId) ?? null,
    gpuCount:     init.gpuCount,
    interconnect: INTERCONNECT_MAP.find(i => i.id === init.interconnectId) ?? null,
    model:        ALL_MODELS.find(m => m.id === init.modelId) ?? null,
    quant:        QUANT_MAP.find(q => q.id === init.quantId) ?? null,
    ctx:          init.ctx,
    batch:        init.batch,
    promptLen:    init.promptLen,
    outputLen:    init.outputLen,
    framework:    FRAMEWORK_MAP.find(f => f.id === init.frameworkId) ?? null,
    flashAttention: init.flashAttention,
    kvCacheQuant: KV_CACHE_MAP.find(k => k.id === init.kvCacheQuantId) ?? null,
    prefixCacheHit: init.prefixCacheHit,
    cpuOffload:   init.cpuOffload,
    pcieBw:       PCIE_BW_OPTIONS.find(p => p.id === init.pcieBwId) ?? null,
  }
}

/** 监听所有 ref，变化时同步写入 URL */
export function watchUrlState({
  gpu, gpuCount, interconnect, model, quant, ctx, batch,
  promptLen, outputLen, framework, flashAttention,
  kvCacheQuant, prefixCacheHit, cpuOffload, pcieBw,
}) {
  watch(
    [gpu, gpuCount, interconnect, model, quant, ctx, batch,
     promptLen, outputLen, framework, flashAttention,
     kvCacheQuant, prefixCacheHit, cpuOffload, pcieBw],
    ([g, n, ic, m, q, c, b, pl, ol, fw, fa, kv, pc, co, pb]) => {
      setParams({
        gpu:   g?.id   ?? null,
        n:     n !== 1 ? n : null,
        ic:    ic?.id  ?? null,
        model: m?.id   ?? null,
        quant: q?.id   ?? null,
        ctx:   c,
        b:     b !== 1 ? b : null,
        pl:    pl,
        ol:    ol,
        fw:    fw?.id  ?? null,
        fa:    fa === false ? '0' : null,
        kv:    kv?.id !== 'auto' ? kv?.id : null,
        pc:    pc > 0 ? pc : null,
        co:    co ? '1' : null,
        pcie:  pb?.id  ?? null,
      })
    },
    { immediate: true }
  )
}
