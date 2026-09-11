// src/utils/shareImage.js
// Canvas 分享图（成绩单）：1200×630，纯浏览器原生 API，无外链字体/图片依赖。
// 复用 SpeedCard 的 S/A/B/C/F 分级阈值与配色、exportMd 的数据口径。
import { buildShareStats } from './shareText.js'
import { SITE_HOST } from '../data/site.js'

const WIDTH = 1200
const HEIGHT = 630
const CARD_SITE = SITE_HOST

// 系统字体栈：避免加载外链字体导致画布 taint，同时覆盖 CJK
const FONT_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", "Hiragino Sans", "Noto Sans CJK SC", sans-serif'

/**
 * 速度评级：阈值与配色与 SpeedCard.vue 保持一致
 */
function speedRating(toks) {
  if (toks == null || !isFinite(toks)) return { grade: '—', c1: '#94a3b8', c2: '#475569' }
  if (toks >= 100) return { grade: 'S', c1: '#22c55e', c2: '#15803d' }
  if (toks >= 60)  return { grade: 'A', c1: '#60a5fa', c2: '#2563eb' }
  if (toks >= 30)  return { grade: 'B', c1: '#fbbf24', c2: '#d97706' }
  if (toks >= 15)  return { grade: 'C', c1: '#a78bfa', c2: '#7c3aed' }
  return                  { grade: 'F', c1: '#f87171', c2: '#dc2626' }
}

