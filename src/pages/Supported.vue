<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import TopBar from '../components/layout/TopBar.vue'
import { ALL_MODELS } from '../data/models/index.js'
import { GPU_LIST } from '../data/gpus/index.js'
import { fmtParams, fmtCtx, isNew } from '../utils/format.js'

const router = useRouter()
const { locale } = useI18n()
const isZh = computed(() => locale.value === 'zh')

const activeTab = ref('models')
const modelSearch = ref('')
const gpuSearch = ref('')

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
  if (rest.length) groups.push({ label: isZh.value ? '其他' : 'Others', list: rest })
  return groups
})

// ── GPU 分组 ──────────────────────────────────────
const GPU_GROUPS = [
  { zh: 'NVIDIA 数据中心', en: 'NVIDIA Datacenter', match: g => g.vendor === 'nvidia' && g.tier === 'datacenter' },
  { zh: 'NVIDIA RTX 50',  en: 'NVIDIA RTX 50',     match: g => g.vendor === 'nvidia' && /^rtx5/.test(g.id) },
  { zh: 'NVIDIA RTX 40',  en: 'NVIDIA RTX 40',     match: g => g.vendor === 'nvidia' && /^rtx4/.test(g.id) },
  { zh: 'NVIDIA RTX 30',  en: 'NVIDIA RTX 30',     match: g => g.vendor === 'nvidia' && /^rtx3/.test(g.id) },
  { zh: 'NVIDIA RTX 20',  en: 'NVIDIA RTX 20',     match: g => g.vendor === 'nvidia' && /^rtx2/.test(g.id) },
  { zh: 'NVIDIA GTX',     en: 'NVIDIA GTX',        match: g => g.vendor === 'nvidia' && /^gtx/.test(g.id) },
  { zh: 'NVIDIA 专业卡',  en: 'NVIDIA Pro / DGX',  match: g => g.vendor === 'nvidia' && /^(rtx_|dgx)/.test(g.id) },
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
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <TopBar />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      <!-- 统计卡片 -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div class="text-3xl font-bold text-emerald-600">{{ ALL_MODELS.length }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ isZh ? '支持模型' : 'Models' }}</div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div class="text-3xl font-bold text-blue-600">{{ GPU_LIST.length }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ isZh ? '支持 GPU' : 'GPUs' }}</div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div class="text-3xl font-bold text-amber-600">{{ ALL_MODELS.filter(m => m.type === 'moe').length }}</div>
          <div class="text-xs text-gray-500 mt-1">MoE {{ isZh ? '模型' : 'Models' }}</div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div class="text-3xl font-bold text-purple-600">{{ ALL_MODELS.filter(m => isNew(m.released)).length }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ isZh ? '近期新增' : 'Recently Added' }}</div>
        </div>
      </div>

      <!-- Tab 切换 -->
      <div class="flex gap-2 mb-6">
        <button
          @click="activeTab = 'models'"
          :class="['px-5 py-2 rounded-lg text-sm font-medium border transition-colors',
            activeTab === 'models'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50']"
        >
          {{ isZh ? '模型列表' : 'Models' }}
        </button>
        <button
          @click="activeTab = 'gpus'"
          :class="['px-5 py-2 rounded-lg text-sm font-medium border transition-colors',
            activeTab === 'gpus'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50']"
        >
          {{ isZh ? 'GPU 列表' : 'GPUs' }}
        </button>
      </div>

      <!-- ── 模型 ── -->
      <template v-if="activeTab === 'models'">
        <div class="mb-4">
          <input
            v-model="modelSearch"
            type="text"
            :placeholder="isZh ? '搜索模型名称...' : 'Search models...'"
            class="w-full sm:w-80 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                @click="selectModel(m)"
                class="group flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-left hover:border-emerald-400 hover:shadow-sm transition-all"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span
                    :class="m.type === 'moe'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'"
                    class="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                  >{{ m.type === 'moe' ? 'MoE' : 'Dense' }}</span>
                  <span class="text-sm text-gray-800 truncate group-hover:text-emerald-700 transition-colors">{{ m.name }}</span>
                  <span v-if="isNew(m.released)" class="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <span class="text-xs text-gray-400">{{ fmtParams(m.params) }}</span>
                  <span class="text-xs text-gray-300">·</span>
                  <span class="text-xs text-gray-400">{{ fmtCtx(m.max_ctx) }}</span>
                </div>
              </button>
            </div>
          </div>
          <div v-if="modelGroups.length === 0" class="text-center text-gray-400 py-12 text-sm">
            {{ isZh ? '无匹配结果' : 'No results found' }}
          </div>
        </div>
      </template>

      <!-- ── GPU ── -->
      <template v-if="activeTab === 'gpus'">
        <div class="mb-4">
          <input
            v-model="gpuSearch"
            type="text"
            :placeholder="isZh ? '搜索 GPU 型号...' : 'Search GPUs...'"
            class="w-full sm:w-80 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                @click="selectGpu(g)"
                class="group flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-left hover:border-emerald-400 hover:shadow-sm transition-all"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span
                    :class="g.tier === 'datacenter'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'"
                    class="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                  >{{ g.tier === 'datacenter' ? 'DC' : 'CS' }}</span>
                  <span class="text-sm text-gray-800 truncate group-hover:text-emerald-700 transition-colors">{{ g.name }}</span>
                  <span v-if="isNew(g.released)" class="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <span class="text-xs text-gray-400">{{ g.vram }}GB</span>
                  <span class="text-xs text-gray-300">·</span>
                  <span class="text-xs text-gray-400">{{ g.bw }}GB/s</span>
                </div>
              </button>
            </div>
          </div>
          <div v-if="gpuGroups.length === 0" class="text-center text-gray-400 py-12 text-sm">
            {{ isZh ? '无匹配结果' : 'No results found' }}
          </div>
        </div>
      </template>

    </div>
  </div>
</template>
