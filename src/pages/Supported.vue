<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import TopBar from '../components/layout/TopBar.vue'
import { ALL_MODELS } from '../data/models/index.js'
import { GPU_LIST } from '../data/gpus/index.js'
import { fmtParams, fmtCtx, isNew } from '../utils/format.js'

const router = useRouter()
const { t, locale } = useI18n()
const isZh = computed(() => locale.value === 'zh')

const activeTab = ref('models')
const modelSearch = ref('')
const gpuSearch = ref('')
const hoveredModel = ref(null)
const hoveredGpu = ref(null)
const hoverPosition = ref({ x: 0, y: 0 })
const detailModel = ref(null)  // 点击查看详情的模型
const detailGpu = ref(null)    // 点击查看详情的 GPU

// 从 URL 或 sessionStorage 获取当前选中的模型和 GPU
const currentModelId = ref(null)
const currentGpuId = ref(null)

// 初始化时读取当前选中项
const savedQuery = getSavedQuery()
currentModelId.value = savedQuery.model || null
currentGpuId.value = savedQuery.gpu || null

// ── 模型分组 ──────────────────────────────────────
const MODEL_FAMILIES = [
  { key: 'DeepSeek', match: m => /deepseek/i.test(m.name) },
  { key: 'Qwen',     match: m => /qwen/i.test(m.name) },
  { key: 'Llama',    match: m => /llama/i.test(m.name) },
  { key: 'Gemma',    match: m => /gemma/i.test(m.name) },
  { key: 'GLM',      match: m => /glm/i.test(m.name) },
  { key: 'MiniMax',  match: m => /minimax/i.test(m.name) },
  { key: 'Kimi',     match: m => /kimi/i.test(m.name) },
  { key: 'Mistral',  match: m => /mistral|mixtral/i.test(m.name) },
  { key: 'GPT',      match: m => /gpt/i.test(m.name) },
  { key: 'Phi',      match: m => /phi/i.test(m.name) },
]

const filteredModels = computed(() => {
  const q = modelSearch.value.trim().toLowerCase()
  return q ? ALL_MODELS.filter(m => m.name.toLowerCase().includes(q)) : ALL_MODELS
})

const modelGroups = computed(() => {
  const used = new Set()
  const groups = []
  for (const fam of MODEL_FAMILIES) {
    const list = filteredModels.value.filter(m => !used.has(m.id) && fam.match(m))
    if (list.length) { list.forEach(m => used.add(m.id)); groups.push({ label: fam.key, list }) }
  }
  const rest = filteredModels.value.filter(m => !used.has(m.id))
  if (rest.length) groups.push({ label: t('supported.others'), list: rest })
  return groups
})

