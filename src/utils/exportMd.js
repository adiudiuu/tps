// src/utils/exportMd.js
// 将当前计算结果导出为 Markdown 报告
import { fmtToks, fmtToksRange, fmtGB, fmtMs, fmtPct, fmtParams, fmtCtx } from './format.js'
import { calcAll, getWarnings } from './calc.js'
import { QUANT_MAP } from '../data/constants.js'
import { PCIE_BW_OPTIONS } from '../data/runtime.js'

const LOCALE_TAGS = { zh: 'zh-CN', en: 'en-US', es: 'es-ES' }

/**
 * 生成 Markdown 报告字符串
 * @param {object} opts
 * @param {function} opts.t           - i18n t()
 * @param {string} opts.locale        - 'zh' | 'en' | 'es'
 */
export function generateMarkdown({
  gpu, gpuCount, interconnect, model, quant, framework,
  ctx, batch, promptLen, outputLen, flashAttention, kvCacheQuant,
  prefixCacheHit, cpuOffload, pcieBw,
  result, t, locale,
}) {
  const localeTag = LOCALE_TAGS[locale] || LOCALE_TAGS.en
  const now = new Date().toLocaleString(localeTag, {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })

  const lines = []
  const site = 'tps.bunai.com'
  const onOff = (v) => v ? t('run.enabled') : t('run.disabled')

  lines.push(`# ${t('md.title')}`)
  lines.push('')
  lines.push(`> ${t('md.generated', { time: now, site })}`)
  lines.push('')

  // ── 1. 配置摘要 ──────────────────────────────────────
  lines.push(`## ${t('md.config_summary')}`)
  lines.push('')
  const gpuStr = gpuCount > 1
    ? `${gpu.name} × ${gpuCount}${interconnect ? ` (${interconnect.label})` : ''}`
    : gpu.name
  lines.push(`| ${t('md.item')} | ${t('md.value')} |`)
  lines.push('|---|---|')
  lines.push(`| GPU | ${gpuStr} |`)
  lines.push(`| ${t('md.total_vram')} | ${gpu.unifiedMemory ? `${gpu.vram * gpuCount} GB ${t('md.physical')} / ${fmtGB(result.totalVram)} ${t('md.usable')}` : fmtGB(result.totalVram)} |`)
  lines.push(`| ${t('md.total_bw')} | ${gpu.bw * gpuCount} GB/s |`)
  lines.push(`| ${t('md.total_tflops')} | ${gpu.bf16 * gpuCount} TFLOPS |`)
  lines.push(`| ${t('md.quantization')} | ${quant.label} |`)
  lines.push(`| ${t('md.framework')} | ${framework.labelKey ? t(framework.labelKey) : (framework.label ?? framework.id)} |`)
  lines.push('')

  // ── 2. 模型信息 ──────────────────────────────────────
  lines.push(`## ${t('md.model_info')}`)
  lines.push('')
  lines.push(`| ${t('md.item')} | ${t('md.value')} |`)
  lines.push('|---|---|')
  lines.push(`| ${t('md.name')} | ${model.name} |`)
  lines.push(`| ${t('md.type')} | ${model.type === 'moe' ? 'MoE' : 'Dense'} |`)
  lines.push(`| ${t('md.total_params')} | ${fmtParams(model.params)} |`)
  if (model.type === 'moe' && model.active_params) {
    lines.push(`| ${t('md.active_params')} | ${fmtParams(model.active_params)} |`)
  }
  lines.push(`| ${t('md.max_context')} | ${fmtCtx(model.max_ctx)} |`)
  lines.push(`| Attention | ${result.attentionSummary} |`)
  lines.push(`| ${t('md.layers')} | ${model.layers} |`)
  lines.push(`| Hidden Size | ${model.hidden_size} |`)
  lines.push('')

  // ── 3. 运行参数 ──────────────────────────────────────
  lines.push(`## ${t('md.runtime')}`)
  lines.push('')
  lines.push(`| ${t('md.item')} | ${t('md.value')} |`)
  lines.push('|---|---|')
  lines.push(`| ${t('md.context_length')} | ${fmtCtx(ctx)} tokens |`)
  lines.push(`| ${t('md.batch_size')} | ${batch} |`)
  lines.push(`| ${t('md.prompt_length')} | ${promptLen.toLocaleString()} tokens |`)
  lines.push(`| ${t('md.output_length')} | ${outputLen.toLocaleString()} tokens |`)
  lines.push(`| Flash Attention | ${onOff(flashAttention)} |`)
  lines.push(`| ${t('md.kv_quant')} | ${result.kvCacheLabel} |`)
  lines.push(`| ${t('md.prefix_hit')} | ${prefixCacheHit}% |`)
  if (result.cpuOffload) {
    lines.push(`| MoE CPU Offload | ${t('run.enabled')} (${result.pcieBwLabel ?? ''}) |`)
  }
  if (result.speculativeDecoding) {
    lines.push(`| ${t('md.speculative')} | ${t('run.enabled')} · draft ${result.draftLen} tok · ${t('md.acceptance')} ${(result.acceptanceRate * 100).toFixed(0)}% · ×${(1 + result.acceptanceRate * result.draftLen).toFixed(1)} ${t('md.speedup')} |`)
  }
  lines.push('')

  // ── 4. 显存分析 ──────────────────────────────────────
  lines.push(`## ${t('md.vram_analysis')}`)
  lines.push('')
  const needed = result.displayNeeded ?? result.totalNeeded
  const avail = result.displayVram ?? result.totalVram
  const vramStatus = result.vramOk
    ? t('md.vram_ok')
    : t('md.vram_oom', { diff: (needed - avail).toFixed(1) })
  lines.push(`**${t('md.status')}**: ${vramStatus}`)
  if (result.vramScope === 'per_card') {
    lines.push(`> ${t('md.tp_note', { count: result.gpuCount })}`)
  }
  lines.push('')
  let vramRatingStr
  if (!result.vramOk)              vramRatingStr = t('md.vram_rating_oom')
  else if (result.vramPct > 95)    vramRatingStr = t('md.vram_rating_tight')
  else                             vramRatingStr = t('md.vram_rating_ok')
  lines.push(`**${t('md.rating')}**: ${vramRatingStr}`)
  lines.push('')
  const vramDenom = avail || result.totalVram || 1
  lines.push(`| ${t('md.item')} | ${t('md.memory')} | ${t('md.ratio')} |`)
  lines.push('|---|---|---|')
  lines.push(`| ${t('md.weights')} | ${fmtGB(result.weightGB)} | ${fmtPct(result.weightGB / vramDenom * 100)} |`)
  lines.push(`| KV Cache | ${fmtGB(result.kvGB)} | ${fmtPct(result.kvGB / vramDenom * 100)} |`)
  if (result.activationGB > 0) {
    lines.push(`| ${t('md.activation')} | ${fmtGB(result.activationGB)} | ${fmtPct(result.activationGB / vramDenom * 100)} |`)
  }
  lines.push(`| ${t('md.overhead')} | ${fmtGB(result.overheadGB)} | ${fmtPct(result.overheadGB / vramDenom * 100)} |`)
  lines.push(`| **${result.vramScope === 'per_card' ? t('md.per_gpu_needed') : t('md.total_needed')}** | **${fmtGB(needed)}** | **${fmtPct(result.vramPct)}** |`)
  lines.push(`| ${result.vramScope === 'per_card' ? t('md.per_gpu_available') : t('md.available')} | ${fmtGB(avail)} | — |`)
  if (result.vramScope === 'per_card' && result.clusterNeeded != null) {
    lines.push(`| ${t('md.cluster_total')} | ${fmtGB(result.clusterNeeded)} / ${fmtGB(result.totalVram)} | — |`)
  }
  lines.push('')

  // 量化对比矩阵
  lines.push(`### ${t('md.quant_matrix')}`)
  lines.push('')
  lines.push(`> ${t('md.quant_matrix_note')}`)
  lines.push('')
  lines.push(`| ${t('md.quant')} | ${t('md.vram')} | ${t('md.status')} | ${t('md.est_speed')} |`)
  lines.push('|---|---|---|---|')
  const _speculativeDecoding = result.speculativeDecoding
  const _acceptanceRate = result.acceptanceRate
  const _draftLen = result.draftLen
  for (const q of QUANT_MAP) {
    try {
      const r = calcAll({
        gpu, gpuCount, interconnect, model, quant: q, ctx, batch,
        promptLen, outputLen, framework, flashAttention, kvCacheQuant,
        prefixCacheHit, cpuOffload, pcieBw,
        speculativeDecoding: _speculativeDecoding, acceptanceRate: _acceptanceRate, draftLen: _draftLen,
      })
      const isCurrent = q.id === quant.id
      const label = isCurrent ? `**${q.label}**` : q.label
      const vramNeeded = r.displayNeeded ?? r.totalNeeded
      const vram = isCurrent ? `**${fmtGB(vramNeeded)}**` : fmtGB(vramNeeded)
      let status
      if (r.vramOk) {
        status = `✅ ${fmtPct(r.vramPct)}`
      } else if (!cpuOffload && model.type === 'moe' && model.active_params) {
        try {
          const fallbackPcie = pcieBw ?? PCIE_BW_OPTIONS.find(x => x.id === 'gen4')
          const ro = calcAll({
            gpu, gpuCount, interconnect, model, quant: q, ctx, batch,
            promptLen, outputLen, framework, flashAttention, kvCacheQuant,
            prefixCacheHit, cpuOffload: true, pcieBw: fallbackPcie,
            speculativeDecoding: _speculativeDecoding, acceptanceRate: _acceptanceRate, draftLen: _draftLen,
          })
          status = ro.vramOk
            ? `⚡ ${fmtGB(ro.displayNeeded ?? ro.totalNeeded)} ${t('md.offloadable')}`
            : `❌ OOM`
        } catch { status = `❌ OOM` }
      } else {
        status = `❌ OOM`
      }
      const speed = r.vramOk ? `${r.decodeToks.toFixed(1)} tok/s` : '—'
      lines.push(`| ${label} | ${vram} | ${status} | ${speed} |`)
    } catch { /* skip */ }
  }
  lines.push('')

  // ── 5. 速度与延迟 ──────────────────────────────────────
  lines.push(`## ${t('md.speed_latency')}`)
  lines.push('')
  if (!result.vramOk) {
    lines.push(`> ${t('md.oom_speed_note')}`)
    lines.push('')
  }
  const toks = result.singleToksMax
  let speedRatingStr
  if (!result.vramOk)  speedRatingStr = t('md.speed_rating_oom')
  else if (toks >= 60) speedRatingStr = t('md.speed_rating_blazing')
  else if (toks >= 30) speedRatingStr = t('md.speed_rating_smooth')
  else if (toks >= 15) speedRatingStr = t('md.speed_rating_usable')
  else                 speedRatingStr = t('md.speed_rating_slow')
  lines.push(`**${t('md.rating')}**: ${speedRatingStr}`)
  lines.push('')

  // Decode
  lines.push(`### ${t('md.decode_title')}`)
  lines.push('')
  lines.push(`| ${t('md.metric')} | ${t('md.value')} |`)
  lines.push('|---|---|')
  lines.push(`| ${t('md.bw_limit')} | ${fmtToks(result.bwLimit)} |`)
  lines.push(`| ${t('md.actual_throughput_total')} | ${fmtToksRange(result.decodeToksMin, result.decodeToksMax)} |`)
  lines.push(`| ${t('md.single_request')} | ${fmtToksRange(result.singleToksMin, result.singleToksMax)} |`)
  lines.push(`| ${t('md.kv_read')} | ${fmtGB(result.kvReadGB)}/step |`)
  if (result.tpEfficiency < 1) {
    lines.push(`| ${t('md.tp_eff')} | ${fmtPct(result.tpEfficiency * 100)} |`)
  }
  lines.push('')

  // Prefill
  lines.push(`### ${t('md.prefill_title')}`)
  lines.push('')
  lines.push(`| ${t('md.metric')} | ${t('md.value')} |`)
  lines.push('|---|---|')
  lines.push(`| ${t('md.compute_limit')} | ${fmtToks(result.computeLimit)} |`)
  lines.push(`| ${t('md.actual_throughput')} | ${fmtToksRange(result.prefillToksMin, result.prefillToksMax)} |`)
  lines.push(`| ${t('md.fa_boost')} | ×${result.flashFactorMin.toFixed(1)} ~ ×${result.flashFactorMax.toFixed(1)} |`)
  lines.push(`| ${t('md.effective_prompt')} | ${result.effectivePromptLen.toLocaleString()} tokens |`)
  lines.push('')

  // Roofline
  const bottleneckLabel = result.bottleneck === 'bandwidth'
    ? t('md.bw_bound')
    : t('md.compute_bound')
  lines.push(`**${t('md.bottleneck')}**: ${bottleneckLabel}　　**Roofline**: ${result.roofline.toFixed(2)}`)
  lines.push('')

  // 延迟
  lines.push(`### ${t('md.latency')}`)
  lines.push('')
  lines.push(`| ${t('md.metric')} | ${t('md.value')} |`)
  lines.push('|---|---|')
  lines.push(`| ${t('md.ttft')} | ${fmtMs(result.ttft)} |`)
  lines.push(`| ${t('md.tpot')} | ${fmtMs(result.tpot)} |`)
  lines.push(`| ${t('md.total_latency')} | ${fmtMs(result.totalLatency)} |`)
  lines.push(`| ${t('md.total_power')} | ${result.totalPower.toFixed(1)} kW${gpu.unifiedMemory ? t('md.soc_tdp') : ''} |`)
  lines.push('')

  // ── 6. 警告与建议 ──────────────────────────────────────
  const warnings = getWarnings(result, t)
  if (warnings.length > 0) {
    lines.push(`## ${t('md.warnings')}`)
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
  lines.push(`*${t('md.footer', { site })}*`)
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
