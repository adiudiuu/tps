<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { GPU_LIST } from '../../data/gpus/index.js'
import { INTERCONNECT_MAP } from '../../data/constants.js'
import { isNew } from '../../utils/format.js'
import { detectLocalGpu } from '../../utils/detectGpu.js'

const { t } = useI18n()

const gpu = defineModel('gpu', { required: true })
const gpuCount = defineModel('gpuCount', { required: true })
const interconnect = defineModel('interconnect', { required: true })

const GPU_COUNT_OPTIONS = [1, 2, 4, 8, 16]

// ── 搜索 combobox 状态 ──────────────────────────────
const searchQuery = ref('')
const isOpen = ref(false)
const comboboxRef = ref(null)
const inputRef = ref(null)

const filteredGpus = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return GPU_LIST
  return GPU_LIST.filter(g => g.name.toLowerCase().includes(q))
})

// 按 vendor 分组（仅过滤后的结果）
const vendorLabel = { nvidia: 'NVIDIA', amd: 'AMD', intel: 'Intel', domestic: '国产' }

const filteredGroups = computed(() => {
  const map = {}
  for (const g of filteredGpus.value) {
    if (!map[g.vendor]) map[g.vendor] = []
    map[g.vendor].push(g)
  }
  return Object.entries(map)
})

function openDropdown() {
  searchQuery.value = ''
  isOpen.value = true
  // 下一帧聚焦输入框
  setTimeout(() => inputRef.value?.focus(), 0)
}

function selectGpu(g) {
  gpu.value = g
  isOpen.value = false
  searchQuery.value = ''
}

function handleClickOutside(e) {
  if (comboboxRef.value && !comboboxRef.value.contains(e.target)) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  // 自动检测本机 GPU（静默，不打扰用户）
  autoDetect()
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

// ── 自动检测 ────────────────────────────────────────
const autoDetectMsg = ref('')  // '' | 'matched' | 'no_match' | 'error'

async function autoDetect() {
  const { gpu: matched, rawName } = await detectLocalGpu()
  if (matched) {
    gpu.value = matched
    autoDetectMsg.value = 'matched'
  } else if (rawName) {
    autoDetectMsg.value = 'no_match'
  }
  // error 静默忽略（WebGPU 不支持等情况不提示）
}

// ── 选 GPU 时自动匹配互联方式 ───────────────────────
watch(gpu, (g) => {
  if (!g?.nvlink_bw) return
  const matched = INTERCONNECT_MAP.find(ic => ic.bw === g.nvlink_bw)
  if (matched) interconnect.value = matched
})
</script>

<template>
  <section class="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
    <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">{{ t('gpu.title') }}</h2>

    <!-- GPU 型号 -->
    <div>
      <label class="block text-xs text-gray-500 mb-1">{{ t('gpu.model') }}</label>

      <!-- 自动检测提示（仅未匹配时显示） -->
      <div v-if="autoDetectMsg === 'no_match'" class="mb-1.5 text-xs px-2 py-1 rounded-md bg-amber-50 text-amber-700">
        ⚠️ {{ t('gpu.auto_no_match') }}
      </div>

      <!-- 可搜索 Combobox -->
      <div ref="comboboxRef" class="relative">
        <!-- 触发按钮：显示当前选中 GPU -->
        <button
          type="button"
          @click="openDropdown"
          class="w-full flex items-center justify-between bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 hover:border-gray-400 transition-colors"
        >
          <span>{{ gpu?.name ?? t('gpu.select_placeholder') }}{{ gpu && isNew(gpu.released) ? ' 🆕' : '' }}</span>
          <svg class="w-4 h-4 text-gray-400 shrink-0 ml-2 transition-transform" :class="{ 'rotate-180': isOpen }" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
          </svg>
        </button>

        <!-- 下拉面板 -->
        <div
          v-if="isOpen"
          class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
        >
          <!-- 搜索输入框 -->
          <div class="p-2 border-b border-gray-100">
            <input
              ref="inputRef"
              v-model="searchQuery"
              type="text"
              :placeholder="t('gpu.search_placeholder')"
              class="w-full bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <!-- 选项列表 -->
          <div class="max-h-64 overflow-y-auto">
            <template v-if="filteredGroups.length">
              <div v-for="([vendor, list]) in filteredGroups" :key="vendor">
                <div class="px-3 py-1 text-xs font-semibold text-gray-400 bg-gray-50 sticky top-0">
                  {{ vendorLabel[vendor] ?? vendor }}
                </div>
                <button
                  v-for="g in list"
                  :key="g.id"
                  type="button"
                  @click="selectGpu(g)"
                  class="w-full text-left px-3 py-1.5 text-sm hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                  :class="{ 'bg-emerald-50 text-emerald-700 font-medium': g.id === gpu?.id }"
                >
                  {{ g.name }}{{ isNew(g.released) ? ' 🆕' : '' }}
                </button>
              </div>
            </template>
            <div v-else class="px-3 py-4 text-sm text-gray-400 text-center">
              {{ t('gpu.no_result') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- GPU 规格展示 -->
    <div v-if="gpu" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div class="bg-gray-50 rounded-lg p-2 text-center">
        <div class="text-xs text-gray-500">{{ t('gpu.vram_label') }}</div>
        <div class="text-sm font-semibold text-emerald-700">{{ gpu.vram }} GB</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-2 text-center">
        <div class="text-xs text-gray-500">{{ t('gpu.bw_label') }}</div>
        <div class="text-sm font-semibold text-emerald-700 whitespace-nowrap">{{ gpu.bw }} <span class="text-xs">GB/s</span></div>
      </div>
      <div class="bg-gray-50 rounded-lg p-2 text-center">
        <div class="text-xs text-gray-500">{{ t('gpu.bf16_label') }}</div>
        <div class="text-sm font-semibold text-emerald-700">{{ gpu.bf16 }} <span class="text-xs">T</span></div>
      </div>
      <div class="bg-gray-50 rounded-lg p-2 text-center">
        <div class="text-xs text-gray-500">{{ t('gpu.tdp_label') }}</div>
        <div class="text-sm font-semibold text-gray-700">{{ gpu.tdp }} <span class="text-xs">W</span></div>
      </div>
    </div>

    <!-- GPU 数量 -->
    <div>
      <label class="block text-xs text-gray-500 mb-1">{{ t('gpu.count') }}</label>
      <div class="flex gap-2">
        <button
          v-for="n in GPU_COUNT_OPTIONS"
          :key="n"
          @click="gpuCount = n"
          :class="[
            'flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors',
            gpuCount === n
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
          ]"
        >{{ n }}</button>
      </div>
    </div>

    <!-- 互联方式（多卡时显示）-->
    <div v-if="gpuCount > 1">
      <label class="block text-xs text-gray-500 mb-1">{{ t('gpu.interconnect') }}</label>
      <select
        :value="interconnect.id"
        @change="interconnect = INTERCONNECT_MAP.find(i => i.id === $event.target.value)"
        class="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        <option v-for="ic in INTERCONNECT_MAP" :key="ic.id" :value="ic.id">
          {{ ic.label }} ({{ ic.bw }} GB/s)
        </option>
      </select>
    </div>
  </section>
</template>
