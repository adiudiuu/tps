<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Scatter } from 'vue-chartjs'
import { roofDecodeToks } from '../../utils/calibrate.js'
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(LinearScale, PointElement, LineElement, LineController, Tooltip, Legend, Filler)

const { t } = useI18n()
const props = defineProps({ result: Object })

const chartData = computed(() => {
  if (!props.result) return { datasets: [] }

  const { bwLimit, computeLimit, roofline } = props.result

  // Roofline 折线：带宽段 + 平坦段
  const rooflinePoints = []
  const ridgePoint = computeLimit / bwLimit  // arithmetic intensity ridge
  for (let x = 0; x <= ridgePoint * 2; x += ridgePoint / 20) {
    rooflinePoints.push({ x, y: Math.min(bwLimit * x, computeLimit) })
  }

  // 点用校准前 tok/s，且不超过该强度下的屋顶，避免画出物理上限
  const roofAtOp = Math.min(bwLimit * roofline, computeLimit)
  const pointY = Math.min(roofDecodeToks(props.result), roofAtOp)

  return {
    datasets: [
      {
        label: t('result.roofline_curve'),
        data: rooflinePoints,
        type: 'line',
        borderColor: '#059669',
        backgroundColor: 'rgba(5,150,105,0.10)',
        borderWidth: 2.5,
        pointRadius: 0,
        fill: false,
        tension: 0,
      },
      {
        label: props.result.bottleneck === 'bandwidth' ? t('result.bandwidth') : t('result.compute'),
        data: [{ x: roofline, y: pointY }],
        backgroundColor: props.result.bottleneck === 'bandwidth' ? '#f97316' : '#16a34a',
        pointRadius: 8,
        pointHoverRadius: 10,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: 'linear',
      title: { display: true, text: t('result.roofline_x_axis'), color: '#4b5563' },
      ticks: { color: '#6b7280' },
      grid: { color: '#e5e7eb' },
    },
    y: {
      title: { display: true, text: t('result.roofline_y_axis'), color: '#4b5563' },
      ticks: { color: '#6b7280' },
      grid: { color: '#e5e7eb' },
      suggestedMax: props.result
        ? Math.max(props.result.bwLimit, props.result.computeLimit) * 1.15
        : undefined,
    },
  },
  plugins: {
    legend: { labels: { color: '#374151', boxWidth: 10 } },
    tooltip: {
      callbacks: {
        label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(1)} tok/s`,
      },
    },
  },
}))
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4 min-w-0">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ t('result.roofline_title') }}</h3>
    <div class="h-52 min-w-0">
      <Scatter v-if="result" :data="chartData" :options="chartOptions" />
      <div v-else class="h-full flex items-center justify-center text-gray-400 text-sm">{{ t('result.chart_empty') }}</div>
    </div>
  </div>
</template>
