<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import TopBar from '../components/layout/TopBar.vue'
import GpuConfig from '../components/config/GpuConfig.vue'
import { GPU_LIST } from '../data/gpus/index.js'
import { ALL_MODELS } from '../data/models/index.js'
import { QUANT_MAP, FRAMEWORK_MAP, INTERCONNECT_MAP } from '../data/constants.js'
import { calcAll, aggregateGpuSlots } from '../utils/calc.js'
import { fmtParams, fmtGB, fmtToks, fmtMs, fmtCtx, isNew } from '../utils/format.js'
import { PCIE_BW_OPTIONS } from '../data/runtime.js'

const defaultPcieBw = PCIE_BW_OPTIONS[1] // PCIe 4.0

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

// ── URL 解析 ────────────────────────────────────────
const _p = route.query
function parseGpuSlots(query) {
  if (query.gpus) {
    const parsed = String(query.gpus).split(',').map(s => {
      const [id, count] = s.split(':')
      return { gpu: GPU_LIST.find(g => g.id === id) ?? null, count: Number(count) || 1 }
    }).filter(s => s.gpu)
    if (parsed.length) return parsed
  }
  const gpu = GPU_LIST.find(g => g.id === query.gpu)
  if (gpu) return [{ gpu, count: query.n ? Math.max(1, Number(query.n)) : 1 }]
  return null
}

// ── GPU 配置 ─────────────────────────────────────────
const gpuSlots    = ref(parseGpuSlots(_p) ?? [{ gpu: GPU_LIST.find(g => g.id === 'h100_sxm') ?? GPU_LIST[0], count: 1 }])
const interconnect = ref(INTERCONNECT_MAP.find(i => i.id === _p.ic) ?? INTERCONNECT_MAP[0])
const ctx         = ref(_p.ctx ? Math.max(512, Number(_p.ctx)) : 16384)
const batch       = ref(_p.b ? Math.max(1, Number(_p.b)) : 1)
const framework   = ref(FRAMEWORK_MAP.find(f => f.id === _p.fw) ?? FRAMEWORK_MAP.find(f => f.id === 'theory'))
const gpuCount    = computed(() => gpuSlots.value.reduce((s, g) => s + g.count, 0))
const sharedVram  = ref(_p.sv ? Math.max(1, Math.min(512, Number(_p.sv))) : 16)

const effectiveGpu = computed(() => {
  const slots = gpuSlots.value.map(s => {
    let g = s.gpu
    if (g?.sharedMemory && g?.vram === 0) g = { ...g, vram: sharedVram.value }
    return { ...s, gpu: g }
  })
  return slots.length === 1 ? slots[0].gpu : aggregateGpuSlots(slots)
})

// ── 排序 & 基础筛选 ──────────────────────────────────
const sortBy          = ref(['speed','vram','params'].includes(_p.sort) ? _p.sort : 'speed')
const filterType      = ref(['all','dense','moe'].includes(_p.type) ? _p.type : 'all')
const showOnlyRunnable = ref(_p.runnable === '0' ? false : true)

// ── 新增筛选条件 ─────────────────────────────────────
// 参数量范围：all / le7 / 7to30 / 30to100 / gt100
const PARAM_RANGES = [
  { id: 'all',    label: () => t('ranking.filter_params_all') },
  { id: 'le7',    label: () => '≤ 7B'   },
  { id: '7to30',  label: () => '7–30B'  },
  { id: '30to100',label: () => '30–100B'},
  { id: 'gt100',  label: () => '> 100B' },
]
const filterParams = ref(_p.params ?? 'all')

// 最低速度：0 = 不限
const SPEED_THRESHOLDS = [
  { id: '0',   label: () => t('ranking.filter_min_speed_all'), value: 0   },
  { id: '10',  label: () => '≥ 10 tok/s',  value: 10  },
  { id: '20',  label: () => '≥ 20 tok/s',  value: 20  },
  { id: '50',  label: () => '≥ 50 tok/s',  value: 50  },
  { id: '100', label: () => '≥ 100 tok/s', value: 100 },
]
const filterMinSpeed = ref(_p.minspeed ?? '0')

