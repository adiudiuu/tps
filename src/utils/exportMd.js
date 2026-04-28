// src/utils/exportMd.js
// 将当前计算结果导出为 Markdown 报告
import { fmtToks, fmtToksRange, fmtGB, fmtMs, fmtPct, fmtParams, fmtCtx } from './format.js'
import { calcAll, getWarnings } from './calc.js'
import { QUANT_MAP } from '../data/constants.js'

/**
 * 生成 Markdown 报告字符串
 * @param {object} opts
 * @param {object} opts.gpu
 * @param {number} opts.gpuCount
 * @param {object} opts.interconnect
 * @param {object} opts.model
 * @param {object} opts.quant
 * @param {object} opts.framework
 * @param {number} opts.ctx
 * @param {number} opts.batch
 * @param {number} opts.promptLen
 * @param {number} opts.outputLen
 * @param {boolean} opts.flashAttention
 * @param {object} opts.kvCacheQuant
 * @param {number} opts.prefixCacheHit
 * @param {boolean} opts.cpuOffload
 * @param {object|null} opts.pcieBw
 * @param {object} opts.result        - calcAll() 返回值
 * @param {function} opts.t           - i18n t()
 * @param {string} opts.locale        - 'zh' | 'en'
 */
export function generateMarkdown({
  gpu, gpuCount, interconnect, model, quant, framework,
  ctx, batch, promptLen, outputLen, flashAttention, kvCacheQuant,
  prefixCacheHit, cpuOffload, pcieBw,
  result, t, locale,
}) {
  const isZh = locale === 'zh'
  const now = new Date().toLocaleString(isZh ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })

  const lines = []
  const h1 = isZh ? '# GPU 推理速度估算报告' : '# GPU Inference Speed Estimation Report'
  const site = 'tps.bunai.com'

  lines.push(h1)
  lines.push('')
  lines.push(isZh ? `> 生成时间：${now} ｜ ${site}` : `> Generated: ${now} | ${site}`)
  lines.push('')

  // ── 1. 配置摘要 ──────────────────────────────────────
  lines.push(isZh ? '## 配置摘要' : '## Configuration Summary')
  lines.push('')
  const gpuStr = gpuCount > 1
    ? `${gpu.name} × ${gpuCount}${interconnect ? ` (${interconnect.label})` : ''}`
    : gpu.name
  lines.push(`| ${isZh ? '项目' : 'Item'} | ${isZh ? '值' : 'Value'} |`)
  lines.push('|---|---|')
  lines.push(`| GPU | ${gpuStr} |`)
  lines.push(`| ${isZh ? '总显存' : 'Total VRAM'} | ${fmtGB(result.totalVram)} |`)
  lines.push(`| ${isZh ? '总带宽' : 'Total BW'} | ${gpu.bw * gpuCount} GB/s |`)
  lines.push(`| ${isZh ? '总算力 (BF16)' : 'Total TFLOPS (BF16)'} | ${gpu.bf16 * gpuCount} TFLOPS |`)
  lines.push(`| ${isZh ? '量化精度' : 'Quantization'} | ${quant.label} |`)
  lines.push(`| ${isZh ? '推理框架' : 'Framework'} | ${framework.label} |`)
  lines.push('')

  // ── 2. 模型信息 ──────────────────────────────────────
  lines.push(isZh ? '## 模型信息' : '## Model Information')
  lines.push('')
  lines.push(`| ${isZh ? '项目' : 'Item'} | ${isZh ? '值' : 'Value'} |`)
  lines.push('|---|---|')
  lines.push(`| ${isZh ? '名称' : 'Name'} | ${model.name} |`)
  lines.push(`| ${isZh ? '类型' : 'Type'} | ${model.type === 'moe' ? 'MoE' : 'Dense'} |`)
  lines.push(`| ${isZh ? '总参数' : 'Total Params'} | ${fmtParams(model.params)} |`)
  if (model.type === 'moe' && model.active_params) {
    lines.push(`| ${isZh ? '活跃参数' : 'Active Params'} | ${fmtParams(model.active_params)} |`)
  }
  lines.push(`| ${isZh ? '最大上下文' : 'Max Context'} | ${fmtCtx(model.max_ctx)} |`)
  lines.push(`| Attention | ${result.attentionSummary} |`)
  lines.push(`| ${isZh ? '层数' : 'Layers'} | ${model.layers} |`)
  lines.push(`| Hidden Size | ${model.hidden_size} |`)
  lines.push('')

  // ── 3. 运行参数 ──────────────────────────────────────
  lines.push(isZh ? '## 运行参数' : '## Runtime Parameters')
  lines.push('')
  lines.push(`| ${isZh ? '项目' : 'Item'} | ${isZh ? '值' : 'Value'} |`)
  lines.push('|---|---|')
  lines.push(`| ${isZh ? '上下文长度' : 'Context Length'} | ${fmtCtx(ctx)} tokens |`)
  lines.push(`| ${isZh ? '并发数' : 'Batch Size'} | ${batch} |`)
  lines.push(`| Prompt ${isZh ? '长度' : 'Length'} | ${promptLen.toLocaleString()} tokens |`)
  lines.push(`| ${isZh ? '输出长度' : 'Output Length'} | ${outputLen.toLocaleString()} tokens |`)
  lines.push(`| Flash Attention | ${flashAttention ? (isZh ? '开启' : 'Enabled') : (isZh ? '关闭' : 'Disabled')} |`)
  lines.push(`| KV Cache ${isZh ? '量化' : 'Quant'} | ${result.kvCacheLabel} |`)
  lines.push(`| Prefix Cache ${isZh ? '命中率' : 'Hit Rate'} | ${prefixCacheHit}% |`)
  if (result.cpuOffload) {
    lines.push(`| MoE CPU Offload | ${isZh ? '开启' : 'Enabled'} (${result.pcieBwLabel ?? ''}) |`)
  }
  lines.push('')

  // ── 4. 显存分析 ──────────────────────────────────────
  lines.push(isZh ? '## 显存分析' : '## VRAM Analysis')
  lines.push('')
  const vramStatus = result.vramOk
    ? (isZh ? '✅ 显存充足' : '✅ VRAM OK')
    : (isZh ? `❌ 显存不足 ${(result.totalNeeded - result.totalVram).toFixed(1)} GB` : `❌ VRAM insufficient by ${(result.totalNeeded - result.totalVram).toFixed(1)} GB`)
  lines.push(`**${isZh ? '状态' : 'Status'}**: ${vramStatus}`)
  lines.push('')
  // 显存评级
  let vramRatingStr
  if (!result.vramOk)              vramRatingStr = isZh ? '🔴 不足 — 无法运行'       : '🔴 Insufficient — Cannot run'
  else if (result.vramPct > 95)    vramRatingStr = isZh ? '🟡 紧张 — 接近上限'       : '🟡 Tight — Near the limit'
  else                             vramRatingStr = isZh ? '🟢 宽裕 — 显存充足'       : '🟢 Comfortable — Plenty of headroom'
  lines.push(`**${isZh ? '体验评级' : 'Rating'}**: ${vramRatingStr}`)
  lines.push('')
  lines.push(`| ${isZh ? '项目' : 'Item'} | ${isZh ? '显存' : 'Memory'} | ${isZh ? '占比' : 'Ratio'} |`)
  lines.push('|---|---|---|')
  lines.push(`| ${isZh ? '模型权重' : 'Model Weights'} | ${fmtGB(result.weightGB)} | ${fmtPct(result.weightGB / result.totalVram * 100)} |`)
  lines.push(`| KV Cache | ${fmtGB(result.kvGB)} | ${fmtPct(result.kvGB / result.totalVram * 100)} |`)
  lines.push(`| ${isZh ? '系统开销' : 'Overhead'} | ${fmtGB(result.overheadGB)} | ${fmtPct(result.overheadGB / result.totalVram * 100)} |`)
  lines.push(`| **${isZh ? '总需求' : 'Total Needed'}** | **${fmtGB(result.totalNeeded)}** | **${fmtPct(result.vramPct)}** |`)
  lines.push(`| ${isZh ? '可用显存' : 'Available'} | ${fmtGB(result.totalVram)} | — |`)
  lines.push('')

  // 量化对比矩阵
  lines.push(isZh ? '### 量化对比矩阵' : '### Quantization Comparison')
  lines.push('')
  lines.push(isZh
    ? '> 理论估算，不代表该量化精度有对应的发布版本。'
    : '> Theoretical estimates. Does not imply a quantized release exists for this model.')
  lines.push('')
  lines.push(`| ${isZh ? '量化' : 'Quant'} | ${isZh ? '显存需求' : 'VRAM'} | ${isZh ? '状态' : 'Status'} | ${isZh ? '预估速度' : 'Est. Speed'} |`)
  lines.push('|---|---|---|---|')
  for (const q of QUANT_MAP) {
    try {
      const r = calcAll({
        gpu, gpuCount, interconnect, model, quant: q, ctx, batch,
        promptLen, outputLen, framework, flashAttention, kvCacheQuant,
        prefixCacheHit, cpuOffload, pcieBw,
      })
      const isCurrent = q.id === quant.id
      const label = isCurrent ? `**${q.label}**` : q.label
      const vram = isCurrent ? `**${fmtGB(r.totalNeeded)}**` : fmtGB(r.totalNeeded)
      const status = r.vramOk
        ? `✅ ${fmtPct(r.vramPct)}`
        : `❌ OOM`
      const speed = r.vramOk ? `${r.decodeToks.toFixed(1)} tok/s` : '—'
      lines.push(`| ${label} | ${vram} | ${status} | ${speed} |`)
    } catch { /* skip */ }
  }
  lines.push('')

  // ── 5. 速度与延迟 ──────────────────────────────────────
  lines.push(isZh ? '## 速度与延迟' : '## Speed & Latency')
  lines.push('')
  // 速度评级（基于单请求速度）
  const toks = result.singleToksMax
  let speedRatingStr
  if (toks >= 60)      speedRatingStr = isZh ? '🟢 极快 — 适合实时对话'         : '🟢 Blazing — Real-time chat ready'
  else if (toks >= 30) speedRatingStr = isZh ? '🟡 流畅 — 适合普通使用'         : '🟡 Smooth — Great for everyday use'
  else if (toks >= 15) speedRatingStr = isZh ? '🟠 可用 — 轻度使用'             : '🟠 Usable — Light usage'
  else                 speedRatingStr = isZh ? '🔴 较慢 — 建议换量化或升级硬件' : '🔴 Slow — Consider quantization or better hardware'
  lines.push(`**${isZh ? '体验评级' : 'Rating'}**: ${speedRatingStr}`)
  lines.push('')

  // Decode
  lines.push(isZh ? '### Decode 速度（带宽瓶颈）' : '### Decode Speed (Memory Bound)')
  lines.push('')
  lines.push(`| ${isZh ? '指标' : 'Metric'} | ${isZh ? '值' : 'Value'} |`)
  lines.push('|---|---|')
  lines.push(`| ${isZh ? '带宽上限' : 'BW Limit'} | ${fmtToks(result.bwLimit)} |`)
  lines.push(`| ${isZh ? '实际吞吐（总）' : 'Actual Throughput (Total)'} | ${fmtToksRange(result.decodeToksMin, result.decodeToksMax)} |`)
  lines.push(`| ${isZh ? '单请求速度' : 'Single Request'} | ${fmtToksRange(result.singleToksMin, result.singleToksMax)} |`)
  lines.push(`| Decode KV ${isZh ? '读取' : 'Read'} | ${fmtGB(result.kvReadGB)}/step |`)
  if (result.tpEfficiency < 1) {
    lines.push(`| TP ${isZh ? '通信效率' : 'Comm Efficiency'} | ${fmtPct(result.tpEfficiency * 100)} |`)
  }
  lines.push('')

  // Prefill
  lines.push(isZh ? '### Prefill 速度（算力瓶颈）' : '### Prefill Speed (Compute Bound)')
  lines.push('')
  lines.push(`| ${isZh ? '指标' : 'Metric'} | ${isZh ? '值' : 'Value'} |`)
  lines.push('|---|---|')
  lines.push(`| ${isZh ? '算力上限' : 'Compute Limit'} | ${fmtToks(result.computeLimit)} |`)
  lines.push(`| ${isZh ? '实际吞吐' : 'Actual Throughput'} | ${fmtToksRange(result.prefillToksMin, result.prefillToksMax)} |`)
  lines.push(`| FlashAttention ${isZh ? '系数' : 'Boost'} | ×${result.flashFactorMin.toFixed(1)} ~ ×${result.flashFactorMax.toFixed(1)} |`)
  lines.push(`| ${isZh ? '有效 Prompt' : 'Effective Prompt'} | ${result.effectivePromptLen.toLocaleString()} tokens |`)
  lines.push('')

  // Roofline
  const bottleneckLabel = result.bottleneck === 'bandwidth'
    ? (isZh ? '⚠️ 带宽瓶颈' : '⚠️ Bandwidth Bound')
    : (isZh ? '✅ 算力瓶颈' : '✅ Compute Bound')
  lines.push(`**${isZh ? '瓶颈类型' : 'Bottleneck'}**: ${bottleneckLabel}　　**Roofline 比**: ${result.roofline.toFixed(2)}`)
  lines.push('')

  // 延迟
  lines.push(isZh ? '### 延迟' : '### Latency')
  lines.push('')
  lines.push(`| ${isZh ? '指标' : 'Metric'} | ${isZh ? '值' : 'Value'} |`)
  lines.push('|---|---|')
  lines.push(`| TTFT (${isZh ? '首 Token 延迟' : 'Time to First Token'}) | ${fmtMs(result.ttft)} |`)
  lines.push(`| TPOT (${isZh ? '生成延迟' : 'Time per Output Token'}) | ${fmtMs(result.tpot)} |`)
  lines.push(`| ${isZh ? '总延迟' : 'Total Latency'} | ${fmtMs(result.totalLatency)} |`)
  lines.push(`| ${isZh ? '总功耗' : 'Total Power'} | ${result.totalPower.toFixed(1)} kW |`)
  lines.push('')

  // ── 6. 警告与建议 ──────────────────────────────────────
  const warnings = getWarnings(result, t)
  if (warnings.length > 0) {
    lines.push(isZh ? '## 警告与建议' : '## Warnings & Suggestions')
    lines.push('')
    const levelIcon = { error: '❌', warn: '⚠️', info: 'ℹ️' }
    for (const w of warnings) {
      const text = t(`warning.${w.key}`, w)
      lines.push(`- ${levelIcon[w.level] ?? '•'} ${text}`)
    }
    lines.push('')
  }

  // ── 尾注 ──────────────────────────────────────────────
  lines.push('---')
  lines.push('')
  lines.push(isZh
    ? `*本报告由 [${site}](https://${site}) 生成，数据为理论估算值，实际性能受硬件状态、驱动版本、模型实现等因素影响。*`
    : `*This report is generated by [${site}](https://${site}). Values are theoretical estimates; actual performance may vary.*`)
  lines.push('')

  return lines.join('\n')
}

/**
 * 触发浏览器下载 .md 文件
 */
export function downloadMarkdown(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
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
 * 生成文件名：tps-report-{model}-{gpu}-{quant}-{date}.md
 */
export function buildFilename(model, gpu, quant) {
  const date = new Date().toISOString().slice(0, 10)
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `tps-${slug(model.name)}-${slug(gpu.name)}-${slug(quant.id)}-${date}.md`
}