// ── GPU 分组 ──────────────────────────────────────
const GPU_GROUPS = [
  { zh: 'Apple Silicon',  en: 'Apple Silicon',     match: g => g.vendor === 'apple' },
  { zh: 'NVIDIA 数据中心', en: 'NVIDIA Datacenter', match: g => g.vendor === 'nvidia' && g.tier === 'datacenter' },
  { zh: 'NVIDIA RTX 50',  en: 'NVIDIA RTX 50',     match: g => g.vendor === 'nvidia' && /^rtx5/.test(g.id) },
  { zh: 'NVIDIA RTX 40',  en: 'NVIDIA RTX 40',     match: g => g.vendor === 'nvidia' && /^rtx4/.test(g.id) },
  { zh: 'NVIDIA RTX 30',  en: 'NVIDIA RTX 30',     match: g => g.vendor === 'nvidia' && /^rtx3/.test(g.id) },
  { zh: 'NVIDIA RTX 20',  en: 'NVIDIA RTX 20',     match: g => g.vendor === 'nvidia' && /^rtx2/.test(g.id) },
  { zh: 'NVIDIA GTX',     en: 'NVIDIA GTX',        match: g => g.vendor === 'nvidia' && /^gtx/.test(g.id) },
  { zh: 'NVIDIA 专业卡',  en: 'NVIDIA Pro / DGX',  match: g => g.vendor === 'nvidia' && (/^rtx_/.test(g.id) || g.id === 'dgx_spark') },
  { zh: 'AMD 数据中心',   en: 'AMD Datacenter',    match: g => g.vendor === 'amd' && g.tier === 'datacenter' },
  { zh: 'AMD RX 9000',    en: 'AMD RX 9000',       match: g => g.vendor === 'amd' && /^rx9/.test(g.id) },
  { zh: 'AMD RX 7000',    en: 'AMD RX 7000',       match: g => g.vendor === 'amd' && /^rx7/.test(g.id) },
  { zh: 'AMD RX 6000',    en: 'AMD RX 6000',       match: g => g.vendor === 'amd' && /^rx6/.test(g.id) },
  { zh: 'AMD RX 5000',    en: 'AMD RX 5000',       match: g => g.vendor === 'amd' && /^rx5/.test(g.id) },
  { zh: 'AMD 旧款 / 集显', en: 'AMD Older / iGPU', match: g => g.vendor === 'amd' && /^(vega|radeon|ryzen)/.test(g.id) },
  { zh: 'Intel Arc',      en: 'Intel Arc',         match: g => g.vendor === 'intel' && g.tier === 'consumer' },
  { zh: 'Intel 数据中心', en: 'Intel Datacenter',  match: g => g.vendor === 'intel' && g.tier === 'datacenter' },
  { zh: '国产加速卡',     en: 'Domestic',          match: g => g.vendor === 'domestic' },
]

const filteredGpus = computed(() => {
  const q = gpuSearch.value.trim().toLowerCase()
  return q ? GPU_LIST.filter(g => g.name.toLowerCase().includes(q)) : GPU_LIST
})

const gpuGroups = computed(() => {
  const used = new Set()
  const groups = []
  for (const grp of GPU_GROUPS) {
    const list = filteredGpus.value.filter(g => !used.has(g.id) && grp.match(g))
    if (list.length) {
      list.forEach(g => used.add(g.id))
      groups.push({ label: isZh.value ? grp.zh : grp.en, list })
    }
  }
  return groups
})

const SESSION_KEY = 'tps_calc_query'

function getSavedQuery() {
  const saved = sessionStorage.getItem(SESSION_KEY) ?? ''
  return Object.fromEntries(new URLSearchParams(saved))
}

function selectModel(m) {
  router.push({ path: '/', query: { ...getSavedQuery(), model: m.id } })
}

function selectGpu(g) {
  router.push({ path: '/', query: { ...getSavedQuery(), gpu: g.id } })
}

function handleModelHover(m, event) {
  hoveredModel.value = m
  updateHoverPosition(event)
}

function handleGpuHover(g, event) {
  hoveredGpu.value = g
  updateHoverPosition(event)
}

function updateHoverPosition(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const cardWidth = 384 // w-96 = 384px
  const cardHeight = 500 // 预估卡片高度
  const padding = 12
  const bottomNavHeight = 80 // 底部导航栏高度

  let x = rect.right + padding
  let y = rect.top

  // 如果右侧空间不够，显示在左侧
  if (x + cardWidth > window.innerWidth) {
    x = rect.left - cardWidth - padding
  }

  // 如果左侧也不够，居中显示
  if (x < 0) {
    x = Math.max(padding, (window.innerWidth - cardWidth) / 2)
  }

  // 确保不超出底部（留出底部导航栏空间）
  const maxY = window.innerHeight - cardHeight - bottomNavHeight - padding
  if (y > maxY) {
    y = Math.max(padding, maxY)
  }

  // 确保不超出顶部
  if (y < padding) {
    y = padding
  }

  hoverPosition.value = { x, y }
}

function clearHover() {
  hoveredModel.value = null
  hoveredGpu.value = null
}

function openModelDetail(m) {
  detailModel.value = m
}

function openGpuDetail(g) {
  detailGpu.value = g
}

function closeDetail() {
  detailModel.value = null
  detailGpu.value = null
}

