<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const { t } = useI18n()
const props = defineProps({ result: Object })

const chartData = computed(() => {
  if (!props.result) return { labels: [], datasets: [] }
  const { weightGB, kvGB, overheadGB } = props.result
  return {
    labels: [t('result.weight'), t('result.kv'), t('result.overhead')],
    datasets: [{
      data: [weightGB, kvGB, overheadGB].map(v => +v.toFixed(2)),
      backgroundColor: ['#10b981', '#f59e0b', '#64748b'],
      borderColor: ['#059669', '#d97706', '#475569'],
      borderWidth: 1,
    }],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: { color: '#374151', boxWidth: 12, padding: 10, font: { size: 11 } },
    },
    tooltip: {
      callbacks: {
        label: ctx => ` ${ctx.label}: ${ctx.parsed.toFixed(1)} GB`,
      },
    },
  },
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4 min-w-0">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ t('result.vram_pie_title') }}</h3>
    <div class="h-44 min-w-0">
      <Doughnut v-if="result" :data="chartData" :options="chartOptions" />
      <div v-else class="h-full flex items-center justify-center text-gray-400 text-sm">选择模型和显卡后显示</div>
    </div>
  </div>
</template>
