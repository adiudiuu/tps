<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { GPU_LIST } from '../../data/gpus/index.js'
import { INTERCONNECT_MAP } from '../../data/constants.js'
import { isNew } from '../../utils/format.js'
import { detectLocalGpu } from '../../utils/detectGpu.js'

const { t } = useI18n()

// ── Props / emits（gpuSlots 模式）──────────────────
const gpuSlots    = defineModel('gpuSlots',    { required: true })
const interconnect = defineModel('interconnect', { required: true })
const sharedVram   = defineModel('sharedVram',   { default: 16 })

// 主卡（第一个 slot 的 gpu），用于规格展示和 iGPU 判断
const primaryGpu = computed(() => gpuSlots.value[0]?.gpu ?? null)
const totalCount = computed(() => gpuSlots.value.reduce((s, g) => s + g.count, 0))
const isMixed    = computed(() => gpuSlots.value.length > 1)
const isSharedMemory = computed(() => primaryGpu.value?.sharedMemory && primaryGpu.value?.vram === 0)

// 多卡模式下每个 slot 的数量选项
const SLOT_COUNT_OPTIONS = [1, 2, 4, 8]

// 单卡模式下的数量快捷选项（旧版逻辑）
const SINGLE_COUNT_OPTIONS = [1, 2, 4, 8, 16]
const customCountInput = ref('')

const isApple = computed(() => primaryGpu.value?.vendor === 'apple')

// 单卡模式下的数量（第一个 slot 的 count）
const singleCount = computed(() => gpuSlots.value[0]?.count ?? 1)
const isCustomCount = computed(() => !SINGLE_COUNT_OPTIONS.includes(singleCount.value))

function setSingleCount(n) {
  gpuSlots.value = [{ ...gpuSlots.value[0], count: n }]
}

function applyCustomCount() {
  const v = parseInt(customCountInput.value)
  if (v >= 1 && v <= 512) setSingleCount(v)
  customCountInput.value = ''
}

// ── 单卡 / 多卡模式切换 ─────────────────────────────
const multiMode = ref(gpuSlots.value.length > 1)

function setMode(multi) {
  multiMode.value = multi
  if (!multi) {
    // 切回单卡：只保留第一个 slot
    gpuSlots.value = [{ ...gpuSlots.value[0] }]
    openSlot.value = null
  }
}

// 外部（URL 恢复）带多个 slot 进来时，自动进入多卡模式
watch(() => gpuSlots.value.length, (len) => {
  if (len > 1) multiMode.value = true
})

// ── Slot 增删 ───────────────────────────────────────
function addSlot() {
  const vendor = primaryGpu.value?.vendor ?? null
  // 默认选同 vendor 中第一张尚未被选中的 GPU
  const usedIds = new Set(gpuSlots.value.map(s => s.gpu?.id))
  const defaultGpu = GPU_LIST.find(g => g.vendor === vendor && !usedIds.has(g.id))
    ?? GPU_LIST.find(g => g.vendor === vendor)
    ?? GPU_LIST[0]
  gpuSlots.value = [...gpuSlots.value, { gpu: defaultGpu, count: 1 }]
}

function removeSlot(idx) {
  if (gpuSlots.value.length <= 1) return
  gpuSlots.value = gpuSlots.value.filter((_, i) => i !== idx)
}

function updateSlotCount(idx, n) {
  const slots = gpuSlots.value.map((s, i) => i === idx ? { ...s, count: n } : s)
  gpuSlots.value = slots
}

// ── 搜索 combobox 状态（每个 slot 独立）──────────────
const searchQuery = ref('')
const openSlot    = ref(null)   // 当前打开下拉的 slot 索引，null = 全关
const containerRef = ref(null)

const filteredGpus = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return GPU_LIST
  return GPU_LIST.filter(g => g.name.toLowerCase().includes(q))
})

// 按 vendor 分组
const vendorLabel = { nvidia: 'NVIDIA', amd: 'AMD', intel: 'Intel', apple: 'Apple Silicon', domestic: '国产' }

