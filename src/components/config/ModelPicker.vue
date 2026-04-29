<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ALL_MODELS } from '../../data/models/index.js'
import { fmtParams, fmtCtx } from '../../utils/format.js'
import { isNew } from '../../utils/format.js'
import { getAttentionSummary } from '../../utils/model.js'

const { t } = useI18n()

const model = defineModel('model', { required: true })

const searchQuery = ref('')
const activeTab = ref('all')
const detailModel = ref(null)
const listRef = ref(null)

// 自定义模型状态
const customModel = ref({
  id: 'custom',
  name: t('model.custom_name'),
  type: 'dense',
  params: 7,
  active_params: 7,
  mla_ratio: null,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 32768,
  links: { ollama: null, hf: null, ms: null },
})
const customIsMoe = ref(false)

const filteredModels = computed(() => {
  let list = ALL_MODELS
  if (activeTab.value === 'dense') list = list.filter(m => m.type === 'dense')
  else if (activeTab.value === 'moe') list = list.filter(m => m.type === 'moe')
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(m => m.name.toLowerCase().includes(q))
  }
  return list
})

function scrollToSelected(id) {
  nextTick(() => {
    const el = listRef.value?.querySelector(`[data-model-id="${id}"]`)
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })
}

function selectModel(m) {
  model.value = m
  scrollToSelected(m.id)
}

function applyCustom() {
  const m = { ...customModel.value }
  m.type = customIsMoe.value ? 'moe' : 'dense'
  if (!customIsMoe.value) {
    m.active_params = m.params
    m.mla_ratio = null
  }
  model.value = { ...m }
}

function copyOllama(cmd) {
  navigator.clipboard.writeText(cmd)
}

function openDetails(m) {
  detailModel.value = m
}

function closeDetails() {
  detailModel.value = null
}

function fmtRelease(val) {
  if (!val) return '—'
  const [year, month] = String(val).split('-')
  return month ? `${year}-${month}` : String(val)
}

const TABS = ['all', 'dense', 'moe', 'custom']

onMounted(() => {
  if (model.value) scrollToSelected(model.value.id)
})
</script>

