// src/utils/calc.js
import { getAttentionSummary, getAttentionType, getTotalHeads } from './model.js'

/**
 * 核心计算函数，无副作用
 *
 * 关键设计决策：
 * - KV Cache 精度独立于权重量化（kv_bytes），INT4 权重的 KV Cache 通常仍是 FP16
 * - MoE 模型 prefill 用 active_params 计算 FLOPs，而非总参数
 * - 多卡 TP 下，每卡只存 1/N 权重，带宽效率按分片后计算
 *
 * @param {object} params
 * @param {object} params.gpu          - GPU 对象
 * @param {number} params.gpuCount     - GPU 数量（Tensor Parallel）
 * @param {object} params.interconnect - 互联方式对象
 * @param {object} params.model        - 模型对象
 * @param {object} params.quant        - 量化精度对象
 * @param {number} params.ctx          - 上下文长度（tokens）
 * @param {number} params.batch        - 并发请求数
 * @param {number} params.promptLen    - Prompt 长度（tokens）
 * @param {number} params.outputLen    - 输出长度（tokens）
 * @param {object} params.framework    - 推理框架对象
 */
export function calcAll({
  gpu, gpuCount, interconnect, model, quant, ctx, batch, promptLen, outputLen, framework,
  flashAttention = true, kvCacheQuant = null, prefixCacheHit = 0,
  cpuOffload = false, pcieBw = null,
}) {
  const totalVram = gpu.vram * gpuCount * (gpu.usableRatio ?? 1.0)
  const totalBw   = gpu.bw   * gpuCount * (gpu.bwUtilization ?? 0.80)
  const tflops    = (gpu[quant.flops_key] ?? gpu.bf16) * gpuCount
  const attentionType = getAttentionType(model)
  const attentionSummary = getAttentionSummary(model)
  const totalHeads = getTotalHeads(model) ?? model.kv_heads ?? 1
  const prefixHitRatio = Math.min(0.99, Math.max(0, Number(prefixCacheHit || 0) / 100))
  const effectivePromptLen = Math.max(1, Math.round(promptLen * (1 - prefixHitRatio)))
  const avgDecodeSeqLen = Math.max(1, Math.min(ctx, promptLen + Math.round(outputLen / 2)))

  // ─────────────────────────────────────────────
  // 显存计算
  // ─────────────────────────────────────────────

  // 权重显存：总参数 × 每参数字节数
  const weightGB = model.params * quant.bytes

  // KV Cache 显存：精度独立于权重量化，通常为 FP16（2 bytes）
  // 公式（混合注意力）：global 层用全上下文，local sliding 层只用窗口大小
  // 混合注意力模型字段：local_layers（sliding 层数）、sliding_window（窗口 tokens）
  //                    global_kv_heads / global_head_dim（global 层独立头配置）
  const kvBytesPerElem = kvCacheQuant?.bytes ?? quant.kv_bytes ?? 2.0
  let kvGB
  if (model.sliding_window != null && model.local_layers != null) {
    const globalLayers  = model.layers - model.local_layers
    const globalKvHeads = model.global_kv_heads ?? model.kv_heads
    const globalHeadDim = model.global_head_dim ?? model.head_dim
    kvGB = 2 * batch * kvBytesPerElem * (
      globalLayers * globalKvHeads * globalHeadDim * ctx +
      model.local_layers * model.kv_heads * model.head_dim * Math.min(ctx, model.sliding_window)
    ) / 1e9
  } else {
    kvGB = 2 * model.layers * model.kv_heads * model.head_dim * ctx * batch * kvBytesPerElem / 1e9
  }
  // MLA（Multi-head Latent Attention）压缩 KV Cache，如 DeepSeek V2/V3/R1
  if (model.mla_ratio) kvGB *= model.mla_ratio

  // 系统开销（CUDA context、激活值、临时 buffer 等）
  // 动态调整：小模型固定 1GB，大模型按权重 3% 计算，上限 5GB
  const overheadGB  = Math.max(1.0, Math.min(weightGB * 0.03, 5.0))
  const totalNeeded = weightGB + kvGB + overheadGB

  // ─────────────────────────────────────────────
  // Decode 速度（内存带宽瓶颈）
  // ─────────────────────────────────────────────
  // Decode 阶段每步只处理 1 token，是带宽密集型
  // MoE：每 token 只激活部分专家，只需读取 active_params 的权重
  // Dense：需要读取全部权重
  // TP 分片：每卡只存 1/N 权重，但 N 卡并行，总带宽 = N × 单卡带宽
  // 因此 bwLimit = totalBw / (activeWeightPerCard) = totalBw / (activeWeight / gpuCount)
  //             = totalBw × gpuCount / activeWeight  ← 但 totalBw 已经 × gpuCount
  // 化简：bwLimit = (gpu.bw × gpuCount) / (activeWeight / gpuCount) × ...
  // 实际上 TP 下每卡读自己那份权重，N 卡同时读，等效带宽 = N × gpu.bw
  // 而每卡权重 = activeWeight / N，所以：
  // bwLimit = (N × gpu.bw) / (activeWeight / N) = N² × gpu.bw / activeWeight
  // 但这忽略了 all-reduce 通信开销，通信效率由 tpEfficiency 修正
  // 简化模型：bwLimit = totalBw / activeWeight × batch（与 gpuCount 无关，因为分子分母都 ×N）
  const activeWeight = model.type === 'moe'
    ? model.active_params * quant.bytes
    : weightGB

  const decodeFactorMin = framework.decodeMin ?? framework.decode
  const decodeFactorMax = framework.decodeMax ?? framework.decode
  const prefillFactorMin = framework.prefillMin ?? framework.prefill
  const prefillFactorMax = framework.prefillMax ?? framework.prefill
  const flashRange = getFlashAttentionBoostRange({ enabled: flashAttention, promptLen: effectivePromptLen })
  const flashFactor = flashRange.mid
  let kvReadGB
  if (model.sliding_window != null && model.local_layers != null) {
    const globalLayers  = model.layers - model.local_layers
    const globalKvHeads = model.global_kv_heads ?? model.kv_heads
    const globalHeadDim = model.global_head_dim ?? model.head_dim
    kvReadGB = 2 * batch * kvBytesPerElem * (
      globalLayers * globalKvHeads * globalHeadDim * avgDecodeSeqLen +
      model.local_layers * model.kv_heads * model.head_dim * Math.min(avgDecodeSeqLen, model.sliding_window)
    ) / 1e9
  } else {
    kvReadGB = 2 * model.layers * model.kv_heads * model.head_dim * avgDecodeSeqLen * batch * kvBytesPerElem / 1e9
  }
  if (model.mla_ratio) kvReadGB *= model.mla_ratio
  const decodeBytesPerStep = activeWeight + kvReadGB

  // MoE CPU Offload：expert 权重经 PCIe 读取，带宽瓶颈从 GPU HBM 变为 PCIe
  const effectiveBw = (cpuOffload && model.type === 'moe' && pcieBw != null)
    ? pcieBw.bw   // GB/s，PCIe 带宽
    : totalBw     // GB/s，GPU HBM 带宽

  // tok/s（batch 个请求并发，带宽被 batch 共享，但每步产出 batch 个 token）
  const bwLimit    = (effectiveBw / decodeBytesPerStep) * batch
  const decodeToks = bwLimit * framework.decode
  const decodeToksMin = bwLimit * decodeFactorMin
  const decodeToksMax = bwLimit * decodeFactorMax

  // 单 token 生成时间（ms），batch=1 时的延迟基准
  const tpot = (decodeBytesPerStep / effectiveBw) * 1000 / framework.decode  // ms/tok

  // ─────────────────────────────────────────────
  // Prefill 速度（算力瓶颈）
  // ─────────────────────────────────────────────
  // Prefill 是计算密集型，FLOPs ≈ 2 × active_params × promptLen
  // MoE 用 active_params（每 token 实际激活的参数量），Dense 用全部参数
  const activeParams = model.type === 'moe'
    ? (model.active_params ?? model.params)
    : model.params
  const prefillAttentionFactor = getPrefillAttentionFactor({ totalHeads, kvHeads: model.kv_heads, attentionType })

  // tok/s：prefill FLOPs/tok = 2 × activeParams × 1e9，promptLen 在分子分母消去
  // 推导：prefill_speed = promptLen / (2 × activeParams × 1e9 × promptLen / tflops × 1e12)
  //                     = tflops × 1e12 / (2 × activeParams × 1e9)
  const computeBaseLimit = (tflops * 1e12) / (2 * activeParams * 1e9)
  const computeLimit = computeBaseLimit * prefillAttentionFactor * flashFactor
  const prefillToks  = computeLimit * framework.prefill
  const prefillToksMin = computeBaseLimit * prefillFactorMin * prefillAttentionFactor * flashRange.min
  const prefillToksMax = computeBaseLimit * prefillFactorMax * prefillAttentionFactor * flashRange.max

  // 首 token 延迟（ms）：纯 prefill 计算时间，多并发时实际排队延迟更高
  const ttft = (effectivePromptLen * 2 * activeParams * 1e9) / (tflops * 1e12) * 1000 / (prefillAttentionFactor * flashFactor * framework.prefill) * Math.max(1, batch)

  // ─────────────────────────────────────────────
  // Roofline 分析
  // ─────────────────────────────────────────────
  // roofline = computeLimit / bwLimit
  // roofline > 1：computeLimit 更高，说明先撞到带宽上限 -> 带宽瓶颈
  // roofline < 1：bwLimit 更高，说明先撞到算力上限 -> 算力瓶颈
  const roofline   = computeLimit / bwLimit
  const bottleneck = roofline > 1 ? 'bandwidth' : 'compute'

  // ─────────────────────────────────────────────
  // TP 通信效率（多卡 Tensor Parallel）
  // ─────────────────────────────────────────────
  // 每层 all-reduce 通信量 ≈ 2 × hidden_size × batch × 2 bytes（BF16）
  // 通信时间 vs 计算时间的比值决定效率
  let tpEfficiency = 1.0
  if (gpuCount > 1 && interconnect) {
    const commBytesPerLayer   = 2 * model.hidden_size * batch * 2 * (gpuCount - 1) / gpuCount  // bytes，BF16，all-reduce 实际系数 2*(N-1)/N
    const commLatencyPerLayer = commBytesPerLayer / (interconnect.bw * 1e9) * 1000  // ms
    const computePerLayer     = tpot / model.layers  // ms
    tpEfficiency = computePerLayer / (computePerLayer + commLatencyPerLayer)
    tpEfficiency = Math.min(1.0, Math.max(0.01, tpEfficiency))
  }

  // ─────────────────────────────────────────────
  // 综合结果
  // ─────────────────────────────────────────────
  const effectiveToks = decodeToks * tpEfficiency
  const effectiveToksMin = decodeToksMin * tpEfficiency
  const effectiveToksMax = decodeToksMax * tpEfficiency
  const singleToks    = effectiveToks / batch
  const singleToksMin = effectiveToksMin / batch
  const singleToksMax = effectiveToksMax / batch
  // 总延迟 = TTFT + 输出 token 数 × 单 token 时间
  const totalLatency  = ttft + outputLen * tpot  // ms

  const totalPower = gpu.tdp * gpuCount / 1000  // kW

  return {
    // 显存
    weightGB, kvGB, overheadGB, totalNeeded, totalVram,
    vramOk:  totalNeeded <= totalVram,
    vramPct: totalNeeded / totalVram * 100,
    // 速度
    bwLimit, computeLimit, decodeToks, prefillToks, kvReadGB, avgDecodeSeqLen,
    decodeToksMin, decodeToksMax, prefillToksMin, prefillToksMax,
    effectiveToks, effectiveToksMin, effectiveToksMax,
    singleToks, singleToksMin, singleToksMax,
    // 延迟
    ttft, tpot, totalLatency,
    // 综合
    roofline, bottleneck, tpEfficiency,
    totalPower,
    flashAttention,
    flashFactorMin: flashRange.min,
    flashFactorMax: flashRange.max,
    flashFactor,
    prefixCacheHit: Math.round(prefixHitRatio * 100),
    effectivePromptLen,
    attentionType,
    totalHeads,
    attentionSummary,
    prefillAttentionFactor,
    kvCacheLabel: kvCacheQuant?.label ?? 'Auto',
    cpuOffload: cpuOffload && model.type === 'moe',
    pcieBwLabel: (cpuOffload && model.type === 'moe' && pcieBw) ? pcieBw.label : null,
  }
}

