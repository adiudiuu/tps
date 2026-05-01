<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  PointElement,
  LineElement,
  LineController,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale, LinearScale, LogarithmicScale,
  PointElement, LineElement, LineController,
  Tooltip, Legend, Filler,
)

const { t } = useI18n()

const props = defineProps({
  // Array from calcBatchSweep: { batch, effectiveToks, singleToks, tpot, vramOk, bottleneck }
  sweepData: { type: Array, default: () => [] },
  currentBatch: { type: Number, default: 1 },
  compact: { type: Boolean, default: false },
})

const validPoints = computed(() => (props.sweepData ?? []).filter(d => !d.error))

const labels = computed(() => validPoints.value.map(d => d.batch))

// OOM 背景区域插件：在第一个 OOM 点之后绘制红色半透明背景
const oomBackgroundPlugin = {
  id: 'oomBackground',
  beforeDraw(chart) {
    const { ctx, chartArea, scales } = chart
    if (!chartArea) return
    const xScale = scales.x
    if (!xScale) return
    const points = validPoints.value
    const firstOomIdx = points.findIndex(d => !d.vramOk)
    if (firstOomIdx < 0) return
    // 找到第一个 OOM 点的 x 像素位置
    const xStart = xScale.getPixelForValue(firstOomIdx)
    const { top, bottom } = chartArea
    ctx.save()
    ctx.fillStyle = 'rgba(239,68,68,0.08)'
    ctx.fillRect(xStart, top, chartArea.right - xStart, bottom - top)
    // 边界线
    ctx.strokeStyle = 'rgba(239,68,68,0.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 3])
    ctx.beginPath()
    ctx.moveTo(xStart, top)
    ctx.lineTo(xStart, bottom)
    ctx.stroke()
    ctx.restore()
  },
}