// 多卡模式下，非第一个 slot 的下拉只允许选主卡同 vendor 的 GPU
// allowedVendor: null 表示不限制（第一个 slot 或单卡模式）
function getAllowedVendor(idx) {
  if (!multiMode.value || idx === 0) return null
  return primaryGpu.value?.vendor ?? null
}

// 生成分组列表，跨 vendor 的组整体禁用
function getFilteredGroups(idx) {
  const allowed = getAllowedVendor(idx)
  const q = searchQuery.value.trim().toLowerCase()
  const list = q ? GPU_LIST.filter(g => g.name.toLowerCase().includes(q)) : GPU_LIST
  const map = {}
  for (const g of list) {
    if (!map[g.vendor]) map[g.vendor] = []
    map[g.vendor].push(g)
  }
  return Object.entries(map).map(([vendor, gpus]) => ({
    vendor,
    gpus,
    disabled: allowed !== null && vendor !== allowed,
  }))
}

// 兼容旧的 filteredGroups（单卡模式 / 第一个 slot 用）
const filteredGroups = computed(() => getFilteredGroups(openSlot.value ?? 0))

function openDropdown(idx) {
  searchQuery.value = ''
  openSlot.value = idx
}

function selectGpu(idx, g) {
  // 多卡模式下非第一个 slot 禁止选跨 vendor 的 GPU
  if (multiMode.value && idx !== 0 && g.vendor !== primaryGpu.value?.vendor) return
  const slots = gpuSlots.value.map((s, i) => i === idx ? { ...s, gpu: g } : s)
  gpuSlots.value = slots
  openSlot.value = null
  searchQuery.value = ''
}

function handleClickOutside(e) {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    openSlot.value = null
    searchQuery.value = ''
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))

// ── 手动检测 ────────────────────────────────────────
const detectState = ref('')  // '' | 'loading' | 'matched' | 'no_match'

async function manualDetect() {
  detectState.value = 'loading'
  const { gpu: matched, rawName } = await detectLocalGpu()
  if (matched) {
    // 检测结果替换第一个 slot
    const slots = gpuSlots.value.map((s, i) => i === 0 ? { ...s, gpu: matched } : s)
    gpuSlots.value = slots
    detectState.value = 'matched'
  } else {
    detectState.value = 'no_match'
  }
}

// ── 选 GPU 时自动匹配互联方式（主卡）──────────────────
watch(primaryGpu, (g) => {
  if (!g) return
  if (g.vendor === 'apple') {
    // Apple Silicon 只支持单卡，强制回单卡模式
    multiMode.value = false
    if (gpuSlots.value.length > 1) gpuSlots.value = [gpuSlots.value[0]]
    return
  }
  // 多卡模式下，其他 slot 若是跨 vendor 则自动替换为同 vendor 的第一张
  if (multiMode.value && gpuSlots.value.length > 1) {
    gpuSlots.value = gpuSlots.value.map((s, i) => {
      if (i === 0) return s
      if (s.gpu?.vendor !== g.vendor) {
        const fallback = GPU_LIST.find(gpu => gpu.vendor === g.vendor) ?? s.gpu
        return { ...s, gpu: fallback }
      }
      return s
    })
  }
  if (isMixed.value) return  // 混合卡不自动切换互联
  if (!g.nvlink_bw) return
  const matched = INTERCONNECT_MAP.find(ic => ic.bw === g.nvlink_bw)
  if (matched) interconnect.value = matched
})

// 混合卡时自动切换到 PCIe
watch(isMixed, (mixed) => {
  if (mixed) {
    const pcie = INTERCONNECT_MAP.find(ic => ic.id === 'pcie4')
    if (pcie) interconnect.value = pcie
  }
})
</script>