// 最低量化精度：'' = 不限，否则为 quant.id
const QUANT_FLOORS = [
  { id: '',     label: () => t('ranking.filter_min_quant_all') },
  { id: 'int4', label: () => 'INT4+'  },
  { id: 'int8', label: () => 'INT8+'  },
  { id: 'fp8',  label: () => 'FP8+'   },
  { id: 'bf16', label: () => 'BF16'   },
]
const filterMinQuant = ref(_p.minquant ?? '')

// 隐藏需要 CPU 卸载的模型
const hideOffload = ref(_p.hideoffload === '1')

// 是否有激活的筛选（用于显示"已筛选"标记）
const hasActiveFilters = computed(() =>
  filterParams.value !== 'all' ||
  filterMinSpeed.value !== '0' ||
  filterMinQuant.value !== '' ||
  hideOffload.value
)

function resetFilters() {
  filterParams.value = 'all'
  filterMinSpeed.value = '0'
  filterMinQuant.value = ''
  hideOffload.value = false
}

// ── URL 同步 ─────────────────────────────────────────
watch(
  [gpuSlots, interconnect, ctx, batch, framework, sortBy, filterType, showOnlyRunnable, sharedVram,
   filterParams, filterMinSpeed, filterMinQuant, hideOffload],
  ([slots, ic, c, b, fw, sort, type, runnable, sv, params, minspeed, minquant, offload]) => {
    const query = {}
    if (slots?.length) query.gpus = slots.map(s => `${s.gpu.id}:${s.count}`).join(',')
    if (ic?.id) query.ic = ic.id
    if (c !== 16384) query.ctx = c
    if (b !== 1) query.b = b
    if (fw?.id && fw.id !== 'theory') query.fw = fw.id
    if (sort !== 'speed') query.sort = sort
    if (type !== 'all') query.type = type
    if (!runnable) query.runnable = '0'
    if (sv !== 16) query.sv = sv
    if (params !== 'all') query.params = params
    if (minspeed !== '0') query.minspeed = minspeed
    if (minquant !== '') query.minquant = minquant
    if (offload) query.hideoffload = '1'
    router.replace({ query })
  }
)

// ── 计算所有模型结果（不含后置筛选）────────────────────
const allModelResults = computed(() => {
  if (!effectiveGpu.value || !framework.value) return []

  const results = []
  for (const model of ALL_MODELS) {
    if (filterType.value !== 'all' && model.type !== filterType.value) continue

    let bestQuant = null
    let bestResult = null

    for (const quant of QUANT_MAP) {
      try {
        const commonArgs = {
          gpu: effectiveGpu.value,
          gpuCount: gpuCount.value,
          interconnect: interconnect.value,
          model,
          quant,
          ctx: ctx.value,
          batch: batch.value,
          promptLen: 1024,
          outputLen: 1024,
          framework: framework.value,
          flashAttention: true,
          kvCacheQuant: null,
          prefixCacheHit: 0,
          speculativeDecoding: false,
          acceptanceRate: 0.7,
          draftLen: 4,
          pureCpu: false,
          cpuMemBw: null,
        }
        let result = calcAll({ ...commonArgs, cpuOffload: false, pcieBw: null })

        if (!result.vramOk && model.type === 'moe' && model.active_params) {
          const offloadResult = calcAll({ ...commonArgs, cpuOffload: true, pcieBw: defaultPcieBw })
          if (offloadResult.vramOk) result = offloadResult
        }

        if (result.vramOk) {
          if (!bestResult || quant.bytes > bestQuant.bytes) {
            bestQuant = quant
            bestResult = result
          }
        }
      } catch { /* skip */ }
    }

    if (bestResult || !showOnlyRunnable.value) {
      results.push({
        model,
        quant: bestQuant,
        result: bestResult,
        canRun: !!bestResult,
        cpuOffload: bestResult?.cpuOffload ?? false,
      })
    }
  }

  results.sort((a, b) => {
    if (sortBy.value === 'speed') {
      if (!a.result) return 1
      if (!b.result) return -1
      return b.result.singleToks - a.result.singleToks
    } else if (sortBy.value === 'vram') {
      if (!a.result) return 1
      if (!b.result) return -1
      return a.result.totalNeeded - b.result.totalNeeded
    } else {
      return b.model.params - a.model.params
    }
  })

  return results
})