// 滚动到选中的项
function scrollToSelected() {
  setTimeout(() => {
    if (activeTab.value === 'models' && currentModelId.value) {
      const el = document.querySelector(`[data-model-id="${currentModelId.value}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else if (activeTab.value === 'gpus' && currentGpuId.value) {
      const el = document.querySelector(`[data-gpu-id="${currentGpuId.value}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}

// 监听 tab 切换，自动滚动到选中项
watch(activeTab, () => {
  scrollToSelected()
})

// 页面加载时滚动到选中项
onMounted(() => {
  scrollToSelected()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-gray-50 pt-12 sm:pt-14 pb-20 sm:pb-0">
    <TopBar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      <!-- 统计卡片 -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-4 text-center hover:shadow-md transition-shadow">
          <div class="text-3xl font-bold text-emerald-600">{{ ALL_MODELS.length }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('supported.models') }}</div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-4 text-center hover:shadow-md transition-shadow">
          <div class="text-3xl font-bold text-blue-600">{{ GPU_LIST.length }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('supported.gpus') }}</div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-4 text-center hover:shadow-md transition-shadow">
          <div class="text-3xl font-bold text-amber-600">{{ ALL_MODELS.filter(m => m.type === 'moe').length }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('supported.moe_models') }}</div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-4 text-center hover:shadow-md transition-shadow">
          <div class="text-3xl font-bold text-purple-600">{{ ALL_MODELS.filter(m => isNew(m.released)).length }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ t('supported.recently_added') }}</div>
        </div>
      </div>

      <!-- Tab 切换 -->
      <div class="flex gap-2 mb-6">
        <button
          @click="activeTab = 'models'"
          :class="['px-5 py-2 rounded-lg text-sm font-medium border transition-all',
            activeTab === 'models'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'bg-white/80 backdrop-blur-sm border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-white hover:shadow-sm']"
        >
          {{ t('supported.models_tab') }}
        </button>
        <button
          @click="activeTab = 'gpus'"
          :class="['px-5 py-2 rounded-lg text-sm font-medium border transition-all',
            activeTab === 'gpus'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'bg-white/80 backdrop-blur-sm border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-white hover:shadow-sm']"
        >
          {{ t('supported.gpus_tab') }}
        </button>
      </div>

      <!-- ── 模型 ── -->
      <template v-if="activeTab === 'models'">
        <div class="mb-4">
          <input
            v-model="modelSearch"
            type="text"
            :placeholder="t('supported.search_models')"
            class="w-full sm:w-80 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div class="space-y-6">
          <div v-for="group in modelGroups" :key="group.label">
            <div class="flex items-center gap-2 mb-3">
              <h3 class="text-sm font-semibold text-gray-700">{{ group.label }}</h3>
              <span class="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{{ group.list.length }}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              <button
                v-for="m in group.list"
                :key="m.id"
                :data-model-id="m.id"
                @click="selectModel(m)"
                @mouseenter="handleModelHover(m, $event)"
                @mouseleave="clearHover"
                :class="[
                  'group flex items-center justify-between backdrop-blur-sm border rounded-lg px-3 py-2.5 text-left hover:border-emerald-400 hover:shadow-md transition-all',
                  m.id === currentModelId
                    ? 'border-emerald-600 ring-2 ring-emerald-300 shadow-lg'
                    : 'bg-white/90 border-gray-200 shadow-sm'
                ]"
                :style="m.id === currentModelId ? { backgroundColor: 'rgb(209 250 229)' } : {}"
              >
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    :class="m.type === 'moe'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'"
                    class="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                  >{{ m.type === 'moe' ? 'MoE' : 'Dense' }}</span>
                  <span
                    :class="[
                      'text-sm truncate transition-colors',
                      m.id === currentModelId ? 'text-emerald-700 font-semibold' : 'text-gray-800 group-hover:text-emerald-700'
                    ]"
                  >{{ m.name }}</span>
                  <span v-if="isNew(m.released)" class="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <span class="text-xs text-gray-400 hidden sm:inline">{{ fmtParams(m.params) }}</span>
                  <span class="text-xs text-gray-300 hidden sm:inline">·</span>
                  <span class="text-xs text-gray-400 hidden sm:inline">{{ fmtCtx(m.max_ctx) }}</span>
                  <button
                    @click.stop="openModelDetail(m)"
                    class="sm:hidden p-1 rounded hover:bg-emerald-100 transition-colors"
                    :title="t('supported.view_details')"
                  >
                    <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </button>
            </div>
          </div>
          <div v-if="modelGroups.length === 0" class="text-center text-gray-400 py-12 text-sm">
            {{ t('supported.no_results') }}
          </div>
        </div>
      </template>

      <!-- ── GPU ── -->
      <template v-if="activeTab === 'gpus'">
        <div class="mb-4">
          <input
            v-model="gpuSearch"
            type="text"
            :placeholder="t('supported.search_gpus')"
            class="w-full sm:w-80 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div class="space-y-6">
          <div v-for="group in gpuGroups" :key="group.label">
            <div class="flex items-center gap-2 mb-3">
              <h3 class="text-sm font-semibold text-gray-700">{{ group.label }}</h3>
              <span class="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{{ group.list.length }}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              <button
                v-for="g in group.list"
                :key="g.id"
                :data-gpu-id="g.id"
                @click="selectGpu(g)"
                @mouseenter="handleGpuHover(g, $event)"
                @mouseleave="clearHover"
                :class="[
                  'group flex items-center justify-between backdrop-blur-sm border rounded-lg px-3 py-2.5 text-left hover:border-emerald-400 hover:shadow-md transition-all',
                  g.id === currentGpuId
                    ? 'border-emerald-600 ring-2 ring-emerald-300 shadow-lg'
                    : 'bg-white/90 border-gray-200 shadow-sm'
                ]"
                :style="g.id === currentGpuId ? { backgroundColor: 'rgb(209 250 229)' } : {}"
              >
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    :class="g.vendor === 'apple'
                      ? 'bg-purple-100 text-purple-700'
                      : g.tier === 'datacenter'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'"
                    class="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                  >{{ g.vendor === 'apple' ? 'AS' : g.tier === 'datacenter' ? 'DC' : 'CS' }}</span>
                  <span
                    :class="[
                      'text-sm truncate transition-colors',
                      g.id === currentGpuId ? 'text-emerald-700 font-semibold' : 'text-gray-800 group-hover:text-emerald-700'
                    ]"
                  >{{ g.name }}</span>
                  <span v-if="isNew(g.released)" class="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <span class="text-xs text-gray-400 hidden sm:inline">{{ g.vram }}GB</span>
                  <span class="text-xs text-gray-300 hidden sm:inline">·</span>
                  <span class="text-xs text-gray-400 hidden sm:inline">{{ g.bw }}GB/s</span>
                  <button
                    @click.stop="openGpuDetail(g)"
                    class="sm:hidden p-1 rounded hover:bg-emerald-100 transition-colors"
                    :title="t('supported.view_details')"
                  >
                    <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </button>
            </div>
          </div>
          <div v-if="gpuGroups.length === 0" class="text-center text-gray-400 py-12 text-sm">
            {{ t('supported.no_results') }}
          </div>
        </div>
      </template>

    </div>

    <!-- 模型悬停卡片 -->
    <Teleport to="body">
      <Transition name="hover-card">
      <div
        v-if="hoveredModel"
        class="fixed z-[9999] w-96 max-h-[calc(100vh-100px)] overflow-y-auto border border-gray-200 rounded-xl shadow-2xl p-4 pointer-events-none bg-white"
        :style="{
          left: hoverPosition.x + 'px',
          top: hoverPosition.y + 'px'
        }"
      >
        <div class="space-y-3">
          <!-- 标题 -->
          <div class="border-b border-gray-200 pb-2">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-base font-bold text-gray-900">{{ hoveredModel.name }}</h3>
              <span v-if="hoveredModel.type === 'moe'" class="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-medium">MoE</span>
              <span v-else class="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-medium">Dense</span>
              <span v-if="isNew(hoveredModel.released)" class="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">NEW</span>
            </div>
            <div class="text-xs text-gray-500">
              {{ t('supported.released') }}: {{ hoveredModel.released || '—' }}
            </div>
          </div>

          <!-- 核心参数 -->
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
              <div class="text-xs text-gray-600 mb-0.5">{{ t('supported.parameters') }}</div>
              <div class="text-lg font-bold text-gray-800">{{ fmtParams(hoveredModel.params) }}</div>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2.5 border border-blue-200">
              <div class="text-xs text-gray-600 mb-0.5">{{ t('supported.context') }}</div>
              <div class="text-lg font-bold text-blue-700">{{ fmtCtx(hoveredModel.max_ctx) }}</div>
            </div>
            <div v-if="hoveredModel.type === 'moe'" class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-2.5 border border-amber-200">
              <div class="text-xs text-gray-600 mb-0.5">{{ t('supported.active_params') }}</div>
              <div class="text-lg font-bold text-amber-700">{{ fmtParams(hoveredModel.active_params) }}</div>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2.5 border border-purple-200">
              <div class="text-xs text-gray-600 mb-0.5">{{ t('supported.attention') }}</div>
              <div class="text-sm font-bold text-purple-700">{{ hoveredModel.kv_heads }} KV</div>
            </div>
          </div>

          <!-- 架构详情 -->
          <div class="space-y-1.5">
            <div class="text-xs font-semibold text-gray-700 uppercase tracking-wide">{{ t('supported.architecture') }}</div>
            <div class="grid grid-cols-2 gap-1.5 text-xs">
              <div class="bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                <div class="text-gray-500 text-[10px]">{{ t('supported.layers') }}</div>
                <div class="font-semibold text-gray-900">{{ hoveredModel.layers }}</div>
              </div>
              <div class="bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                <div class="text-gray-500 text-[10px]">Hidden Size</div>
                <div class="font-semibold text-gray-900">{{ hoveredModel.hidden_size }}</div>
              </div>
              <div class="bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                <div class="text-gray-500 text-[10px]">KV Heads</div>
                <div class="font-semibold text-gray-900">{{ hoveredModel.kv_heads }}</div>
              </div>
              <div class="bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                <div class="text-gray-500 text-[10px]">Head Dim</div>
                <div class="font-semibold text-gray-900">{{ hoveredModel.head_dim }}</div>
              </div>
            </div>
          </div>

          <!-- MLA 压缩 -->
          <div v-if="hoveredModel.mla_ratio" class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-2 border border-purple-200">
            <div class="text-xs text-gray-600 mb-0.5">{{ t('supported.kv_cache_compression') }}</div>
            <div class="text-sm font-semibold text-purple-700">
              {{ (hoveredModel.mla_ratio * 100).toFixed(2) }}% ({{ (1 / hoveredModel.mla_ratio).toFixed(0) }}x)
            </div>
          </div>

          <!-- 混合注意力 -->
          <div v-if="hoveredModel.sliding_window" class="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-2 border border-blue-200">
            <div class="text-xs text-gray-600 mb-0.5">{{ t('supported.hybrid_attention') }}</div>
            <div class="text-sm font-semibold text-blue-700">
              {{ t('supported.window') }}: {{ hoveredModel.sliding_window }} · Local: {{ hoveredModel.local_layers }}
            </div>
          </div>
        </div>
      </div>
      </Transition>
    </Teleport>

    <!-- GPU 悬停卡片 -->
    <Teleport to="body">
      <Transition name="hover-card">
      <div
        v-if="hoveredGpu"
        class="fixed z-[9999] w-80 max-h-[calc(100vh-100px)] overflow-y-auto border border-gray-200 rounded-xl shadow-2xl p-4 pointer-events-none bg-white"
        :style="{
          left: hoverPosition.x + 'px',
          top: hoverPosition.y + 'px'
        }"
      >
        <div class="space-y-3">
          <!-- 标题 -->
          <div class="border-b border-gray-200 pb-2">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-base font-bold text-gray-900">{{ hoveredGpu.name }}</h3>
              <span v-if="isNew(hoveredGpu.released)" class="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">NEW</span>
            </div>
            <div class="text-xs text-gray-500">
              {{ hoveredGpu.vendor.toUpperCase() }} · {{ hoveredGpu.released || '—' }}
            </div>
          </div>

          <!-- 核心规格 -->
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
              <div class="text-xs text-gray-600 mb-0.5">{{ t('supported.vram') }}</div>
              <div class="text-lg font-bold text-gray-800">{{ hoveredGpu.vram }} <span class="text-sm">GB</span></div>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2.5 border border-blue-200">
              <div class="text-xs text-gray-600 mb-0.5">{{ t('supported.bandwidth') }}</div>
              <div class="text-lg font-bold text-blue-700">{{ hoveredGpu.bw }} <span class="text-sm">GB/s</span></div>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2.5 border border-purple-200">
              <div class="text-xs text-gray-600 mb-0.5">BF16 {{ t('supported.compute') }}</div>
              <div class="text-lg font-bold text-purple-700">{{ hoveredGpu.bf16 }} <span class="text-sm">T</span></div>
            </div>
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-2.5 border border-amber-200">
              <div class="text-xs text-gray-600 mb-0.5">{{ t('supported.tdp') }}</div>
              <div class="text-lg font-bold text-amber-700">{{ hoveredGpu.tdp }} <span class="text-sm">W</span></div>
            </div>
          </div>

          <!-- 高级算力 -->
          <div class="space-y-1.5">
            <div class="text-xs font-semibold text-gray-700 uppercase tracking-wide">{{ t('supported.advanced_compute') }}</div>
            <div class="grid grid-cols-3 gap-1.5 text-xs">
              <div v-if="hoveredGpu.fp8" class="bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                <div class="text-gray-500 text-[10px]">FP8</div>
                <div class="font-semibold text-gray-900">{{ hoveredGpu.fp8 }}T</div>
              </div>
              <div v-if="hoveredGpu.int8" class="bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                <div class="text-gray-500 text-[10px]">INT8</div>
                <div class="font-semibold text-gray-900">{{ hoveredGpu.int8 }}T</div>
              </div>
              <div v-if="hoveredGpu.int4" class="bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                <div class="text-gray-500 text-[10px]">INT4</div>
                <div class="font-semibold text-gray-900">{{ hoveredGpu.int4 }}T</div>
              </div>
            </div>
          </div>

          <!-- 互联信息 -->
          <div v-if="hoveredGpu.nvlink_bw" class="bg-gray-50 rounded-lg p-2 border border-gray-200">
            <div class="text-xs text-gray-600 mb-0.5">{{ t('supported.interconnect') }}</div>
            <div class="text-sm font-semibold text-gray-800">
              {{ hoveredGpu.nvlink_bw }} GB/s
            </div>
          </div>

          <!-- 可用显存比例 -->
          <div v-if="hoveredGpu.usableRatio && hoveredGpu.usableRatio < 1" class="text-xs text-gray-500 bg-amber-50 rounded px-2 py-1.5 border border-amber-200">
            ⚠️ {{ t('supported.usable_vram') }} {{ (hoveredGpu.usableRatio * 100).toFixed(0) }}%
          </div>
        </div>
      </div>
      </Transition>
    </Teleport>

    <!-- 模型详情弹窗（手机端点击查看）-->
    <Teleport to="body">
      <div
        v-if="detailModel"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
        @click="closeDetail"
      >
        <div
          class="w-full max-w-lg border border-gray-200 rounded-xl shadow-2xl p-4 max-h-[90vh] overflow-y-auto bg-white"
          @click.stop
        >
          <div class="space-y-3">
            <!-- 标题 -->
            <div class="border-b border-gray-100 pb-2 flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 class="text-base font-bold text-gray-900">{{ detailModel.name }}</h3>
                  <span v-if="detailModel.type === 'moe'" class="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-medium">MoE</span>
                  <span v-else class="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-medium">Dense</span>
                  <span v-if="isNew(detailModel.released)" class="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">NEW</span>
                </div>
                <div class="text-xs text-gray-600">
                  {{ t('supported.released') }}: {{ detailModel.released || '—' }}
                </div>
              </div>
              <button
                @click="closeDetail"
                class="ml-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- 核心参数 -->
            <div class="grid grid-cols-2 gap-2">
              <div class="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                <div class="text-xs text-gray-700 mb-0.5">{{ t('supported.parameters') }}</div>
                <div class="text-lg font-bold text-gray-800">{{ fmtParams(detailModel.params) }}</div>
              </div>
              <div class="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg p-2.5 border border-blue-300">
                <div class="text-xs text-gray-700 mb-0.5">{{ t('supported.context') }}</div>
                <div class="text-lg font-bold text-blue-800">{{ fmtCtx(detailModel.max_ctx) }}</div>
              </div>
              <div v-if="detailModel.type === 'moe'" class="bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg p-2.5 border border-amber-300">
                <div class="text-xs text-gray-700 mb-0.5">{{ t('supported.active_params') }}</div>
                <div class="text-lg font-bold text-amber-800">{{ fmtParams(detailModel.active_params) }}</div>
              </div>
              <div class="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-2.5 border border-purple-300">
                <div class="text-xs text-gray-700 mb-0.5">{{ t('supported.attention') }}</div>
                <div class="text-sm font-bold text-purple-800">{{ detailModel.kv_heads }} KV</div>
              </div>
            </div>

            <!-- 架构详情 -->
            <div class="space-y-1.5">
              <div class="text-xs font-semibold text-gray-700 uppercase tracking-wide">{{ t('supported.architecture') }}</div>
              <div class="grid grid-cols-2 gap-1.5 text-xs">
                <div class="bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                  <div class="text-gray-600 text-[10px]">{{ t('supported.layers') }}</div>
                  <div class="font-semibold text-gray-900">{{ detailModel.layers }}</div>
                </div>
                <div class="bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                  <div class="text-gray-600 text-[10px]">Hidden Size</div>
                  <div class="font-semibold text-gray-900">{{ detailModel.hidden_size }}</div>
                </div>
                <div class="bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                  <div class="text-gray-600 text-[10px]">KV Heads</div>
                  <div class="font-semibold text-gray-900">{{ detailModel.kv_heads }}</div>
                </div>
                <div class="bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                  <div class="text-gray-600 text-[10px]">Head Dim</div>
                  <div class="font-semibold text-gray-900">{{ detailModel.head_dim }}</div>
                </div>
              </div>
            </div>

            <!-- MLA 压缩 -->
            <div v-if="detailModel.mla_ratio" class="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-2 border border-purple-300">
              <div class="text-xs text-gray-700 mb-0.5">{{ t('supported.kv_cache_compression') }}</div>
              <div class="text-sm font-semibold text-purple-800">
                {{ (detailModel.mla_ratio * 100).toFixed(2) }}% ({{ (1 / detailModel.mla_ratio).toFixed(0) }}x)
              </div>
            </div>

            <!-- 混合注意力 -->
            <div v-if="detailModel.sliding_window" class="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-2 border border-blue-300">
              <div class="text-xs text-gray-700 mb-0.5">{{ t('supported.hybrid_attention') }}</div>
              <div class="text-sm font-semibold text-blue-800">
                {{ t('supported.window') }}: {{ detailModel.sliding_window }} · Local: {{ detailModel.local_layers }}
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-2 pt-2 border-t border-gray-100">
              <button
                @click="selectModel(detailModel)"
                class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {{ t('supported.use_this_model') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- GPU 详情弹窗（手机端点击查看）-->
    <Teleport to="body">
      <div
        v-if="detailGpu"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
        @click="closeDetail"
      >
        <div
          class="w-full max-w-lg border border-gray-200 rounded-xl shadow-2xl p-4 max-h-[90vh] overflow-y-auto bg-white"
          @click.stop
        >
          <div class="space-y-3">
            <!-- 标题 -->
            <div class="border-b border-gray-100 pb-2 flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 class="text-base font-bold text-gray-900">{{ detailGpu.name }}</h3>
                  <span v-if="isNew(detailGpu.released)" class="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">NEW</span>
                </div>
                <div class="text-xs text-gray-600">
                  {{ detailGpu.vendor.toUpperCase() }} · {{ detailGpu.released || '—' }}
                </div>
              </div>
              <button
                @click="closeDetail"
                class="ml-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- 核心规格 -->
            <div class="grid grid-cols-2 gap-2">
              <div class="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                <div class="text-xs text-gray-700 mb-0.5">{{ t('supported.vram') }}</div>
                <div class="text-lg font-bold text-gray-800">{{ detailGpu.vram }} <span class="text-sm">GB</span></div>
              </div>
              <div class="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg p-2.5 border border-blue-300">
                <div class="text-xs text-gray-700 mb-0.5">{{ t('supported.bandwidth') }}</div>
                <div class="text-lg font-bold text-blue-800">{{ detailGpu.bw }} <span class="text-sm">GB/s</span></div>
              </div>
              <div class="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-2.5 border border-purple-300">
                <div class="text-xs text-gray-700 mb-0.5">BF16 {{ t('supported.compute') }}</div>
                <div class="text-lg font-bold text-purple-800">{{ detailGpu.bf16 }} <span class="text-sm">T</span></div>
              </div>
              <div class="bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg p-2.5 border border-amber-300">
                <div class="text-xs text-gray-700 mb-0.5">{{ t('supported.tdp') }}</div>
                <div class="text-lg font-bold text-amber-800">{{ detailGpu.tdp }} <span class="text-sm">W</span></div>
              </div>
            </div>

            <!-- 高级算力 -->
            <div class="space-y-1.5">
              <div class="text-xs font-semibold text-gray-700 uppercase tracking-wide">{{ isZh ? '高级算力' : 'Advanced Compute' }}</div>
              <div class="grid grid-cols-3 gap-1.5 text-xs">
                <div v-if="detailGpu.fp8" class="bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                  <div class="text-gray-600 text-[10px]">FP8</div>
                  <div class="font-semibold text-gray-900">{{ detailGpu.fp8 }}T</div>
                </div>
                <div v-if="detailGpu.int8" class="bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                  <div class="text-gray-600 text-[10px]">INT8</div>
                  <div class="font-semibold text-gray-900">{{ detailGpu.int8 }}T</div>
                </div>
                <div v-if="detailGpu.int4" class="bg-gray-50 rounded px-2 py-1.5 border border-gray-200">
                  <div class="text-gray-600 text-[10px]">INT4</div>
                  <div class="font-semibold text-gray-900">{{ detailGpu.int4 }}T</div>
                </div>
              </div>
            </div>

            <!-- 互联信息 -->
            <div v-if="detailGpu.nvlink_bw" class="bg-gray-50 rounded-lg p-2 border border-gray-200">
              <div class="text-xs text-gray-700 mb-0.5">{{ isZh ? '多卡互联' : 'Interconnect' }}</div>
              <div class="text-sm font-semibold text-gray-800">
                {{ detailGpu.nvlink_bw }} GB/s
              </div>
            </div>

            <!-- 可用显存比例 -->
            <div v-if="detailGpu.usableRatio && detailGpu.usableRatio < 1" class="text-xs text-gray-700 bg-amber-100 rounded px-2 py-1.5 border border-amber-300">
              ⚠️ {{ isZh ? '可用显存约' : 'Usable VRAM' }} {{ (detailGpu.usableRatio * 100).toFixed(0) }}%
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-2 pt-2 border-t border-gray-100">
              <button
                @click="selectGpu(detailGpu)"
                class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {{ isZh ? '使用此 GPU' : 'Use This GPU' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.hover-card-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.hover-card-leave-active {
  transition: opacity 0.1s ease, transform 0.1s ease;
}
.hover-card-enter-from {
  opacity: 0;
  transform: translateY(6px) scale(0.97);
}
.hover-card-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.98);
}
</style>