<template>
  <section class="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">{{ t('gpu.title') }}</h2>
      <!-- 单卡 / 多卡切换（Apple Silicon 不支持多卡，隐藏）-->
      <div v-if="!isApple" class="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
        <button
          @click="setMode(false)"
          class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
          :class="!multiMode
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'"
        >{{ t('gpu.mode_single') }}</button>
        <button
          @click="setMode(true)"
          class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
          :class="multiMode
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'"
        >{{ t('gpu.mode_multi') }}</button>
      </div>
    </div>

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

      <!-- Slot 列表 -->
      <div ref="containerRef" class="space-y-2">
        <div v-for="(slot, idx) in gpuSlots" :key="idx" class="relative">
          <div class="flex items-center gap-1.5">
            <!-- GPU 下拉触发 -->
            <button
              type="button"
              @click="openDropdown(idx)"
              class="flex-1 flex items-center justify-between bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 hover:border-gray-400 transition-colors min-w-0"
            >
              <span class="flex items-center gap-1.5 truncate">
                {{ slot.gpu?.name ?? t('gpu.select_placeholder') }}
                <span v-if="slot.gpu && isNew(slot.gpu.released)" class="inline-block w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
              </span>
              <svg class="w-4 h-4 text-gray-400 shrink-0 ml-2 transition-transform" :class="{ 'rotate-180': openSlot === idx }" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
              </svg>
            </button>

            <!-- 数量按钮（多卡模式下行内显示，单卡模式隐藏） -->
            <div v-if="multiMode" class="flex gap-0.5 shrink-0">
              <button
                v-for="n in SLOT_COUNT_OPTIONS"
                :key="n"
                @click="updateSlotCount(idx, n)"
                class="w-8 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                :class="slot.count === n
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'"
              >×{{ n }}</button>
            </div>

            <!-- 删除（保留至少一行）-->
            <button
              v-if="gpuSlots.length > 1"
              @click="removeSlot(idx)"
              class="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 下拉面板 -->
          <div
            v-if="openSlot === idx"
            class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            <!-- 搜索输入框 -->
            <div class="p-2 border-b border-gray-100">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('gpu.search_placeholder')"
                class="w-full bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                @click.stop
              />
            </div>

            <!-- 选项列表 -->
            <div class="max-h-72 overflow-y-auto">
              <template v-if="getFilteredGroups(idx).length">
                <div v-for="group in getFilteredGroups(idx)" :key="group.vendor">
                  <!-- vendor 分组标题：跨 vendor 时置灰并加锁图标 -->
                  <div
                    class="px-3 py-1 text-xs font-semibold bg-gray-50 sticky top-0 flex items-center justify-between"
                    :class="group.disabled ? 'text-gray-300' : 'text-gray-400'"
                  >
                    <span>{{ vendorLabel[group.vendor] ?? group.vendor }}</span>
                    <span v-if="group.disabled" class="text-[10px] font-normal text-gray-300">{{ t('gpu.cross_vendor_disabled') }}</span>
                  </div>
                  <button
                    v-for="g in group.gpus"
                    :key="g.id"
                    type="button"
                    :disabled="group.disabled"
                    @click="selectGpu(idx, g)"
                    class="w-full text-left px-3 py-2 transition-colors border-b border-gray-50 last:border-0"
                    :class="group.disabled
                      ? 'opacity-35 cursor-not-allowed bg-white'
                      : g.id === slot.gpu?.id
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'hover:bg-emerald-50'"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-1.5 mb-0.5">
                          <span class="text-sm font-medium truncate" :class="g.id === slot.gpu?.id && !group.disabled ? 'text-emerald-700' : 'text-gray-900'">
                            {{ g.name }}
                          </span>
                          <span v-if="isNew(g.released) && !group.disabled" class="inline-block w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                        </div>
                        <div class="flex items-center gap-3 text-[11px]" :class="g.id === slot.gpu?.id && !group.disabled ? 'text-emerald-600' : 'text-gray-500'">
                          <span>{{ g.sharedMemory ? '共享' : g.vram + 'GB' }}</span>
                          <span>{{ g.bw }}GB/s</span>
                          <span>{{ g.bf16 }}T</span>
                          <span>{{ g.tdp }}W</span>
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

      <!-- 单卡模式：数量选择（Apple Silicon 不显示）-->
      <div v-if="!multiMode && !isApple" class="mt-2">
        <label class="block text-xs text-gray-500 mb-1.5">{{ t('gpu.count') }}</label>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="n in SINGLE_COUNT_OPTIONS"
            :key="n"
            @click="setSingleCount(n)"
            class="w-10 py-1.5 rounded-lg text-sm font-medium border transition-colors"
            :class="singleCount === n && !isCustomCount
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'"
          >{{ n }}</button>
          <button
            v-if="isCustomCount"
            class="px-3 py-1.5 rounded-lg text-sm font-medium border bg-emerald-600 border-emerald-600 text-white shadow-sm"
          >{{ singleCount }}</button>
        </div>
        <div class="flex items-center gap-2 mt-1.5">
          <span class="text-xs text-gray-400">{{ t('gpu.count_custom') }}</span>
          <input
            v-model="customCountInput"
            type="number" min="1" max="512" step="1"
            :placeholder="isCustomCount ? String(singleCount) : '32'"
            @keydown.enter="applyCustomCount"
            @blur="applyCustomCount"
            class="w-20 py-1 px-2 rounded-lg text-sm border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center"
          />
        </div>
      </div>

      <!-- 添加另一种 GPU -->
      <button
        v-if="multiMode && gpuSlots.length < 4"
        @click="addSlot"
        class="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-emerald-700 border border-dashed border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors"
      >
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ t('gpu.add_slot') }}
      </button>

      <!-- 多卡模式提示 -->
      <div v-if="multiMode" class="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
        <svg class="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
        </svg>
        <p class="text-xs text-amber-700 leading-relaxed">{{ t('gpu.multi_gpu_notice') }}</p>
      </div>
    </div>

    <!-- GPU 规格展示（主卡）-->
    <div v-if="primaryGpu" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div class="bg-gray-50 rounded-lg p-2 text-center">
        <div class="text-xs text-gray-500">{{ t('gpu.vram_label') }}</div>
        <div class="text-sm font-semibold text-emerald-700">{{ isSharedMemory ? sharedVram : primaryGpu.vram }} GB</div>
      </div>
      <div class="bg-gray-50 rounded-lg p-2 text-center">
        <div class="text-xs text-gray-500">{{ t('gpu.bw_label') }}</div>
        <div class="text-sm font-semibold text-emerald-700 whitespace-nowrap">{{ primaryGpu.bw }} <span class="text-xs">GB/s</span></div>
      </div>
      <div class="bg-gray-50 rounded-lg p-2 text-center">
        <div class="text-xs text-gray-500">{{ t('gpu.bf16_label') }}</div>
        <div class="text-sm font-semibold text-emerald-700">{{ primaryGpu.bf16 }} <span class="text-xs">T</span></div>
      </div>
      <div class="bg-gray-50 rounded-lg p-2 text-center">
        <div class="text-xs text-gray-500">{{ t('gpu.tdp_label') }}</div>
        <div class="text-sm font-semibold text-gray-700">{{ primaryGpu.tdp }} <span class="text-xs">W</span></div>
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

    <!-- 互联方式（多卡时显示，Apple Silicon 不支持）-->
    <div v-if="totalCount > 1 && primaryGpu?.vendor !== 'apple'">
      <label class="block text-xs text-gray-500 mb-1">{{ t('gpu.interconnect') }}</label>
      <select
        :value="interconnect.id"
        @change="interconnect = INTERCONNECT_MAP.find(i => i.id === $event.target.value)"
        :disabled="isMixed"
        class="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <option v-for="ic in INTERCONNECT_MAP" :key="ic.id" :value="ic.id">
          {{ ic.label }} ({{ ic.bw }} GB/s)
        </option>
      </select>
      <p v-if="isMixed" class="mt-1 text-xs text-amber-600">
        {{ t('gpu.mixed_interconnect_hint') }}
      </p>
    </div>
  </section>
</template>