// ── 后置筛选（在已排序结果上叠加）──────────────────────
const modelResults = computed(() => {
  let list = allModelResults.value

  // 参数量范围
  if (filterParams.value !== 'all') {
    list = list.filter(item => {
      const p = item.model.params
      if (filterParams.value === 'le7')     return p <= 7
      if (filterParams.value === '7to30')   return p > 7 && p <= 30
      if (filterParams.value === '30to100') return p > 30 && p <= 100
      if (filterParams.value === 'gt100')   return p > 100
      return true
    })
  }

  // 最低速度
  const speedThreshold = SPEED_THRESHOLDS.find(s => s.id === filterMinSpeed.value)?.value ?? 0
  if (speedThreshold > 0) {
    list = list.filter(item => item.result && item.result.singleToks >= speedThreshold)
  }

  // 最低量化精度
  if (filterMinQuant.value) {
    const floorQuant = QUANT_MAP.find(q => q.id === filterMinQuant.value)
    if (floorQuant) {
      list = list.filter(item => item.quant && item.quant.bytes >= floorQuant.bytes)
    }
  }

  // 隐藏 CPU 卸载
  if (hideOffload.value) {
    list = list.filter(item => !item.cpuOffload)
  }

  return list
})

// ── 跳转 ─────────────────────────────────────────────
function useThisModel(modelData) {
  const query = {
    gpus:  gpuSlots.value.map(s => `${s.gpu.id}:${s.count}`).join(','),
    ic:    interconnect.value?.id ?? undefined,
    model: modelData.model.id,
    quant: modelData.quant?.id ?? 'bf16',
    fw:    framework.value.id,
    ctx:   ctx.value,
    b:     batch.value !== 1 ? batch.value : undefined,
    co:    modelData.cpuOffload ? '1' : undefined,
    pcie:  modelData.cpuOffload ? defaultPcieBw.id : undefined,
    sv:    effectiveGpu.value?.sharedMemory && sharedVram.value !== 16 ? sharedVram.value : undefined,
  }
  router.push({ path: '/', query })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 overflow-x-hidden pt-12 sm:pt-14 pb-20 sm:pb-8">
    <TopBar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- 标题 -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ t('ranking.title') }}</h1>
        <p class="text-sm text-gray-600">{{ t('ranking.subtitle') }}</p>
      </div>

      <!-- GPU 配置 -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <GpuConfig v-model:gpuSlots="gpuSlots" v-model:interconnect="interconnect" v-model:sharedVram="sharedVram" />
      </div>

      <!-- 筛选和排序 -->
      <div class="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <!-- 第一行：模型类型 + 排序 + 仅可运行 + 重置 -->
        <div class="flex flex-wrap gap-3 items-center">
          <div class="flex items-center gap-2">
            <label class="text-xs font-medium text-gray-500 whitespace-nowrap">{{ t('ranking.filter_type') }}</label>
            <div class="flex gap-1">
              <button
                v-for="opt in [
                  { id: 'all',   label: t('ranking.filter_all') },
                  { id: 'dense', label: t('ranking.filter_dense') },
                  { id: 'moe',   label: t('ranking.filter_moe') },
                ]"
                :key="opt.id"
                @click="filterType = opt.id"
                :class="['px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                  filterType === opt.id
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']"
              >{{ opt.label }}</button>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-xs font-medium text-gray-500 whitespace-nowrap">{{ t('ranking.sort_by') }}</label>
            <select v-model="sortBy" class="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-500">
              <option value="speed">{{ t('ranking.sort_speed') }}</option>
              <option value="vram">{{ t('ranking.sort_vram') }}</option>
              <option value="params">{{ t('ranking.sort_params') }}</option>
            </select>
          </div>

          <label class="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" v-model="showOnlyRunnable" class="w-3.5 h-3.5 accent-emerald-500 rounded" />
            <span class="text-xs text-gray-600">{{ t('ranking.show_only_runnable') }}</span>
          </label>

          <label class="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" v-model="hideOffload" class="w-3.5 h-3.5 accent-emerald-500 rounded" />
            <span class="text-xs text-gray-600">{{ t('ranking.filter_hide_offload') }}</span>
          </label>

          <div class="ml-auto flex items-center gap-2">
            <button
              v-if="hasActiveFilters"
              @click="resetFilters"
              class="text-xs px-2.5 py-1 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"
            >{{ t('ranking.filter_reset') }}</button>
            <span class="text-xs text-gray-500">
              <span v-if="hasActiveFilters" class="text-emerald-600 font-medium">{{ t('ranking.active_filters') }} · </span>
              {{ t('ranking.total_models', { count: modelResults.length }) }}
            </span>
          </div>
        </div>

        <!-- 第二行：参数量 + 最低速度 + 最低量化 -->
        <div class="flex flex-wrap gap-3 items-center pt-2 border-t border-gray-100">
          <!-- 参数量范围 -->
          <div class="flex items-center gap-2">
            <label class="text-xs font-medium text-gray-500 whitespace-nowrap">{{ t('ranking.filter_params') }}</label>
            <div class="flex gap-1 flex-wrap">
              <button
                v-for="opt in PARAM_RANGES"
                :key="opt.id"
                @click="filterParams = opt.id"
                :class="['px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                  filterParams === opt.id
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']"
              >{{ opt.label() }}</button>
            </div>
          </div>

          <!-- 最低速度 -->
          <div class="flex items-center gap-2">
            <label class="text-xs font-medium text-gray-500 whitespace-nowrap">{{ t('ranking.filter_min_speed') }}</label>
            <div class="flex gap-1 flex-wrap">
              <button
                v-for="opt in SPEED_THRESHOLDS"
                :key="opt.id"
                @click="filterMinSpeed = opt.id"
                :class="['px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                  filterMinSpeed === opt.id
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']"
              >{{ opt.label() }}</button>
            </div>
          </div>

          <!-- 最低量化精度 -->
          <div class="flex items-center gap-2">
            <label class="text-xs font-medium text-gray-500 whitespace-nowrap">{{ t('ranking.filter_min_quant') }}</label>
            <div class="flex gap-1 flex-wrap">
              <button
                v-for="opt in QUANT_FLOORS"
                :key="opt.id"
                @click="filterMinQuant = opt.id"
                :class="['px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                  filterMinQuant === opt.id
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100']"
              >{{ opt.label() }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 模型列表 -->
      <!-- 桌面端：表格视图 -->
      <div class="hidden sm:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{{ t('ranking.table_model') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{{ t('ranking.table_type') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">{{ t('ranking.table_params') }}</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">{{ t('ranking.table_best_quant') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">{{ t('ranking.table_vram') }}</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">{{ t('ranking.table_speed') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">{{ t('ranking.table_status') }}</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">{{ t('ranking.table_action') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="item in modelResults"
                :key="item.model.id"
                class="hover:bg-gray-50 transition-colors"
                :class="{ 'opacity-50': !item.canRun }"
              >
                <td class="px-4 py-3">
                  <div class="text-sm font-medium text-gray-900">{{ item.model.name }}</div>
                  <div v-if="item.cpuOffload" class="text-[10px] text-amber-600 mt-0.5">CPU offload</div>
                </td>
                <td class="px-4 py-3">
                  <span
                    :class="item.model.type === 'moe' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'"
                    class="text-xs font-medium px-2 py-0.5 rounded-full"
                  >
                    {{ item.model.type === 'moe' ? 'MoE' : 'Dense' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right text-sm text-gray-900">{{ fmtParams(item.model.params) }}</td>
                <td class="px-4 py-3">
                  <span v-if="item.quant" class="text-sm text-gray-700">{{ item.quant.label }}</span>
                  <span v-else class="text-sm text-gray-400">—</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span v-if="item.result" class="text-sm text-gray-900">{{ fmtGB(item.result.totalNeeded) }}</span>
                  <span v-else class="text-sm text-gray-400">—</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span v-if="item.result" class="text-sm font-medium text-gray-900">{{ fmtToks(item.result.singleToks) }}</span>
                  <span v-else class="text-sm text-gray-400">—</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    v-if="item.canRun"
                    class="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700"
                  >
                    ✓ {{ t('ranking.status_runnable') }}
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700"
                  >
                    ✗ {{ t('ranking.status_oom') }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    v-if="item.canRun"
                    @click="useThisModel(item)"
                    class="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    {{ t('ranking.use_config') }}
                  </button>
                  <span v-else class="text-xs text-gray-400">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 移动端：卡片视图 -->
      <div class="sm:hidden space-y-3">
        <div
          v-for="item in modelResults"
          :key="item.model.id"
          class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          :class="{ 'opacity-60': !item.canRun }"
        >
          <!-- 顶部色条：可运行绿 / OOM 红 -->
          <div :class="item.canRun ? 'bg-emerald-500' : 'bg-red-400'" class="h-1 w-full" />

          <div class="p-4">
            <!-- 标题行 -->
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap mb-1">
                  <span
                    :class="item.model.type === 'moe' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'"
                    class="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                  >{{ item.model.type === 'moe' ? 'MoE' : 'Dense' }}</span>
                  <span v-if="isNew(item.model.released)" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-600 flex-shrink-0">NEW</span>
                  <span v-if="item.cpuOffload" class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 flex-shrink-0">CPU offload</span>
                </div>
                <h3 class="text-base font-bold text-gray-900 leading-tight">{{ item.model.name }}</h3>
                <!-- 参数量 / 上下文 / 激活参数 -->
                <div class="flex items-center gap-2 mt-1 flex-wrap">
                  <span class="text-xs text-gray-500">{{ fmtParams(item.model.params) }}</span>
                  <span class="text-gray-300 text-xs">·</span>
                  <span class="text-xs text-gray-500">{{ fmtCtx(item.model.max_ctx) }} ctx</span>
                  <template v-if="item.model.type === 'moe' && item.model.active_params">
                    <span class="text-gray-300 text-xs">·</span>
                    <span class="text-xs text-amber-600">{{ fmtParams(item.model.active_params) }} active</span>
                  </template>
                </div>
              </div>
              <!-- 状态 badge -->
              <span
                :class="item.canRun ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'"
                class="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
              >
                {{ item.canRun ? '✓ ' + t('ranking.status_runnable') : '✗ ' + t('ranking.status_oom') }}
              </span>
            </div>

            <!-- 速度大卡（可运行时显示）-->
            <div v-if="item.result" class="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 px-4 py-3 mb-3 flex items-center justify-between">
              <div>
                <div class="text-[10px] text-emerald-600 font-medium uppercase tracking-wide mb-0.5">{{ t('ranking.table_speed') }}</div>
                <div class="text-2xl font-bold text-emerald-700 leading-none">{{ fmtToks(item.result.singleToks) }}</div>
                <div class="text-[10px] text-emerald-500 mt-0.5">单请求</div>
              </div>
              <div class="text-right">
                <div class="text-[10px] text-gray-500 mb-0.5">TPOT</div>
                <div class="text-sm font-semibold text-gray-700">{{ fmtMs(item.result.tpot) }}</div>
                <div class="text-[10px] text-gray-400 mt-1">TTFT</div>
                <div class="text-sm font-semibold text-gray-700">{{ fmtMs(item.result.ttft) }}</div>
              </div>
            </div>

            <!-- 4 格数据网格 -->
            <div class="grid grid-cols-4 gap-1.5 mb-3">
              <div class="bg-gray-50 rounded-lg p-2 text-center">
                <div class="text-[10px] text-gray-400 mb-0.5">量化</div>
                <div class="text-xs font-semibold text-gray-800 truncate">
                  {{ item.quant?.label ?? '—' }}
                </div>
              </div>
              <div class="bg-gray-50 rounded-lg p-2 text-center">
                <div class="text-[10px] text-gray-400 mb-0.5">显存</div>
                <div class="text-xs font-semibold text-gray-800">
                  {{ item.result ? fmtGB(item.result.totalNeeded) : '—' }}
                </div>
              </div>
              <div class="bg-gray-50 rounded-lg p-2 text-center">
                <div class="text-[10px] text-gray-400 mb-0.5">显存%</div>
                <div
                  class="text-xs font-semibold"
                  :class="item.result && item.result.vramPct > 95 ? 'text-red-600' : item.result && item.result.vramPct > 80 ? 'text-amber-600' : 'text-gray-800'"
                >
                  {{ item.result ? item.result.vramPct.toFixed(0) + '%' : '—' }}
                </div>
              </div>
              <div class="bg-gray-50 rounded-lg p-2 text-center">
                <div class="text-[10px] text-gray-400 mb-0.5">瓶颈</div>
                <div class="text-xs font-semibold text-gray-800">
                  {{ item.result ? (item.result.bottleneck === 'bandwidth' ? 'BW' : 'Compute') : '—' }}
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <button
              v-if="item.canRun"
              @click="useThisModel(item)"
              class="w-full py-2.5 bg-emerald-600 active:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {{ t('ranking.use_config') }}
            </button>
            <div v-else class="w-full py-2.5 bg-gray-100 text-gray-400 text-sm font-medium rounded-xl text-center">
              {{ t('ranking.status_oom') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
