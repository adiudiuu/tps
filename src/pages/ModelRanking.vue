<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import TopBar from '../components/layout/TopBar.vue'
import GpuConfig from '../components/config/GpuConfig.vue'
import { GPU_LIST } from '../data/gpus/index.js'
import { ALL_MODELS } from '../data/models/index.js'
import { QUANT_MAP, FRAMEWORK_MAP, INTERCONNECT_MAP } from '../data/constants.js'
import { calcAll } from '../utils/calc.js'
import { fmtParams, fmtGB, fmtToks } from '../utils/format.js'

const { t } = useI18n()
const router = useRouter()

const gpu = ref(GPU_LIST.find(g => g.id === 'h100_sxm') ?? GPU_LIST[0])
const gpuCount = ref(1)
const interconnect = ref(INTERCONNECT_MAP[0])
const ctx = ref(16384)
const batch = ref(1)
const framework = ref(FRAMEWORK_MAP.find(f => f.id === 'theory'))

const isCalculating = ref(false)
const sortBy = ref('speed') // 'speed' | 'vram' | 'params'
const filterType = ref('all') // 'all' | 'dense' | 'moe'
const showOnlyRunnable = ref(true)

const modelResults = computed(() => {
  if (!gpu.value || !framework.value) return []

  const results = []
  for (const model of ALL_MODELS) {
    // 过滤模型类型
    if (filterType.value !== 'all' && model.type !== filterType.value) continue

    // 找到最优量化精度（能运行的最高精度）
    let bestQuant = null
    let bestResult = null

    for (const quant of QUANT_MAP) {
      try {
        const result = calcAll({
          gpu: gpu.value,
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
          cpuOffload: false,
          pcieBw: null,
          speculativeDecoding: false,
          acceptanceRate: 0.7,
          draftLen: 4,
        })

        if (result.vramOk) {
          // 优先选择更高精度的量化
          if (!bestResult || quant.bytes > bestQuant.bytes) {
            bestQuant = quant
            bestResult = result
          }
        }
      } catch (e) {
        // 跳过计算失败的模型
      }
    }

    if (bestResult || !showOnlyRunnable.value) {
      results.push({
        model,
        quant: bestQuant,
        result: bestResult,
        canRun: !!bestResult,
      })
    }
  }

  // 排序
  results.sort((a, b) => {
    if (sortBy.value === 'speed') {
      if (!a.result) return 1
      if (!b.result) return -1
      return b.result.decodeToks - a.result.decodeToks
    } else if (sortBy.value === 'vram') {
      if (!a.result) return 1
      if (!b.result) return -1
      return a.result.totalNeeded - b.result.totalNeeded
    } else if (sortBy.value === 'params') {
      return b.model.params - a.model.params
    }
    return 0
  })

  return results
})

function useThisModel(modelData) {
  // 跳转到主页并应用该模型配置（参数名与 useUrlState.js 保持一致）
  const query = {
    gpu:   gpu.value.id,
    n:     gpuCount.value !== 1 ? gpuCount.value : undefined,
    ic:    interconnect.value?.id ?? undefined,
    model: modelData.model.id,
    quant: modelData.quant?.id ?? 'bf16',
    fw:    framework.value.id,
    ctx:   ctx.value,
    b:     batch.value !== 1 ? batch.value : undefined,
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
        <GpuConfig v-model:gpu="gpu" v-model:gpuCount="gpuCount" v-model:interconnect="interconnect" />
      </div>

      <!-- 筛选和排序 -->
      <div class="bg-white rounded-xl border border-gray-200 p-4">
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700">{{ t('ranking.filter_type') }}:</label>
            <select v-model="filterType" class="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
              <option value="all">{{ t('ranking.filter_all') }}</option>
              <option value="dense">{{ t('ranking.filter_dense') }}</option>
              <option value="moe">{{ t('ranking.filter_moe') }}</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700">{{ t('ranking.sort_by') }}:</label>
            <select v-model="sortBy" class="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
              <option value="speed">{{ t('ranking.sort_speed') }}</option>
              <option value="vram">{{ t('ranking.sort_vram') }}</option>
              <option value="params">{{ t('ranking.sort_params') }}</option>
            </select>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="showOnlyRunnable"
              v-model="showOnlyRunnable"
              class="w-4 h-4 accent-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label for="showOnlyRunnable" class="text-sm text-gray-700">{{ t('ranking.show_only_runnable') }}</label>
          </div>

          <div class="ml-auto text-sm text-gray-600">
            {{ t('ranking.total_models', { count: modelResults.length }) }}
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
                  <span v-if="item.result" class="text-sm font-medium text-gray-900">{{ fmtToks(item.result.decodeToks) }}</span>
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
          class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
          :class="{ 'opacity-60': !item.canRun }"
        >
          <!-- 标题行 -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-gray-900 truncate">{{ item.model.name }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span
                  :class="item.model.type === 'moe' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'"
                  class="text-xs font-medium px-2 py-0.5 rounded-full"
                >
                  {{ item.model.type === 'moe' ? 'MoE' : 'Dense' }}
                </span>
                <span class="text-xs text-gray-500">{{ fmtParams(item.model.params) }}</span>
              </div>
            </div>
            <span
              v-if="item.canRun"
              class="flex-shrink-0 inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700"
            >
              ✓ {{ t('ranking.status_runnable') }}
            </span>
            <span
              v-else
              class="flex-shrink-0 inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700"
            >
              ✗ {{ t('ranking.status_oom') }}
            </span>
          </div>

          <!-- 信息网格 -->
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div class="bg-gray-50 rounded-lg p-2.5">
              <div class="text-xs text-gray-500 mb-0.5">{{ t('ranking.table_best_quant') }}</div>
              <div class="text-sm font-medium text-gray-900">
                <span v-if="item.quant">{{ item.quant.label }}</span>
                <span v-else class="text-gray-400">—</span>
              </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-2.5">
              <div class="text-xs text-gray-500 mb-0.5">{{ t('ranking.table_vram') }}</div>
              <div class="text-sm font-medium text-gray-900">
                <span v-if="item.result">{{ fmtGB(item.result.totalNeeded) }}</span>
                <span v-else class="text-gray-400">—</span>
              </div>
            </div>
          </div>

          <!-- 速度显示 -->
          <div v-if="item.result" class="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-2.5 mb-3">
            <div class="text-xs text-gray-600 mb-0.5">{{ t('ranking.table_speed') }}</div>
            <div class="text-lg font-bold text-emerald-700">{{ fmtToks(item.result.decodeToks) }}</div>
          </div>

          <!-- 操作按钮 -->
          <button
            v-if="item.canRun"
            @click="useThisModel(item)"
            class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {{ t('ranking.use_config') }}
          </button>
          <div v-else class="w-full py-2.5 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg text-center">
            {{ t('ranking.status_oom') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