function font(size, weight = '400') {
  return `${weight} ${size}px ${FONT_STACK}`
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function truncate(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let str = text
  while (str.length > 1 && ctx.measureText(str + '…').width > maxWidth) {
    str = str.slice(0, -1)
  }
  return str + '…'
}

/**
 * 品牌 logo：slate 圆角方块 + sky→emerald 折线 + 圆点（与 Header 图标风格一致）
 */
function drawLogo(ctx, x, y, size) {
  ctx.save()
  roundRectPath(ctx, x, y, size, size, size * 0.28)
  ctx.fillStyle = '#0f172a'
  ctx.fill()
  const s = size / 64
  ctx.translate(x, y)
  // 折线（渐变）
  const grad = ctx.createLinearGradient(16 * s, 18 * s, 50 * s, 46 * s)
  grad.addColorStop(0, '#38bdf8')
  grad.addColorStop(1, '#10b981')
  ctx.strokeStyle = grad
  ctx.lineWidth = 5 * s
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(18 * s, 42 * s)
  ctx.lineTo(27 * s, 33 * s)
  ctx.lineTo(34 * s, 37 * s)
  ctx.lineTo(46 * s, 23 * s)
  ctx.stroke()
  // 端点圆
  ctx.fillStyle = '#f8fafc'
  ctx.beginPath()
  ctx.arc(46 * s, 23 * s, 4 * s, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawBadge(ctx, cx, cy, r, rating) {
  ctx.save()
  // 外发光
  ctx.beginPath()
  ctx.arc(cx, cy, r + 6, 0, Math.PI * 2)
  ctx.fillStyle = rating.c1 + '26'
  ctx.fill()
  // 主圆（径向渐变）
  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.2, cx, cy, r)
  grad.addColorStop(0, rating.c1)
  grad.addColorStop(1, rating.c2)
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()
  // 内环
  ctx.beginPath()
  ctx.arc(cx, cy, r - 4, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.lineWidth = 2
  ctx.stroke()
  // 高光
  ctx.beginPath()
  ctx.ellipse(cx - r * 0.28, cy - r * 0.4, r * 0.35, r * 0.22, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.fill()
  // 等级字母
  ctx.fillStyle = '#ffffff'
  ctx.font = font(Math.round(r * 1.15), '900')
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(rating.grade, cx, cy + r * 0.06)
  ctx.restore()
}

function drawMetricChip(ctx, x, y, w, h, label, value, accent) {
  ctx.save()
  roundRectPath(ctx, x, y, w, h, 16)
  ctx.fillStyle = '#f8fafc'
  ctx.fill()
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#6b7280'
  ctx.font = font(20, '600')
  ctx.fillText(truncate(ctx, label, w - 40), x + 20, y + 34)
  ctx.fillStyle = accent || '#111827'
  ctx.font = font(30, '700')
  ctx.fillText(truncate(ctx, value, w - 40), x + 20, y + 74)
  ctx.restore()
}

/**
 * 绘制成绩单到给定 canvas（逻辑尺寸 1200×630，内部按 scale 放大以提升清晰度）
 * @returns {HTMLCanvasElement}
 */
export function drawShareCard(canvas, { result, model, gpu, quant, t, scale = 2 }) {
  const stats = buildShareStats(result, model, gpu, quant)
  canvas.width = WIDTH * scale
  canvas.height = HEIGHT * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)

  // 背景
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  // 顶部品牌色渐隐带
  const topGrad = ctx.createLinearGradient(0, 0, WIDTH, 0)
  topGrad.addColorStop(0, '#10b981')
  topGrad.addColorStop(1, '#38bdf8')
  ctx.fillStyle = topGrad
  ctx.fillRect(0, 0, WIDTH, 8)
  // 外描边
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 2
  roundRectPath(ctx, 1, 1, WIDTH - 2, HEIGHT - 2, 2)
  ctx.stroke()

  const P = 64

  // ── 顶部品牌行 ──
  drawLogo(ctx, P, 44, 56)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#0f172a'
  ctx.font = font(34, '700')
  ctx.fillText('TPS Calculator', P + 56 + 18, 88)
  // 右上站点
  ctx.textAlign = 'right'
  ctx.fillStyle = '#94a3b8'
  ctx.font = font(24, '600')
  ctx.fillText(CARD_SITE, WIDTH - P, 84)

  if (!stats) {
    // 无上下文兜底：仅品牌 + 卖点
    ctx.textAlign = 'left'
    ctx.fillStyle = '#111827'
    ctx.font = font(56, '800')
    ctx.fillText('GPU/LLM TPS & VRAM', P, 300)
    ctx.fillStyle = '#6b7280'
    ctx.font = font(30, '500')
    ctx.fillText('405 models · 251 GPUs', P, 360)
    return canvas
  }

  // ── 模型 + GPU + 量化 ──
  ctx.textAlign = 'left'
  ctx.fillStyle = '#111827'
  ctx.font = font(52, '800')
  ctx.fillText(truncate(ctx, stats.modelName, WIDTH - 2 * P), P, 188)
  ctx.fillStyle = '#6b7280'
  ctx.font = font(28, '500')
  const sub = stats.quantLabel ? `${stats.gpuLabel}  ·  ${stats.quantLabel}` : stats.gpuLabel
  ctx.fillText(truncate(ctx, sub, WIDTH - 2 * P), P, 232)

  // ── 速度评级徽章 + 单请求 tok/s ──
  const rating = speedRating(stats.singleToksMax)
  const badgeCx = P + 92
  const badgeCy = 356
  drawBadge(ctx, badgeCx, badgeCy, 84, rating)

  const numX = badgeCx + 84 + 44
  ctx.textAlign = 'left'
  ctx.fillStyle = rating.c1
  ctx.font = font(92, '900')
  const bigToks = (stats.singleToksMax != null && isFinite(stats.singleToksMax))
    ? stats.singleToksMax.toFixed(1) : '—'
  ctx.fillText(bigToks, numX, 372)
  const bigW = ctx.measureText(bigToks).width
  ctx.fillStyle = rating.c2
  ctx.font = font(34, '700')
  ctx.fillText('tok/s', numX + bigW + 16, 372)
  // 区间 + 单请求标签
  ctx.fillStyle = '#6b7280'
  ctx.font = font(26, '500')
  ctx.fillText(`${t('nav.card_single')}: ${stats.singleToks}`, numX, 416)

  // ── 底部指标条 ──
  const chipY = 470
  const chipH = 96
  const gap = 20
  const chipW = (WIDTH - 2 * P - 2 * gap) / 3
  const runAccent = stats.runnable ? '#059669' : '#dc2626'
  const runMark = stats.runnable ? '✓' : '✗'
  drawMetricChip(ctx, P, chipY, chipW, chipH,
    `${t('nav.card_vram')}  ${runMark}`, stats.vramText, runAccent)
  drawMetricChip(ctx, P + chipW + gap, chipY, chipW, chipH,
    t('nav.card_ttft'), stats.ttft, '#111827')
  const bnLabel = stats.bottleneck ? t('result.' + stats.bottleneck) : '—'
  drawMetricChip(ctx, P + 2 * (chipW + gap), chipY, chipW, chipH,
    t('nav.card_bottleneck'), bnLabel, '#111827')

  // ── 底部站点 ──
  ctx.textAlign = 'right'
  ctx.fillStyle = '#059669'
  ctx.font = font(24, '700')
  ctx.fillText(CARD_SITE, WIDTH - P, HEIGHT - 26)

  return canvas
}

/**
 * 生成分享图 Blob（image/png）
 * @returns {Promise<Blob>}
 */
export function renderShareCardBlob(opts) {
  const canvas = document.createElement('canvas')
  drawShareCard(canvas, opts)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('toBlob returned null'))
    }, 'image/png')
  })
}

/**
 * 触发浏览器下载 Blob（与 exportMd.downloadMarkdown 同套路）
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 复制图片到剪贴板；不支持/失败时返回 false（调用方可降级为下载）
 * @returns {Promise<boolean>}
 */
export async function copyBlobToClipboard(blob) {
  try {
    if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) return false
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return true
  } catch {
    return false
  }
}

/**
 * 分享图文件名：tps-share-{model}-{gpu}-{date}.png
 */
export function shareImageFilename(model, gpu) {
  const date = new Date().toISOString().slice(0, 10)
  const slug = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `tps-share-${slug(model?.name)}-${slug(gpu?.name)}-${date}.png`
}