function getPrefillAttentionFactor({ totalHeads, kvHeads, attentionType }) {
  // GQA/MQA 的 Q/KV head 比例已经体现在 active_params 的主干 FLOPs 里
  // 不应再作为吞吐倍数乘入，否则 MQA 模型（如 Llama 3 70B kvHeads=1）会被放大 64x
  return 1
}

function getFlashAttentionBoostRange({ enabled, promptLen }) {
  if (!enabled) return { min: 1, mid: 1, max: 1 }

  if (promptLen >= 32768) return { min: 3, mid: 4, max: 5 }  // 序列越长，HBM IO 节省越显著，加速倍数单调递增
  if (promptLen >= 8192)  return { min: 2, mid: 2.5, max: 3 }
  if (promptLen >= 2048)  return { min: 1.5, mid: 1.75, max: 2 }
  return { min: 1, mid: 1, max: 1.1 }  // < 2048 tokens，FlashAttention 收益极小
}

/**
 * 生成警告列表
 */
export function getWarnings(result, t) {
  const warnings = []
  const { vramOk, vramPct, totalNeeded, totalVram, tpEfficiency, singleToks, singleToksMin, roofline, totalPower } = result

  if (!vramOk) {
    warnings.push({
      level: 'error',
      key: 'vram_oom',
      diff: (totalNeeded - totalVram).toFixed(1),
    })
  } else if (vramPct > 95) {
    warnings.push({ level: 'warn', key: 'vram_high' })
  }

  if (tpEfficiency < 0.7) {
    warnings.push({ level: 'warn', key: 'tp_comm' })
  }

  if ((singleToksMin ?? singleToks) < 20) {
    warnings.push({ level: 'warn', key: 'slow_single' })
  }

  if (roofline > 10) {
    warnings.push({ level: 'info', key: 'bw_bottleneck' })
  }

  if (totalPower > 10) {
    warnings.push({ level: 'info', key: 'high_power', power: totalPower.toFixed(1) })
  }

  return warnings
}
