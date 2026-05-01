// src/utils/useUrlState.js
import { watch } from 'vue'
import { GPU_LIST } from '../data/gpus/index.js'
import { ALL_MODELS } from '../data/models/index.js'
import { QUANT_MAP, INTERCONNECT_MAP, FRAMEWORK_MAP } from '../data/constants.js'
import { KV_CACHE_MAP, PCIE_BW_OPTIONS, CPU_MEM_BW_OPTIONS } from '../data/runtime.js'

const SESSION_KEY = 'tps_calc_query'

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
  // 同步保存到 sessionStorage，供切换路由后恢复
  sessionStorage.setItem(SESSION_KEY, url.search)
}

/** 从 URL 读取初始状态，URL 无参数时回退到 sessionStorage */
export function readUrlState() {
  let search = window.location.search
  if (!search || search === '?') {
    search = sessionStorage.getItem(SESSION_KEY) ?? ''
    // 把 sessionStorage 的 query 恢复到 URL
    if (search) {
      window.history.replaceState({}, '', window.location.pathname + search)
    }
  }
  const p = new URLSearchParams(search)
  return {
    gpuSlots:       p.get('gpus') ?? null,          // "id1:n1,id2:n2"
    gpuId:          p.get('gpu'),                    // legacy fallback
    gpuCount:       p.has('n')    ? Number(p.get('n'))    : null,  // legacy fallback
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
    pureCpu:        p.has('pcpu') ? p.get('pcpu') === '1' : null,
    cpuMemBwId:     p.get('cmb'),
    sharedVram:     p.has('sv')   ? Math.max(1, Math.min(512, Number(p.get('sv')))) : null,
  }
}

/** 解析初始值到对应对象 */
export function resolveUrlState(init) {
  // gpuSlots 优先；无则回退旧 gpu+gpuCount 参数
  let gpuSlots = null
  if (init.gpuSlots) {
    const parsed = init.gpuSlots.split(',').map(s => {
      const [id, count] = s.split(':')
      return { gpu: GPU_LIST.find(g => g.id === id) ?? null, count: Number(count) || 1 }
    }).filter(s => s.gpu)
    if (parsed.length) gpuSlots = parsed
  }
  if (!gpuSlots && init.gpuId) {
    const gpu = GPU_LIST.find(g => g.id === init.gpuId)
    if (gpu) gpuSlots = [{ gpu, count: init.gpuCount ?? 1 }]
  }
  return {
    gpuSlots,
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
    pureCpu:      init.pureCpu,
    cpuMemBw:     CPU_MEM_BW_OPTIONS.find(p => p.id === init.cpuMemBwId) ?? null,
    sharedVram:   init.sharedVram,
  }
}

/** 监听所有 ref，变化时同步写入 URL 和 sessionStorage */
export function watchUrlState({
  gpuSlots, interconnect, model, quant, ctx, batch,
  promptLen, outputLen, framework, flashAttention,
  kvCacheQuant, prefixCacheHit, cpuOffload, pcieBw, pureCpu, cpuMemBw, sharedVram,
}) {
  watch(
    [gpuSlots, interconnect, model, quant, ctx, batch,
     promptLen, outputLen, framework, flashAttention,
     kvCacheQuant, prefixCacheHit, cpuOffload, pcieBw, pureCpu, cpuMemBw, sharedVram],
    ([slots, ic, m, q, c, b, pl, ol, fw, fa, kv, pc, co, pb, pcpu, cmb, sv]) => {
      setParams({
        gpus:  slots?.length ? slots.map(s => `${s.gpu.id}:${s.count}`).join(',') : null,
        gpu:   null,
        n:     null,
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
        pcpu:  pcpu ? '1' : null,
        cmb:   pcpu ? (cmb?.id ?? null) : null,
        sv:    sv != null && sv !== 16 ? sv : null,
      })
    },
    { immediate: true, deep: true }
  )
}
