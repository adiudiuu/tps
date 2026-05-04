<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import Header from '../components/layout/Header.vue'
import ModelPicker from '../components/config/ModelPicker.vue'
import ResultRowContent from '../components/result/SolverResultRow.vue'
import { ALL_MODELS } from '../data/models/index.js'
import {
  solveForModel,
  QUANT_FLOOR_OPTIONS,
} from '../utils/solver.js'
import { fmtGB, fmtToks, fmtMs } from '../utils/format.js'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()

const _p = route.query
const hasInitialQuery = Object.keys(_p).length > 0

// ── 模式 A：给定模型 ──────────────────────────────────
const modelA = ref(ALL_MODELS.find(m => m.id === _p.model) ?? ALL_MODELS.find(m => m.id === 'deepseek_r1') ?? ALL_MODELS[0])
const maxGpuCount = ref(_p.maxg ? Math.max(1, Number(_p.maxg)) : 4)
const vendorFilter = ref(['all', 'nvidia', 'amd', 'apple', 'intel', 'domestic'].includes(_p.vendor) ? _p.vendor : 'all')
const quantFloor = ref(QUANT_FLOOR_OPTIONS.some(q => q.id === _p.qf) ? _p.qf : 'none')
const minDecodeSpeedA = ref(_p.minds ? String(_p.minds) : '')
const maxTtft = ref(_p.mttft ? String(_p.mttft) : '')

// ── 共用参数 ──────────────────────────────────────────
const ctx = ref(_p.ctx ? Math.max(512, Number(_p.ctx)) : 4096)
const batch = ref(_p.b ? Math.max(1, Number(_p.b)) : 1)
const promptLen = ref(_p.pl ? Math.max(1, Number(_p.pl)) : 512)
const outputLen = ref(_p.ol ? Math.max(1, Number(_p.ol)) : 256)

// ── 求解状态 ──────────────────────────────────────────
const solving = ref(false)
const progress = ref(0)
const progressTotal = ref(0)
const results = ref([])
const hasRun = ref(false)
const wasCancelled = ref(false)
const visibleNonParetoCount = ref(50)
const activeRunToken = ref(null)

// ── 结果排序 ──────────────────────────────────────────
const sortBy = ref('speed') // speed | vram | gpuCount | speedPerGpu

const sortedResults = computed(() => {
  const list = [...results.value]
  switch (sortBy.value) {
    case 'vram':        return list.sort((a, b) => a.vramNeeded - b.vramNeeded)
    case 'gpuCount':    return list.sort((a, b) => (a.totalGpuCount ?? a.gpuCount) - (b.totalGpuCount ?? b.gpuCount))
    case 'speedPerGpu': return list.sort((a, b) => (b.decodeSpeed / (b.totalGpuCount ?? b.gpuCount)) - (a.decodeSpeed / (a.totalGpuCount ?? a.gpuCount)))
    default:            return list.sort((a, b) => b.decodeSpeed - a.decodeSpeed)
  }
})

const paretoResults  = computed(() => sortedResults.value.filter(r => r.isPareto))
const nonParetoResults = computed(() => sortedResults.value.filter(r => !r.isPareto))
const visibleNonParetoResults = computed(() => nonParetoResults.value.slice(0, visibleNonParetoCount.value))

// ── 求解入口 ──────────────────────────────────────────
async function runSolver() {
  if (solving.value) return
  const runToken = { cancelled: false }
  activeRunToken.value = runToken
  solving.value = true
  progress.value = 0
  progressTotal.value = 0
  results.value = []
  hasRun.value = true
  wasCancelled.value = false
  visibleNonParetoCount.value = 50

  try {
    const commonParams = {
      ctx: ctx.value,
      batch: batch.value,
      promptLen: promptLen.value,
      outputLen: outputLen.value,
      onProgress: (done, total) => {
        progress.value = done
        progressTotal.value = total
      },
      shouldCancel: () => runToken.cancelled,
    }
    const outcome = await solveForModel({
      model: modelA.value,
      maxGpuCount: maxGpuCount.value,
      vendorFilter: vendorFilter.value,
      quantFloor: quantFloor.value,
      minDecodeSpeed: minDecodeSpeedA.value ? Number(minDecodeSpeedA.value) : null,
      maxTtft: maxTtft.value ? Number(maxTtft.value) : null,
      ...commonParams,
    })
    if (activeRunToken.value !== runToken) return
    if (outcome.cancelled) {
      wasCancelled.value = true
      return
    }
    results.value = outcome.results
  } finally {
    if (activeRunToken.value === runToken) {
      solving.value = false
      activeRunToken.value = null
    }
  }
}

