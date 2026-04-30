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
const sharedVram = defineModel('sharedVram', { default: 16 })

const isSharedMemory = computed(() => gpu.value?.sharedMemory && gpu.value?.vram === 0)

const GPU_COUNT_OPTIONS = [1, 2, 4, 8, 16]

const customCountInput = ref('')
const isCustomCount = computed(() => !GPU_COUNT_OPTIONS.includes(gpuCount.value))

function applyCustomCount() {
  const v = parseInt(customCountInput.value)
  if (v >= 1 && v <= 512) gpuCount.value = v
  customCountInput.value = ''
}

// ── 搜索 combobox 状态 ──────────────────────────────
const searchQuery = ref('')
const isOpen = ref(false)
const comboboxRef = ref(null)
const inputRef = ref(null)
const dropdownRef = ref(null)

const filteredGpus = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return GPU_LIST
  return GPU_LIST.filter(g => g.name.toLowerCase().includes(q))
})

// 按 vendor 分组（仅过滤后的结果）
const vendorLabel = { nvidia: 'NVIDIA', amd: 'AMD', intel: 'Intel', apple: 'Apple Silicon', domestic: '国产' }

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
  setTimeout(() => {
    inputRef.value?.focus()
    // 滚到当前选中项
    const el = dropdownRef.value?.querySelector(`[data-gpu-id="${gpu.value?.id}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, 0)
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
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

// ── 手动检测 ────────────────────────────────────────
const detectState = ref('')  // '' | 'loading' | 'matched' | 'no_match'

async function manualDetect() {
  detectState.value = 'loading'
  const { gpu: matched, rawName } = await detectLocalGpu()
  if (matched) {
    gpu.value = matched
    detectState.value = 'matched'
  } else if (rawName) {
    detectState.value = 'no_match'
  } else {
    detectState.value = 'no_match'
  }
}

// ── 选 GPU 时自动匹配互联方式 ───────────────────────
watch(gpu, (g) => {
  if (g?.vendor === 'apple') {
    gpuCount.value = 1
    return
  }
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
      <div class="flex items-center justify-between mb-1">
        <label class="text-xs text-gray-500">{{ t('gpu.model') }}</label>
        <button
          type="button"
          @click="manualDetect"
          :disabled="detectState === 'loading'"
          class="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border transition-colors"
          :class="detectState === 'loading'
            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
            : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'"
        >
          <svg v-if="detectState === 'loading'" class="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          <svg v-else class="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/>
          </svg>
          {{ detectState === 'loading' ? t('gpu.detecting') : t('gpu.detect_btn') }}
        </button>
      </div>

      <!-- 检测提示 -->
      <div v-if="detectState === 'no_match'" class="mb-1.5 text-xs px-2 py-1 rounded-md bg-amber-50 text-amber-700">
        ⚠️ {{ t('gpu.auto_no_match') }}
      </div>
      <div v-if="detectState === 'matched'" class="mb-1.5 text-xs px-2 py-1 rounded-md bg-emerald-50 text-emerald-700">
        ✓ {{ t('gpu.detect_matched') }}
      </div>

      <!-- 可搜索 Combobox -->
      <div ref="comboboxRef" class="relative">
        <!-- 触发按钮：显示当前选中 GPU -->
        <button
          type="button"
          @click="openDropdown"
          class="w-full flex items-center justify-between bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 hover:border-gray-400 transition-colors"
        >
          <span class="flex items-center gap-1.5">
            {{ gpu?.name ?? t('gpu.select_placeholder') }}
            <span v-if="gpu && isNew(gpu.released)" class="inline-block w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
          </span>
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
          <div ref="dropdownRef" class="max-h-96 overflow-y-auto">
            <template v-if="filteredGroups.length">
              <div v-for="([vendor, list]) in filteredGroups" :key="vendor">
                <div class="px-3 py-1 text-xs font-semibold text-gray-400 bg-gray-50 sticky top-0">
                  {{ vendorLabel[vendor] ?? vendor }}
                </div>
                <button
                  v-for="g in list"
                  :key="g.id"
                  :data-gpu-id="g.id"
                  type="button"
                  @click="selectGpu(g)"
                  class="w-full text-left px-3 py-2 hover:bg-emerald-50 transition-colors border-b border-gray-50 last:border-0"
                  :class="{ 'bg-emerald-50 text-emerald-700': g.id === gpu?.id }"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-1.5 mb-0.5">
                        <span class="text-sm font-medium truncate" :class="g.id === gpu?.id ? 'text-emerald-700' : 'text-gray-900'">
                          {{ g.name }}
                        </span>
                        <span v-if="isNew(g.released)" class="inline-block w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                      </div>
                      <div class="flex items-center gap-3 text-[11px]" :class="g.id === gpu?.id ? 'text-emerald-600' : 'text-gray-500'">
                        <span class="flex items-center gap-0.5">
                          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                          {{ g.sharedMemory ? '共享' : g.vram + 'GB' }}
                        </span>
                        <span class="flex items-center gap-0.5">
                          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          {{ g.bw }}GB/s
                        </span>
                        <span class="flex items-center gap-0.5">
                          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                          {{ g.bf16 }}T
                        </span>
                        <span class="flex items-center gap-0.5">
                          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          {{ g.tdp }}W
                        </span>
                      </div>
                    </div>
                  </div>
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
        <div class="text-sm font-semibold text-emerald-700">{{ isSharedMemory ? sharedVram : gpu.vram }} GB</div>
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

    <!-- 共享内存输入（iGPU 时显示）-->
    <div v-if="isSharedMemory" class="flex items-center gap-3 px-1">
      <label class="text-xs text-gray-500 whitespace-nowrap">{{ t('gpu.shared_vram_label') }}</label>
      <input
        :value="sharedVram"
        @input="sharedVram = Math.max(1, Math.min(512, Number($event.target.value) || 16))"
        type="number" min="1" max="512" step="1"
        class="w-24 py-1 px-2 rounded-lg text-sm border border-amber-300 bg-amber-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500 text-center"
      />
      <span class="text-xs text-gray-400">GB &nbsp;—&nbsp; {{ t('gpu.shared_vram_hint') }}</span>
    </div>

    <!-- GPU 数量（Apple Silicon 不支持多卡）-->
    <div v-if="gpu?.vendor !== 'apple'">
      <label class="block text-xs text-gray-500 mb-1">{{ t('gpu.count') }}</label>
      <!-- 预设按钮 -->
      <div class="flex gap-2">
        <button
          v-for="n in GPU_COUNT_OPTIONS"
          :key="n"
          @click="gpuCount = n"
          :class="[
            'flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors',
            gpuCount === n
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
          ]"
        >{{ n }}</button>
      </div>
      <!-- 自定义数量输入（第二行）-->
      <div class="flex items-center gap-2 mt-2">
        <span class="text-xs text-gray-400">{{ t('gpu.count_custom') }}</span>
        <input
          v-model="customCountInput"
          type="number" min="1" max="512"
          :placeholder="isCustomCount ? String(gpuCount) : '32'"
          @keydown.enter="applyCustomCount"
          @blur="applyCustomCount"
          class="w-20 py-1 px-2 rounded-lg text-sm border border-gray-200 bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
        />
        <span v-if="isCustomCount" class="text-xs text-emerald-600 font-medium">
          {{ t('gpu.count_current', { n: gpuCount }) }}
        </span>
      </div>
    </div>

    <!-- 互联方式（多卡时显示，Apple Silicon 不支持）-->
    <div v-if="gpuCount > 1 && gpu?.vendor !== 'apple'">
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
