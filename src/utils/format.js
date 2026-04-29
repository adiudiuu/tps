// src/utils/format.js

/**
 * 判断是否是近 30 天内发布（released 格式 'YYYY-MM'）
 */
export function isNew(released) {
  if (!released) return false
  const [year, month] = String(released).split('-').map(Number)
  const releaseDate = new Date(year, (month || 1) - 1, 1)
  const now = new Date()
  const diffDays = (now - releaseDate) / (1000 * 60 * 60 * 24)
  return diffDays <= 60
}

/**
 * 格式化 tok/s
 */
export function fmtToks(val) {
  if (!isFinite(val) || val <= 0) return '—'
  if (val >= 1e6) return (val / 1e6).toFixed(1) + 'M tok/s'
  if (val >= 1000) return (val / 1000).toFixed(1) + 'k tok/s'
  return val.toFixed(1) + ' tok/s'
}

export function fmtToksRange(min, max) {
  if (!isFinite(min) || min <= 0 || !isFinite(max) || max <= 0) return '—'
  if (Math.abs(max - min) < 0.05) return fmtToks(min)
  return `${fmtToks(min)} - ${fmtToks(max)}`
}

/**
 * 格式化延迟（ms）
 */
export function fmtMs(val) {
  if (!isFinite(val) || val < 0) return '—'
  if (val >= 1000) return (val / 1000).toFixed(2) + ' s'
  return val.toFixed(0) + ' ms'
}

/**
 * 格式化 GB
 */
export function fmtGB(val) {
  if (!isFinite(val)) return '—'
  return val.toFixed(1) + ' GB'
}

/**
 * 格式化参数量
 */
export function fmtParams(val) {
  if (val >= 1000) return (val / 1000).toFixed(1) + 'T'
  return val + 'B'
}

/**
 * 格式化上下文长度
 */
export function fmtCtx(val) {
  if (val >= 1000000) return (val / 1000000).toFixed(0) + 'M'
  if (val >= 1000) return (val / 1000).toFixed(0) + 'k'
  return String(val)
}

/**
 * 格式化百分比
 */
export function fmtPct(val) {
  return val.toFixed(1) + '%'
}