function cancelSolver() {
  if (activeRunToken.value) activeRunToken.value.cancelled = true
}

function showMoreResults() {
  visibleNonParetoCount.value += 50
}

// ── 跳转到主计算器 ────────────────────────────────────
function useConfig(row) {
  router.push({
    path: '/',
    query: {
      gpu: row.gpu.id,
      n: row.gpuCount,
      ic: row.interconnect?.id,
      model: modelA.value.id,
      quant: row.quant.id,
      fw: row.framework.id,
      pp: row.ppCount > 1 ? row.ppCount : undefined,
      ep: row.epCount > 1 ? row.epCount : undefined,
      ctx: ctx.value,
      b: batch.value,
      pl: promptLen.value,
      ol: outputLen.value,
    },
  })
}

function progressPct() {
  if (!progressTotal.value) return 0
  return Math.round((progress.value / progressTotal.value) * 100)
}

// ── 常量 ──────────────────────────────────────────────
const GPU_COUNT_OPTIONS = [1, 2, 4, 8]
const VENDOR_OPTIONS = [
  { id: 'all',      label_zh: '全部',   label_en: 'All'      },
  { id: 'nvidia',   label_zh: 'NVIDIA', label_en: 'NVIDIA'   },
  { id: 'amd',      label_zh: 'AMD',    label_en: 'AMD'      },
  { id: 'apple',    label_zh: 'Apple',  label_en: 'Apple'    },
  { id: 'intel',    label_zh: 'Intel',  label_en: 'Intel'    },
  { id: 'domestic', label_zh: '国产',   label_en: 'Domestic' },
]
const SORT_OPTIONS = computed(() => [
  { id: 'speed',       label: t('solver.sort_speed')       },
  { id: 'vram',        label: t('solver.sort_vram')        },
  { id: 'gpuCount',    label: t('solver.sort_gpu_count')   },
  { id: 'speedPerGpu', label: t('solver.sort_speed_per_gpu') },
])

watch(
  [modelA, maxGpuCount, vendorFilter, quantFloor, minDecodeSpeedA, maxTtft, ctx, batch, promptLen, outputLen],
  ([model, maxg, vendor, qf, minds, mttft, ctxValue, batchValue, promptValue, outputValue]) => {
    const query = {}
    if (model?.id) query.model = model.id
    if (maxg !== 4) query.maxg = String(maxg)
    if (vendor !== 'all') query.vendor = vendor
    if (qf !== 'none') query.qf = qf
    if (minds !== '') query.minds = String(minds)
    if (mttft !== '') query.mttft = String(mttft)
    if (ctxValue !== 4096) query.ctx = String(ctxValue)
    if (batchValue !== 1) query.b = String(batchValue)
    if (promptValue !== 512) query.pl = String(promptValue)
    if (outputValue !== 256) query.ol = String(outputValue)
    router.replace({ query })
  },
  { immediate: true }
)