const chartData = computed(() => {
  if (!validPoints.value.length) return { labels: [], datasets: [] }

  const throughput = validPoints.value.map(d => d.vramOk ? +(d.effectiveToks?.toFixed(1) ?? 0) : null)
  const latency    = validPoints.value.map(d => d.vramOk ? +(d.tpot?.toFixed(2) ?? 0) : null)

  return {
    labels: labels.value,
    datasets: [
      {
        label: t('result.sweep_throughput'),
        data: throughput,
        yAxisID: 'yLeft',
        borderColor: '#059669',
        backgroundColor: 'rgba(5,150,105,0.10)',
        borderWidth: 2,
        pointRadius: validPoints.value.map(d => d.batch === props.currentBatch ? 7 : 3),
        pointBackgroundColor: validPoints.value.map(d =>
          d.batch === props.currentBatch ? '#059669' : 'rgba(5,150,105,0.6)'
        ),
        tension: 0.3,
        fill: false,
        spanGaps: false,
      },
      {
        label: t('result.sweep_latency'),
        data: latency,
        yAxisID: 'yRight',
        borderColor: '#f97316',
        backgroundColor: 'rgba(249,115,22,0)',
        borderWidth: 2,
        pointRadius: validPoints.value.map(d => d.batch === props.currentBatch ? 7 : 3),
        pointBackgroundColor: validPoints.value.map(d =>
          d.batch === props.currentBatch ? '#f97316' : 'rgba(249,115,22,0.6)'
        ),
        tension: 0.3,
        fill: false,
        spanGaps: false,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    oomBackground: {},
    legend: {
      labels: { color: '#374151', boxWidth: 12, font: { size: 11 } },
    },
    tooltip: {
      callbacks: {
        title: ctx => `Batch = ${ctx[0].label}`,
        label: ctx => {
          if (ctx.datasetIndex === 0) return ` ${t('result.sweep_throughput')}: ${ctx.raw?.toFixed(0) ?? '—'} tok/s`
          return ` ${t('result.sweep_latency')}: ${ctx.raw?.toFixed(1) ?? '—'} ms/tok`
        },
        afterBody: (ctx) => {
          const idx = ctx[0].dataIndex
          const d = validPoints.value[idx]
          if (!d) return []
          const lines = []
          if (!d.vramOk) lines.push(`⛔ ${t('result.sweep_oom')}`)
          else lines.push(`  ${t('result.sweep_single')}: ${d.singleToks?.toFixed(1)} tok/s/req`)
          lines.push(`  ${t('result.bottleneck')}: ${d.bottleneck === 'bandwidth' ? t('result.bandwidth') : t('result.compute')}`)
          if (d.ppBubbleEff != null && d.ppBubbleEff < 0.99) {
            lines.push(`  PP bubble eff: ${(d.ppBubbleEff * 100).toFixed(0)}%`)
          }
          return lines
        },
      },
    },
  },
  scales: {
    x: {
      title: { display: true, text: 'Batch Size', color: '#6b7280', font: { size: 11 } },
      ticks: { color: '#6b7280', font: { size: 11 } },
      grid: { color: '#f3f4f6' },
    },
    yLeft: {
      type: 'linear',
      position: 'left',
      title: { display: true, text: t('result.sweep_throughput_axis'), color: '#059669', font: { size: 11 } },
      ticks: { color: '#059669', font: { size: 11 } },
      grid: { color: '#f3f4f6' },
      beginAtZero: true,
    },
    yRight: {
      type: 'linear',
      position: 'right',
      title: { display: true, text: t('result.sweep_latency_axis'), color: '#f97316', font: { size: 11 } },
      ticks: { color: '#f97316', font: { size: 11 } },
      grid: { drawOnChartArea: false },
      beginAtZero: true,
    },
  },
}))

const oomBatch = computed(() => {
  const first = validPoints.value.find(d => !d.vramOk)
  return first?.batch ?? null
})

function fmtToks(v) {
  if (v == null) return '—'
  if (v >= 1000) return (v / 1000).toFixed(1) + 'k'
  return v.toFixed(0)
}
function fmtMs(v) { return v == null ? '—' : v.toFixed(1) }
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-gray-700">{{ t('result.sweep_title') }}</h3>
      <div class="flex items-center gap-3 text-[10px] text-gray-500">
        <span class="flex items-center gap-1">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          {{ t('result.sweep_current_batch', { n: currentBatch }) }}
        </span>
        <span v-if="oomBatch" class="flex items-center gap-1 text-red-500">
          <span class="inline-block w-2.5 h-2.5 rounded-full bg-red-500"></span>
          {{ t('result.sweep_oom_from', { n: oomBatch }) }}
        </span>
      </div>
    </div>

    <!-- 折线图 -->
    <div class="h-52 min-w-0">
      <Line v-if="sweepData?.length" :data="chartData" :options="chartOptions" :plugins="[oomBackgroundPlugin]" />
      <div v-else class="h-full flex items-center justify-center text-gray-400 text-sm">
        {{ t('result.sweep_empty') }}
      </div>
    </div>

    <!-- 数据表格 -->
    <div v-if="validPoints.length" class="mt-4 overflow-x-auto">
      <table class="w-full text-xs border-collapse">
        <thead>
          <tr class="bg-gray-50 text-gray-500">
            <th class="px-1.5 py-1.5 text-left font-medium border-b border-gray-200 whitespace-nowrap">Batch</th>
            <th class="px-1.5 py-1.5 text-right font-medium border-b border-gray-200 whitespace-nowrap">
              {{ compact ? 'Tput' : t('result.sweep_throughput') + ' (tok/s)' }}
            </th>
            <th class="px-1.5 py-1.5 text-right font-medium border-b border-gray-200 whitespace-nowrap">
              {{ compact ? 'Single' : t('result.sweep_single') + ' (tok/s/req)' }}
            </th>
            <th class="px-1.5 py-1.5 text-right font-medium border-b border-gray-200 whitespace-nowrap">TPOT</th>
            <th v-if="!compact" class="hidden sm:table-cell px-2 py-1.5 text-right font-medium border-b border-gray-200 whitespace-nowrap">
              {{ t('result.sweep_latency_total') }} (s)
            </th>
            <th v-if="!compact" class="hidden sm:table-cell px-2 py-1.5 text-center font-medium border-b border-gray-200 whitespace-nowrap">
              {{ t('result.bottleneck') }}
            </th>
            <th class="px-1.5 py-1.5 text-center font-medium border-b border-gray-200 whitespace-nowrap">VRAM</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="d in validPoints"
            :key="d.batch"
            :class="[
              'border-b border-gray-100 transition-colors',
              !d.vramOk ? 'bg-red-50 text-red-400' : d.batch === currentBatch ? 'bg-emerald-50' : 'hover:bg-gray-50'
            ]"
          >
            <td class="px-1.5 py-1.5 font-mono font-semibold" :class="d.batch === currentBatch ? 'text-emerald-700' : ''">
              {{ d.batch }}<span v-if="d.batch === currentBatch" class="ml-1 text-[9px] text-emerald-600 font-normal">▶</span>
            </td>
            <td class="px-1.5 py-1.5 text-right font-mono">
              <span v-if="d.vramOk" class="text-emerald-700 font-medium">{{ fmtToks(d.effectiveToks) }}</span>
              <span v-else class="text-red-400 line-through">OOM</span>
            </td>
            <td class="px-1.5 py-1.5 text-right font-mono text-gray-600">
              <span v-if="d.vramOk">{{ fmtToks(d.singleToks) }}</span>
              <span v-else>—</span>
            </td>
            <td class="px-1.5 py-1.5 text-right font-mono text-orange-600">
              <span v-if="d.vramOk">{{ fmtMs(d.tpot) }}</span>
              <span v-else>—</span>
            </td>
            <td v-if="!compact" class="hidden sm:table-cell px-2 py-1.5 text-right font-mono text-gray-600">
              <span v-if="d.vramOk">{{ d.totalLatency != null ? (d.totalLatency / 1000).toFixed(1) : '—' }}</span>
              <span v-else>—</span>
            </td>
            <td v-if="!compact" class="hidden sm:table-cell px-2 py-1.5 text-center">
              <span v-if="d.vramOk" :class="d.bottleneck === 'bandwidth' ? 'text-blue-500' : 'text-purple-500'">
                {{ d.bottleneck === 'bandwidth' ? t('result.bandwidth') : t('result.compute') }}
              </span>
              <span v-else>—</span>
            </td>
            <td class="px-1.5 py-1.5 text-center">
              <span v-if="d.vramOk" class="text-emerald-600">✓</span>
              <span v-else class="text-red-500 font-medium">OOM</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