<template>
  <section class="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
    <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">{{ t('model.title') }}</h2>

    <!-- 搜索框 -->
    <div>
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="t('model.search')"
        class="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
    </div>

    <!-- Tab -->
    <div class="flex gap-1">
      <button
        v-for="tab in TABS"
        :key="tab"
        @click="activeTab = tab"
        :class="[
          'flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors',
          activeTab === tab
            ? 'bg-emerald-600 border-emerald-600 text-white'
            : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
        ]"
      >
        {{ t('model.tab.' + tab) }}
      </button>
    </div>

    <!-- 自定义表单 -->
    <template v-if="activeTab === 'custom'">
      <div class="space-y-2">
        <div class="flex items-center gap-2 mb-2">
          <input id="is-moe" v-model="customIsMoe" type="checkbox" class="rounded border-gray-300 bg-white text-emerald-600" />
          <label for="is-moe" class="text-xs text-gray-600">{{ t('model.custom.is_moe') }}</label>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div v-for="field in ['params', 'layers', 'kv_heads', 'head_dim', 'hidden_size', 'max_ctx']" :key="field">
            <label class="block text-xs text-gray-500 mb-0.5">{{ t('model.custom.' + field) }}</label>
            <input
              v-model.number="customModel[field]"
              type="number"
              class="w-full bg-gray-50 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <template v-if="customIsMoe">
            <div>
              <label class="block text-xs text-gray-500 mb-0.5">{{ t('model.custom.active_params') }}</label>
              <input v-model.number="customModel.active_params" type="number" class="w-full bg-gray-50 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label class="block text-xs text-gray-500 mb-0.5">{{ t('model.custom.mla_ratio') }}</label>
              <input v-model.number="customModel.mla_ratio" type="number" step="0.01" placeholder="0.18 or empty" class="w-full bg-gray-50 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
          </template>
        </div>
        <button @click="applyCustom" class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">
          {{ t('model.apply_custom') }}
        </button>
      </div>
    </template>

    <!-- 模型列表 -->
    <template v-else>
      <div ref="listRef" class="space-y-1 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
        <div v-if="filteredModels.length === 0" class="text-center text-xs text-gray-400 py-4">{{ t('model.no_result') }}</div>
        <div
          v-for="m in filteredModels"
          :key="m.id"
          :data-model-id="m.id"
          @click="selectModel(m)"
          :class="[
            'relative rounded-lg p-3 cursor-pointer border transition-colors',
            model?.id === m.id
              ? 'bg-emerald-100 border-emerald-500 shadow-sm ring-1 ring-emerald-200'
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
          ]"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 mb-1">
                <span v-if="m.type === 'moe'" class="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium shrink-0">MoE</span>
                <span v-else class="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium shrink-0">Dense</span>
                <button
                  @click.stop="openDetails(m)"
                  class="text-sm font-medium text-gray-900 hover:text-emerald-700 transition-colors truncate"
                  :title="t('model.detail.open')"
                >
                  {{ m.name }}
                </button>
                <span v-if="isNew(m.released)" class="inline-block w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
              </div>
              
              <!-- 关键参数 -->
              <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-gray-600 mb-1.5">
                <div class="flex items-center gap-1">
                  <span class="text-gray-400">参数:</span>
                  <span class="font-medium">{{ fmtParams(m.params) }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-gray-400">上下文:</span>
                  <span class="font-medium">{{ fmtCtx(m.max_ctx) }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-gray-400">注意力:</span>
                  <span class="font-medium">{{ getAttentionSummary(m) }}</span>
                </div>
                <div v-if="m.type === 'moe'" class="flex items-center gap-1">
                  <span class="text-gray-400">激活:</span>
                  <span class="font-medium">{{ fmtParams(m.active_params) }}</span>
                </div>
                <div v-else class="flex items-center gap-1">
                  <span class="text-gray-400">层数:</span>
                  <span class="font-medium">{{ m.layers }}</span>
                </div>
              </div>

              <!-- 下载链接 -->
              <div class="flex gap-1.5" @click.stop>
                <button
                  v-if="m.links?.ollama"
                  @click="copyOllama(m.links.ollama)"
                  class="text-[10px] px-1.5 py-0.5 rounded bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors border border-gray-200"
                  title="点击复制命令"
                >Ollama</button>
                <a
                  v-if="m.links?.hf"
                  :href="m.links.hf"
                  target="_blank"
                  rel="noopener"
                  class="text-[10px] px-1.5 py-0.5 rounded bg-white hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-colors border border-gray-200"
                >HF</a>
                <a
                  v-if="m.links?.ms"
                  :href="m.links.ms"
                  target="_blank"
                  rel="noopener"
                  class="text-[10px] px-1.5 py-0.5 rounded bg-white hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 transition-colors border border-gray-200"
                >MS</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div
      v-if="detailModel"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
      @click="closeDetails"
    >
      <div
        class="w-full max-w-2xl rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-2xl"
        @click.stop
      >
        <div class="flex items-start justify-between gap-4 px-5 py-4 border-b border-emerald-100">
          <div>
            <div class="text-lg font-semibold text-gray-900">{{ detailModel.name }}</div>
            <div class="mt-1 text-sm text-gray-500">{{ t('model.detail.release') }}: {{ fmtRelease(detailModel.released) }}</div>
          </div>
          <div class="flex items-center gap-2">
            <span
              :class="detailModel.type === 'moe' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'"
              class="px-2.5 py-1 rounded-full text-xs font-medium"
            >
              {{ detailModel.type === 'moe' ? 'MoE' : 'Dense' }}
            </span>
            <button
              @click="closeDetails"
              class="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              :aria-label="t('model.detail.close')"
            >
              <svg viewBox="0 0 20 20" class="w-4 h-4" fill="none" aria-hidden="true">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-5">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div class="rounded-xl bg-white/85 px-3 py-2 ring-1 ring-emerald-100">
              <div class="text-gray-500">{{ t('model.detail.params') }}</div>
              <div class="mt-1 font-semibold text-gray-900">{{ fmtParams(detailModel.params) }}</div>
            </div>
            <div class="rounded-xl bg-white/85 px-3 py-2 ring-1 ring-emerald-100">
              <div class="text-gray-500">{{ t('model.detail.active_params') }}</div>
              <div class="mt-1 font-semibold text-gray-900">{{ detailModel.type === 'moe' ? fmtParams(detailModel.active_params) : '—' }}</div>
            </div>
            <div class="rounded-xl bg-white/85 px-3 py-2 ring-1 ring-emerald-100">
              <div class="text-gray-500">{{ t('model.detail.ctx') }}</div>
              <div class="mt-1 font-semibold text-gray-900">{{ fmtCtx(detailModel.max_ctx) }}</div>
            </div>
            <div class="rounded-xl bg-white/85 px-3 py-2 ring-1 ring-emerald-100">
              <div class="text-gray-500">{{ t('model.detail.attention') }}</div>
              <div class="mt-1 font-semibold text-gray-900">{{ getAttentionSummary(detailModel) }}</div>
            </div>
            <div class="rounded-xl bg-white/85 px-3 py-2 ring-1 ring-emerald-100">
              <div class="text-gray-500">{{ t('model.detail.layers') }}</div>
              <div class="mt-1 font-semibold text-gray-900">{{ detailModel.layers }}</div>
            </div>
            <div class="rounded-xl bg-white/85 px-3 py-2 ring-1 ring-emerald-100">
              <div class="text-gray-500">{{ t('model.detail.hidden') }}</div>
              <div class="mt-1 font-semibold text-gray-900">{{ detailModel.hidden_size }}</div>
            </div>
            <div class="rounded-xl bg-white/85 px-3 py-2 ring-1 ring-emerald-100">
              <div class="text-gray-500">{{ t('model.detail.head_dim') }}</div>
              <div class="mt-1 font-semibold text-gray-900">{{ detailModel.head_dim }}</div>
            </div>
            <div class="rounded-xl bg-white/85 px-3 py-2 ring-1 ring-emerald-100">
              <div class="text-gray-500">{{ t('model.detail.kv_heads') }}</div>
              <div class="mt-1 font-semibold text-gray-900">{{ detailModel.kv_heads }}</div>
            </div>
            <div class="rounded-xl bg-white/85 px-3 py-2 ring-1 ring-emerald-100">
              <div class="text-gray-500">MLA KV Ratio</div>
              <div class="mt-1 font-semibold text-gray-900">{{ detailModel.mla_ratio ?? '—' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