onMounted(() => {
  if (hasInitialQuery) runSolver()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <main class="pt-14 sm:pt-16 max-w-7xl mx-auto px-3 sm:px-4 pb-16">
      <!-- 页面标题 -->
      <div class="py-6 sm:py-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{{ t('solver.title') }}</h1>
        <p class="mt-1 text-sm text-gray-500">{{ t('solver.subtitle') }}</p>
        <RouterLink to="/ranking" class="inline-flex mt-3 text-sm font-medium text-emerald-700 hover:text-emerald-800">
          {{ t('solver.reverse_link') }}
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        <!-- ── 左侧：输入面板 ── -->
        <div class="space-y-4">

          <div class="bg-white rounded-xl border border-gray-200 p-4">
            <h2 class="text-sm font-semibold text-gray-700 mb-3">{{ t('model.title') }}</h2>
            <ModelPicker v-model:model="modelA" />
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <h2 class="text-sm font-semibold text-gray-700">{{ t('solver.constraints') }}</h2>

            <!-- 最大 GPU 数量 -->
            <div>
              <label class="block text-xs text-gray-500 mb-1.5">{{ t('solver.max_gpu_count') }}</label>
              <div class="flex gap-2">
                <button
                  v-for="n in GPU_COUNT_OPTIONS" :key="n"
                  @click="maxGpuCount = n"
                  class="flex-1 py-1.5 rounded-md text-sm font-medium border transition-colors"
                  :class="maxGpuCount === n
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'"
                >{{ n }}</button>
              </div>
            </div>

            <!-- GPU 厂商过滤 -->
            <div>
              <label class="block text-xs text-gray-500 mb-1.5">{{ t('solver.vendor_filter') }}</label>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="v in VENDOR_OPTIONS" :key="v.id"
                  @click="vendorFilter = v.id"
                  class="px-2.5 py-1 rounded-md text-xs font-medium border transition-colors"
                  :class="vendorFilter === v.id
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'"
                >{{ locale === 'zh' ? v.label_zh : v.label_en }}</button>
              </div>
            </div>

            <!-- 量化质量下限 -->
            <div>
              <label class="block text-xs text-gray-500 mb-1.5">{{ t('solver.quant_floor') }}</label>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="q in QUANT_FLOOR_OPTIONS" :key="q.id"
                  @click="quantFloor = q.id"
                  class="px-2.5 py-1 rounded-md text-xs font-medium border transition-colors"
                  :class="quantFloor === q.id
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'"
                >{{ locale === 'zh' ? q.label_zh : q.label_en }}</button>
              </div>
            </div>

            <!-- 最低 Decode 速度 -->
            <div>
              <label class="block text-xs text-gray-500 mb-1.5">
                {{ t('solver.min_decode_speed') }}
                <span class="text-gray-400 font-normal">{{ t('solver.optional') }}</span>
              </label>
              <div class="relative">
                <input v-model="minDecodeSpeedA" type="number" min="0" placeholder="—"
                  class="w-full px-3 py-1.5 pr-14 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">tok/s</span>
              </div>
            </div>

            <!-- TTFT 上限 -->
            <div>
              <label class="block text-xs text-gray-500 mb-1.5">
                {{ t('solver.max_ttft') }}
                <span class="text-gray-400 font-normal">{{ t('solver.optional') }}</span>
              </label>
              <div class="relative">
                <input v-model="maxTtft" type="number" min="0" placeholder="—"
                  class="w-full px-3 py-1.5 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">ms</span>
              </div>
            </div>
          </div>

          <!-- 共用推理参数 -->
          <div class="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <h2 class="text-sm font-semibold text-gray-700">{{ t('solver.inference_params') }}</h2>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ t('run.ctx') }}</label>
                <input v-model.number="ctx" type="number" min="512"
                  class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ t('run.batch') }}</label>
                <input v-model.number="batch" type="number" min="1"
                  class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ t('run.prompt') }}</label>
                <input v-model.number="promptLen" type="number" min="1"
                  class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">{{ t('run.output') }}</label>
                <input v-model.number="outputLen" type="number" min="1"
                  class="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
          </div>

          <!-- 求解按钮 -->
          <button
            v-if="!solving"
            @click="runSolver"
            class="w-full py-3 rounded-xl text-sm font-semibold transition-colors bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <span>{{ t('solver.run_btn') }}</span>
          </button>
          <button
            v-else
            @click="cancelSolver"
            class="w-full py-3 rounded-xl text-sm font-semibold transition-colors bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
          >
            <span class="flex items-center justify-center gap-2">
              <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ t('solver.running') }} {{ progressTotal ? `${progressPct()}%` : '' }} · {{ t('solver.cancel_btn') }}
            </span>
          </button>
        </div>

        <!-- ── 右侧：结果面板 ── -->
        <div>
          <!-- 进度条 -->
          <div v-if="solving" class="mb-4">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
              <span>{{ t('solver.progress_label') }}</span>
              <span>{{ progress }} / {{ progressTotal }}</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-emerald-500 rounded-full transition-all duration-300"
                :style="{ width: progressPct() + '%' }"
              />
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="!hasRun && !solving" class="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg viewBox="0 0 64 64" class="w-16 h-16 mb-3 opacity-30" fill="none">
              <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="3"/>
              <path d="M20 32h24M32 20v24" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
            <p class="text-sm">{{ t('solver.empty_hint') }}</p>
          </div>

          <!-- 无结果 -->
          <div v-else-if="hasRun && !solving && results.length === 0"
            class="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg viewBox="0 0 64 64" class="w-16 h-16 mb-3 opacity-30" fill="none">
              <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="3"/>
              <path d="M22 22l20 20M42 22L22 42" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
            <p class="text-sm">{{ wasCancelled ? t('solver.cancelled') : t('solver.no_results') }}</p>
          </div>

          <!-- 结果列表 -->
          <template v-else-if="results.length > 0">
            <!-- 统计 + 排序 -->
            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div class="text-sm text-gray-600">
                {{ t('solver.result_count', { total: results.length, pareto: paretoResults.length }) }}
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs text-gray-500">{{ t('solver.sort_by') }}</span>
                <div class="flex flex-wrap gap-1">
                  <button
                    v-for="opt in SORT_OPTIONS" :key="opt.id"
                    @click="sortBy = opt.id"
                    class="px-2 py-1 rounded text-xs font-medium border transition-colors"
                    :class="sortBy === opt.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'"
                  >{{ opt.label }}</button>
                </div>
              </div>
            </div>

            <!-- Pareto 前沿 -->
            <div v-if="paretoResults.length > 0" class="mb-2">
              <div class="flex items-center gap-2 mb-2">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                  <svg viewBox="0 0 16 16" class="w-3 h-3" fill="currentColor" aria-hidden="true">
                    <path d="M8 1l1.9 3.8 4.2.6-3 2.9.7 4.2L8 10.4l-3.8 2 .7-4.2-3-2.9 4.2-.6z"/>
                  </svg>
                  {{ t('solver.pareto_label') }}
                </span>
                <span class="text-xs text-gray-400">{{ t('solver.pareto_hint') }}</span>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(row, i) in paretoResults" :key="'p' + i"
                  class="bg-white rounded-xl border border-amber-200 p-3 sm:p-4 hover:border-amber-300 transition-colors"
                >
                  <ResultRowContent :row="row" :is-pareto="true" @use="useConfig(row)" />
                </div>
              </div>
            </div>

            <!-- 其余方案 -->
            <div v-if="nonParetoResults.length > 0">
              <div class="text-xs text-gray-400 mb-2 mt-4">{{ t('solver.other_results') }}</div>
              <div class="space-y-2">
                <div
                  v-for="(row, i) in visibleNonParetoResults" :key="'n' + i"
                  class="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:border-gray-300 transition-colors"
                >
                  <ResultRowContent :row="row" :is-pareto="false" @use="useConfig(row)" />
                </div>
              </div>
              <div v-if="nonParetoResults.length > visibleNonParetoCount" class="flex flex-col items-center gap-2 mt-3">
                <p class="text-xs text-gray-400 text-center">
                  {{ t('solver.truncated', { n: nonParetoResults.length - visibleNonParetoCount }) }}
                </p>
                <button
                  @click="showMoreResults"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  {{ t('solver.show_more') }}
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>
  </div>
</template>
