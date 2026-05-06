<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { fmtParams } from '../../utils/format.js'

const props = defineProps({
  models: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['modelHover', 'modelClick'])

const { t } = useI18n()
const canvasRef = ref(null)
const containerRef = ref(null)
const hoveredModel = ref(null)
const tooltipPosition = ref({ x: 0, y: 0 })

// 图表配置
const padding = { top: 60, right: 80, bottom: 60, left: 80 }
let canvasWidth = 0
let canvasHeight = 0
let ctx = null
let dpr = 1

// 解析日期
function parseDate(dateStr) {
  if (!dateStr) return new Date('2020-01')
  const [year, month] = dateStr.split('-').map(Number)
  return new Date(year, (month || 1) - 1)
}

// 准备数据
const chartData = computed(() => {
  const data = props.models
    .filter(m => m.released && m.params)
    .map(m => ({
      ...m,
      date: parseDate(m.released),
      params: m.type === 'moe' ? (m.active_params || m.params) : m.params,
      totalParams: m.params
    }))
    .sort((a, b) => a.date - b.date)

  if (data.length === 0) return { models: [], xScale: null, yScale: null }

  // 计算时间范围
  const dates = data.map(d => d.date.getTime())
  const minDate = Math.min(...dates)
  const maxDate = Math.max(...dates)
  const dateRange = maxDate - minDate || 1

  // 计算参数范围（对数刻度）
  const params = data.map(d => d.params)
  const minParams = Math.min(...params)
  const maxParams = Math.max(...params)
  const logMinParams = Math.log10(Math.max(0.1, minParams))
  const logMaxParams = Math.log10(maxParams)

  return {
    models: data,
    minDate,
    maxDate,
    dateRange,
    logMinParams,
    logMaxParams,
    logRange: logMaxParams - logMinParams || 1
  }
})

// 坐标转换
function getX(date) {
  const { minDate, dateRange } = chartData.value
  const t = (date.getTime() - minDate) / dateRange
  return padding.left + t * (canvasWidth - padding.left - padding.right)
}

function getY(params) {
  const { logMinParams, logRange } = chartData.value
  const logParams = Math.log10(Math.max(0.1, params))
  const t = (logParams - logMinParams) / logRange
  return canvasHeight - padding.bottom - t * (canvasHeight - padding.top - padding.bottom)
}

// 气泡大小（基于总参数量）
function getBubbleRadius(model) {
  const baseSize = 4
  const maxSize = 20
  const logParams = Math.log10(Math.max(1, model.totalParams))
  const size = baseSize + (logParams / 3) * (maxSize - baseSize)
  return Math.min(maxSize, Math.max(baseSize, size))
}

// 绘制图表
function drawChart() {
  if (!ctx || !chartData.value.models.length) return

  const { models, minDate, maxDate, logMinParams, logMaxParams } = chartData.value

  // 清空画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // 绘制网格和坐标轴
  drawGrid()
  drawAxes()

  // 绘制连接线（按时间顺序）
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)'
  ctx.lineWidth = 1.5 * dpr
  ctx.beginPath()
  models.forEach((model, i) => {
    const x = getX(model.date)
    const y = getY(model.params)
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()

  // 绘制气泡
  models.forEach(model => {
    const x = getX(model.date)
    const y = getY(model.params)
    const r = getBubbleRadius(model) * dpr

    // 气泡颜色
    let color
    if (model.type === 'moe') {
      color = 'rgba(245, 158, 11, 0.7)' // amber
    } else if (model.tags?.includes('code')) {
      color = 'rgba(59, 130, 246, 0.7)' // blue
    } else if (model.tags?.includes('reasoning')) {
      color = 'rgba(168, 85, 247, 0.7)' // purple
    } else {
      color = 'rgba(16, 185, 129, 0.7)' // emerald
    }

    // 绘制气泡
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()

    // 边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = 1.5 * dpr
    ctx.stroke()
  })

  // 绘制悬停高亮
  if (hoveredModel.value) {
    const model = hoveredModel.value
    const x = getX(model.date)
    const y = getY(model.params)
    const r = getBubbleRadius(model) * dpr

    // 高亮圆环
    ctx.strokeStyle = 'rgba(16, 185, 129, 1)'
    ctx.lineWidth = 3 * dpr
    ctx.beginPath()
    ctx.arc(x, y, r + 4 * dpr, 0, Math.PI * 2)
    ctx.stroke()

    // 标签
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.font = `${12 * dpr}px sans-serif`
    const text = model.name
    const textWidth = ctx.measureText(text).width
    const labelX = x - textWidth / 2
    const labelY = y - r - 10 * dpr

    ctx.fillRect(labelX - 4 * dpr, labelY - 14 * dpr, textWidth + 8 * dpr, 18 * dpr)
    ctx.fillStyle = 'white'
    ctx.fillText(text, labelX, labelY)
  }
}

function drawGrid() {
  const { minDate, maxDate, logMinParams, logMaxParams } = chartData.value

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)'
  ctx.lineWidth = 1 * dpr

  // 垂直网格线（时间）
  const yearStart = new Date(minDate).getFullYear()
  const yearEnd = new Date(maxDate).getFullYear()
  for (let year = yearStart; year <= yearEnd; year++) {
    for (let month = 1; month <= 12; month += 3) {
      const date = new Date(year, month - 1)
      if (date >= minDate && date <= maxDate) {
        const x = getX(date)
        ctx.beginPath()
        ctx.moveTo(x, padding.top)
        ctx.lineTo(x, canvasHeight - padding.bottom)
        ctx.stroke()
      }
    }
  }

  // 水平网格线（参数量，对数刻度）
  const logMin = Math.floor(logMinParams)
  const logMax = Math.ceil(logMaxParams)
  for (let log = logMin; log <= logMax; log++) {
    const params = Math.pow(10, log)
    const y = getY(params)
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(canvasWidth - padding.right, y)
    ctx.stroke()
  }
}

function drawAxes() {
  const { minDate, maxDate, logMinParams, logMaxParams } = chartData.value

  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.lineWidth = 2 * dpr

  // X轴
  ctx.beginPath()
  ctx.moveTo(padding.left, canvasHeight - padding.bottom)
  ctx.lineTo(canvasWidth - padding.right, canvasHeight - padding.bottom)
  ctx.stroke()

  // Y轴
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top)
  ctx.lineTo(padding.left, canvasHeight - padding.bottom)
  ctx.stroke()

  // X轴标签（年份）
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.font = `${11 * dpr}px sans-serif`
  ctx.textAlign = 'center'
  const yearStart = new Date(minDate).getFullYear()
  const yearEnd = new Date(maxDate).getFullYear()
  for (let year = yearStart; year <= yearEnd; year++) {
    const date = new Date(year, 0)
    const x = getX(date)
    ctx.fillText(year.toString(), x, canvasHeight - padding.bottom + 20 * dpr)
  }

  // Y轴标签（参数量）
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  const logMin = Math.floor(logMinParams)
  const logMax = Math.ceil(logMaxParams)
  for (let log = logMin; log <= logMax; log++) {
    const params = Math.pow(10, log)
    const y = getY(params)
    ctx.fillText(fmtParams(params), padding.left - 10 * dpr, y)
  }

  // 轴标题
  ctx.font = `bold ${13 * dpr}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
  ctx.fillText(t('library.timeline_x_axis'), canvasWidth / 2, canvasHeight - 25 * dpr)

  ctx.save()
  ctx.translate(25 * dpr, canvasHeight / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.fillText(t('library.timeline_y_axis'), 0, 0)
  ctx.restore()
}

// 查找鼠标位置的模型
function findModelAtPosition(x, y) {
  const { models } = chartData.value
  for (let i = models.length - 1; i >= 0; i--) {
    const model = models[i]
    const mx = getX(model.date)
    const my = getY(model.params)
    const r = getBubbleRadius(model)
    const dist = Math.sqrt((x - mx) ** 2 + (y - my) ** 2)
    if (dist <= r) {
      return model
    }
  }
  return null
}

// 鼠标事件
function handleMouseMove(e) {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) * dpr
  const y = (e.clientY - rect.top) * dpr

  const model = findModelAtPosition(x, y)
  if (model !== hoveredModel.value) {
    hoveredModel.value = model
    drawChart()
    
    if (model) {
      tooltipPosition.value = {
        x: e.clientX,
        y: e.clientY
      }
      emit('modelHover', model, e)
    } else {
      emit('modelHover', null, null)
    }
  }
}

function handleMouseLeave() {
  hoveredModel.value = null
  drawChart()
  emit('modelHover', null, null)
}

function handleClick(e) {
  if (hoveredModel.value) {
    emit('modelClick', hoveredModel.value)
  }
}

// 初始化和调整大小
function initCanvas() {
  if (!canvasRef.value || !containerRef.value) return

  dpr = window.devicePixelRatio || 1
  const rect = containerRef.value.getBoundingClientRect()
  canvasWidth = rect.width * dpr
  canvasHeight = rect.height * dpr

  canvasRef.value.width = canvasWidth
  canvasRef.value.height = canvasHeight
  canvasRef.value.style.width = rect.width + 'px'
  canvasRef.value.style.height = rect.height + 'px'

  ctx = canvasRef.value.getContext('2d')
  drawChart()
}

let resizeObserver = null

onMounted(() => {
  initCanvas()
  
  resizeObserver = new ResizeObserver(() => {
    initCanvas()
  })
  
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch(() => props.models, () => {
  drawChart()
}, { deep: true })
</script>

<template>
  <div ref="containerRef" class="relative w-full h-full min-h-[600px]">
    <canvas
      ref="canvasRef"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
      class="cursor-pointer"
    />
    
    <!-- 图例 -->
    <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm p-3 text-xs">
      <div class="font-semibold text-gray-700 mb-2">{{ t('library.timeline_legend') }}</div>
      <div class="space-y-1.5">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span class="text-gray-600">{{ t('library.tag_chat') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <span class="text-gray-600">{{ t('library.tag_code') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-purple-500"></div>
          <span class="text-gray-600">{{ t('library.tag_reasoning') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-amber-500"></div>
          <span class="text-gray-600">MoE</span>
        </div>
      </div>
      <div class="mt-3 pt-2 border-t border-gray-200 text-gray-500">
        <div>{{ t('library.timeline_bubble_size') }}</div>
      </div>
    </div>
  </div>
</template>
