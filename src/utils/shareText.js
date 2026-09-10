// src/utils/shareText.js
// 分享文案：与「导出报告」同源的字段，拼成精炼一句话 / 结构化成绩单数据
import { fmtToksRange, fmtGB, fmtMs } from './format.js'

/**
 * GPU 标签：多卡时展示 name × count（与 exportMd / Header 一致）
 */
export function gpuShareLabel(gpu, result) {
  if (!gpu) return ''
  const count = result?.gpuCount ?? 1
  return count > 1 ? `${gpu.name} × ${count}` : gpu.name
}

/**
 * 从计算结果抽取成绩单核心字段（供分享文案与 Canvas 分享图复用）
 * 口径与 Export Report 一致：runnable、单请求 tok/s 区间、显存 needed/total、TTFT、瓶颈
 * @returns {object|null}
 */
export function buildShareStats(result, model, gpu, quant) {
  if (!result || !model || !gpu) return null
  const runnable = result.runnable ?? result.vramOk ?? true
  const needed = result.displayNeeded ?? result.totalNeeded
  const vram = result.displayVram ?? result.totalVram
  return {
    modelName: model.name,
    gpuLabel: gpuShareLabel(gpu, result),
    quantLabel: quant?.label ?? '',
    runnable,
    singleToks: fmtToksRange(result.singleToksMin, result.singleToksMax),
    singleToksMax: result.singleToksMax,
    vramNeeded: fmtGB(needed),
    vramTotal: fmtGB(vram),
    vramText: `${fmtGB(needed)} / ${fmtGB(vram)}`,
    ttft: fmtMs(result.ttft),
    bottleneck: result.bottleneck,
  }
}

/**
 * 分享文案（X 推文 / Web Share text）：一句话带上模型 + GPU 上下文
 * 无上下文时退回通用文案。
 * @param {function} t - i18n t()
 */
export function buildShareSummary(result, model, gpu, quant, t) {
  const stats = buildShareStats(result, model, gpu, quant)
  if (!stats) return t('nav.share_x_text_generic')
  return t('nav.share_summary', {
    model: stats.modelName,
    gpu: stats.gpuLabel,
    runnable: stats.runnable ? t('nav.share_runnable_yes') : t('nav.share_runnable_no'),
    toks: stats.singleToks,
    vram: stats.vramText,
    ttft: stats.ttft,
  })
}
