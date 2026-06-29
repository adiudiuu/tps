// src/utils/calc.js
import { getAttentionSummary, getAttentionType, getTotalHeads } from './model.js'

/**
 * 核心计算函数，无副作用
 *
 * 关键设计决策：
 * - KV Cache 精度独立于权重量化（kv_bytes），INT4 权重的 KV Cache 通常仍是 FP16
 * - MoE 模型 prefill 用 active_params 计算 FLOPs，而非总参数
 * - 多卡 TP 下，每卡只存 1/N 权重，带宽效率按分片后计算
 * - EP（Expert Parallelism）：每卡只存部分 expert，需要 all-to-all token routing
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
 * @param {number} [params.epCount]    - Expert Parallelism 度（仅 MoE 模型有效，默认 1 = 不启用）
 */
export function calcAll({
  gpu, gpuCount, interconnect, model, quant, ctx, batch, promptLen, outputLen, framework,
  flashAttention = true, kvCacheQuant = null, prefixCacheHit = 0,
  cpuOffload = false, pcieBw = null, pcieWidth = null,
  pureCpu = false, cpuMemBw = null,
  sysRam = null,
  nglCount = null,
  speculativeDecoding = false, acceptanceRate = 0.7, draftLen = 4, draftModelParams = null,
  ppCount = 1,
  epCount = 1,
  imageCount = 0,
}) {
  const totalVram = gpu.vram * gpuCount * (gpu.usableRatio ?? 1.0)
  const totalBw   = gpu.bw   * gpuCount * (gpu.bwUtilization ?? 0.80) * getAppleDecodeBwScale(gpu)
  const quantBytes = getQuantBytes(quant, gpu, framework)
  const tflops    = getPrefillTflops(gpu, quant) * gpuCount
  const attentionType = getAttentionType(model)
  const attentionSummary = getAttentionSummary(model)
  const totalHeads = getTotalHeads(model) ?? model.kv_heads ?? 1
  const prefixHitRatio = Math.min(0.99, Math.max(0, Number(prefixCacheHit || 0) / 100))
  const effectivePromptLen = Math.max(1, Math.round(promptLen * (1 - prefixHitRatio)))
  const avgDecodeSeqLen = Math.max(1, Math.min(ctx, promptLen + Math.round(outputLen / 2)))

  // 框架效率按模型规模动态调整（如果配置了 modelSizeScaling）
  let adjustedFramework = framework
  if (framework.modelSizeScaling && Array.isArray(framework.modelSizeScaling)) {
    const params = model.params
    // 找到匹配的规模区间
    const scaling = framework.modelSizeScaling.find(s => params < s.maxParams)
    if (scaling) {
      adjustedFramework = {
        ...framework,
        decode: scaling.decode ?? framework.decode,
        decodeMin: scaling.decodeMin ?? framework.decodeMin ?? framework.decode,
        decodeMax: scaling.decodeMax ?? framework.decodeMax ?? framework.decode,
      }
    }
  }

  // ─────────────────────────────────────────────
  // MoE non-expert 参数预计算（EP / CPU Offload 共用）
  // ─────────────────────────────────────────────
  // non_expert_params = (params × experts_per_token - experts × active_params)
  //                     / (experts_per_token - experts)
  // 代表 attention / embedding / normalization 等不参与 expert 路由的 dense 层
  let nonExpertParams = null
  if (model.type === 'moe' && model.active_params != null && model.params != null) {
    nonExpertParams = getMoeNonExpertParams(model)
    if (nonExpertParams == null && model.experts && model.experts_per_token && model.experts_per_token === model.experts) {
      // experts_per_token === experts（top-all）：所有 expert 都激活，退化为 dense
      nonExpertParams = model.active_params
    }
    if (nonExpertParams != null) {
      nonExpertParams = Math.max(0, nonExpertParams)
    }
  }

  // EP（Expert Parallelism）：epCount > 1 且 nonExpertParams 可计算时启用
  // 每卡只存 1/epCount 的 expert + 完整非 expert 权重
  const isEP = epCount > 1 && model.type === 'moe' && nonExpertParams != null
  let epWeightGB = null
  if (isEP) {
    const totalExpertParams = model.params - nonExpertParams
    const expertParamsPerCard = totalExpertParams / epCount
    epWeightGB = (nonExpertParams + expertParamsPerCard) * quantBytes
  }

  // ─────────────────────────────────────────────
  // 显存计算
  // ─────────────────────────────────────────────

  // 权重显存：总参数 × 每参数字节数
  // EP 模式：每卡只存 1/epCount 的 expert + 完整非 expert 权重
  // MoE CPU Offload：expert 权重卸载到 CPU RAM，GPU 只需保留 non-expert dense 层
  const weightGB = isEP
    ? epWeightGB
    : (cpuOffload && model.type === 'moe')
      ? (nonExpertParams != null
          ? nonExpertParams * quantBytes
          : model.active_params * 0.20 * quantBytes)  // 无 experts 字段时按 active 的 20% 估算 non-expert
      : model.params * quantBytes
  // Vision encoder：encoder 权重独立于 LLM backbone（如已包含在 params 内则不重复计算）
  // vision_encoder_params 已从 params 中独立出来的情况：视具体模型而定
  // 当前约定：vision_encoder_params 已包含在 params 内，无需额外加；
  //           但需要额外的 KV token 显存（vision_seq_tokens × imageCount）
  // 额外 vision token 对 KV Cache 的增量在 kvGB 之后加入
  const visionPatchTokens = (model.vision_seq_tokens && imageCount > 0)
    ? model.vision_seq_tokens * imageCount
    : 0

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
  // Mamba 混合架构（Jamba 系列）：只有 Transformer 层有 KV Cache，Mamba 层无 KV Cache
  // mamba_ratio = attention 层占总层数的比例（如 Jamba 1/4 Transformer → mamba_ratio=0.25）
  if (model.mamba_ratio) kvGB *= model.mamba_ratio
  // Vision patch token 额外 KV Cache：每张图的 patch token 占用同等 KV 显存
  if (visionPatchTokens > 0) {
    const kvPatchGB = 2 * model.layers * model.kv_heads * model.head_dim * visionPatchTokens * batch * kvBytesPerElem / 1e9
    kvGB += kvPatchGB
  }

  // 系统开销（CUDA context、激活值、临时 buffer 等）
  // 基础部分：小模型固定 1GB，大模型按权重 3% 计算，上限 5GB
  // 激活值部分：纯推理不保留中间层激活，峰值仅为当前层
  //   单层估算：batch × hidden_size × 4（FFN 中间层约 4× hidden）× 2 bytes（BF16）× 4（安全系数），上限 2GB
  const activationGB = Math.min(batch * (model.hidden_size ?? 4096) * 4 * 2 / 1e9 * 4, 2.0)
  const overheadGB  = Math.max(1.0, Math.min(weightGB * 0.03, 5.0)) + activationGB
  // Dense + llamacpp + offload → NGL 分层，DDR 带宽
  // MoE 不走 NGL 分层（expert 通过 PCIe 卸载，见 decode 带宽路径）
  const isLlamaCppHybrid = cpuOffload && framework?.id === 'llamacpp' && model.type !== 'moe'
  const _effectiveNgl = isLlamaCppHybrid ? (nglCount ?? Math.floor(model.layers / 2)) : model.layers
  const gpuLayerRatio = isLlamaCppHybrid ? Math.min(1, Math.max(0, _effectiveNgl / Math.max(model.layers, 1))) : 1.0
  // PP：每个 pipeline stage 只持有 1/ppCount 的权重和 KV Cache
  // totalVram 是单个 PP stage（一个 TP 组）的可用显存
  const totalNeeded = weightGB * gpuLayerRatio / ppCount + kvGB * gpuLayerRatio / ppCount + overheadGB

  // CPU RAM 需求（仅在涉及 CPU 内存的模式下有效）
  // pureCpu: 全部权重 + KV Cache 都在 DDR
  // llamacpp 混合: CPU 层权重 + 对应比例 KV Cache 在 DDR
  // MoE CPU Offload: expert 权重放 CPU RAM，non-expert + KV Cache 在 GPU HBM
  const cpuRamNeededGB = (() => {
    if (pureCpu) return weightGB + kvGB + overheadGB
    if (isLlamaCppHybrid) return (1 - gpuLayerRatio) * (model.params * quantBytes + kvGB)
    if (cpuOffload && model.type === 'moe') {  // 去掉 !== 'llamacpp'，MoE offload 统一计算
      return Math.max(0, model.params * quantBytes - weightGB)
    }
    return 0
  })()

  // ─────────────────────────────────────────────
  // Decode 速度（内存带宽瓶颈）
  // ─────────────────────────────────────────────
  // Decode 阶段每步只处理 1 token，是带宽密集型
  // MoE：每 token 只激活部分专家，只需读取 active_params 的权重
  // Dense：需要读取全部权重
  // TP 分片：每卡只存 1/N 权重，N 卡同时读，等效带宽 = N × gpu.bw
  // 而每卡权重 = activeWeight / N，bwLimit = totalBw / activeWeight × batch
  // all-reduce 通信开销由后续 tpEfficiency 修正（基于纯物理时间，不含框架系数）
  //
  // EP 模式：每卡只读自己那份 expert 权重（1/epCount），带宽需求大幅降低
  //   每卡 IO = 非 expert 权重 + 本卡 expert 权重 + KV Cache
  //   all-to-all 通信开销由 epCommLatencyMs 单独建模
  const activeWeightRaw = isEP
    ? epWeightGB  // EP 下每卡只读自己那份权重
    : model.type === 'moe'
      ? model.active_params * quantBytes
      : weightGB
  const decodeWeightReadRatio = getDecodeWeightReadRatio(gpu, quant, model, framework)
  const activeWeight = activeWeightRaw * decodeWeightReadRatio

  const decodeFactors = getDecodeFactors({ framework: adjustedFramework })
  const decodeFactorMin = decodeFactors.min
  const decodeFactorMax = decodeFactors.max
  const prefillFactorMin = adjustedFramework.prefillMin ?? adjustedFramework.prefill
  const prefillFactorMax = adjustedFramework.prefillMax ?? adjustedFramework.prefill
  const flashRange = getFlashAttentionBoostRange({ enabled: flashAttention, promptLen: promptLen, headDim: model.head_dim ?? 128 })
  // linear attention 层（如 GatedDeltaNet）不支持 FA，按实际 FA 层占比缩减 boost
  // 优先用 linear_attention_layers 字段（Qwen3.5 MoE 系列）
  // 次级推导：local_layers + sliding_window===0 约定为线性 attention（Qwen3.6 系列 hack）
  const linearAttnLayers = model.linear_attention_layers
    ?? (model.local_layers != null && model.sliding_window === 0 ? model.local_layers : null)
  const faLayerRatio = linearAttnLayers != null
    ? (model.layers - linearAttnLayers) / model.layers
    : 1
  const scaledFlashRange = {
    min: 1 + (flashRange.min - 1) * faLayerRatio,
    mid: 1 + (flashRange.mid - 1) * faLayerRatio,
    max: 1 + (flashRange.max - 1) * faLayerRatio,
  }
  const flashFactor = scaledFlashRange.mid
  let kvReadGB
  if (model.sliding_window != null && model.local_layers != null) {
    const globalLayers  = model.layers - model.local_layers
    const globalKvHeads = model.global_kv_heads ?? model.kv_heads
    const globalHeadDim = model.global_head_dim ?? model.head_dim
    kvReadGB = 2 * batch * kvBytesPerElem * (
      globalLayers * globalKvHeads * globalHeadDim * Math.min(avgDecodeSeqLen, ctx) +
      model.local_layers * model.kv_heads * model.head_dim * Math.min(avgDecodeSeqLen, model.sliding_window)
    ) / 1e9
  } else {
    kvReadGB = 2 * model.layers * model.kv_heads * model.head_dim * avgDecodeSeqLen * batch * kvBytesPerElem / 1e9
  }
  if (model.mla_ratio) kvReadGB *= model.mla_ratio
  if (model.mamba_ratio) kvReadGB *= model.mamba_ratio
  const decodeBytesPerStep = activeWeight + kvReadGB

  // MoE CPU Offload：精细 IO 分拆 + 串行时序模型
  // - expert FFN 权重在 CPU RAM，每步经 PCIe 读到 GPU
  // - 非专家权重（attention/embed）+ KV Cache 始终在 GPU HBM
  // - 两部分串行：t_total = t_pcie_expert + t_gpu_rest → bwLimit = batch / t_total
  // PP 流水线气泡效率：pipeline 未填满时的有效吞吐折扣
  // 对 batch 个请求做 PP 流水，气泡比例 ≈ (ppCount-1)/(batch+ppCount-1)
  // 有效效率 = batch/(batch+ppCount-1)
  const ppBubbleEff = ppCount > 1 ? batch / (batch + ppCount - 1) : 1.0

  // PP 阶段间 P2P 通信延迟（每个 decode step，ms）
  // 跨 stage 传递 hidden_size × batch × 2 bytes（BF16），共 ppCount-1 次
  const ppP2pMs = (ppCount > 1 && interconnect)
    ? (ppCount - 1) * (model.hidden_size ?? 4096) * batch * 2 / (interconnect.bw * 1e9) * 1000
    : 0

  let effectiveBw, bwLimit
  if (pureCpu && cpuMemBw != null) {
    // ── 纯 CPU 路径 ──────────────────────────────────────────────────────────
    // 所有权重和 KV Cache 都从 DDR 读取，瓶颈是内存带宽
    // llama.cpp CPU backend 实测带宽利用率约 0.65（已通过 framework.decode 系数体现）
    // PP / ppBubbleEff 在纯 CPU 场景无意义，不参与计算
    effectiveBw = cpuMemBw.bw
    bwLimit = (effectiveBw / decodeBytesPerStep) * batch
  } else if (isLlamaCppHybrid && cpuMemBw != null) {
    // ── llama.cpp 混合推理：GPU 层走 HBM，CPU 层走 DDR，串行执行
    // t_gpu = GPU 层权重读取时间，t_cpu = CPU 层权重读取时间
    const t_gpu = gpuLayerRatio > 0 ? gpuLayerRatio * decodeBytesPerStep / totalBw : 0
    const t_cpu = (1 - gpuLayerRatio) > 0 ? (1 - gpuLayerRatio) * decodeBytesPerStep / cpuMemBw.bw : 0
    bwLimit = batch / Math.max(t_gpu + t_cpu, 1e-9)
    effectiveBw = cpuMemBw.bw
  } else if (cpuOffload && model.type === 'moe' && pcieBw != null) {
    // ── PCIe expert offload 路径（--cpu-moe，适用于所有框架包括 llamacpp）
    let expertIOPerStep
    if (nonExpertParams != null) {
      const active_expert_params = Math.max(0, model.active_params - nonExpertParams)
      expertIOPerStep = active_expert_params * quantBytes
    } else {
      // 无 experts 字段时：expert FFN 约占 active_params 的 70%
      expertIOPerStep = model.active_params * 0.70 * quantBytes
    }
    const nonExpertIOPerStep = model.active_params * quantBytes - expertIOPerStep
    const gpuIOPerStep = nonExpertIOPerStep + kvReadGB
    // pcieBw.bw = PCIe x16 单向理论峰值（见 runtime.js）
    // pcieWidth.ratio 决定实际带宽占 x16 的比例（x4=0.25, x8=0.5, x16=1.0）
    // 未指定 pcieWidth 时按 x8（台式机最常见）
    const pcieBwUnidirectional = pcieBw.bw * (pcieWidth?.ratio ?? 0.5)
    const tExpert = expertIOPerStep / pcieBwUnidirectional  // s/tok，PCIe 瓶颈
    const tGpu    = gpuIOPerStep    / totalBw               // s/tok，GPU HBM 瓶颈
    // PP：每 stage 各自做 1/ppCount 的工作，流水满载时吞吐 × ppCount，再乘气泡效率
    bwLimit = (1 / (tExpert + tGpu)) * batch * ppCount * ppBubbleEff
    effectiveBw = pcieBw.bw  // 仅用于展示
  } else {
    effectiveBw = totalBw
    // PP：decodeBytesPerStep / ppCount 是单个 stage 的 IO 量；流水满载再乘气泡效率
    bwLimit = (effectiveBw / (decodeBytesPerStep / ppCount)) * batch * ppBubbleEff
  }
  bwLimit *= getBatchSchedulingEfficiency(batch, adjustedFramework)

  // Speculative Decoding 加速：每步尝试验证 draftLen 个 token，接受率为 acceptanceRate
  // 期望接受 token 数：mean_accepted = (1 - α^(γ+1)) / (1 - α)，其中 α=acceptanceRate，γ=draftLen
  // 例：α=0.7, γ=4 → mean_accepted ≈ 2.83
  // draftModelParams（可选）：draft model 每步读 draftLen 次权重，与 target 共用 HBM 带宽，
  //   需重算 bwLimit = effectiveBw / (target_IO + draft_IO) × batch
  let speculativeSpeedup = 1.0
  if (speculativeDecoding && acceptanceRate > 0 && draftLen > 0) {
    // 期望每步接受的 token 数（含 target model 强制接受的最后一个 token）
    const alpha = Math.min(0.999, acceptanceRate)
    const meanAccepted = (1 - Math.pow(alpha, draftLen + 1)) / (1 - alpha)
    speculativeSpeedup = meanAccepted  // ≤ draftLen + 1

    if (draftModelParams != null && draftModelParams > 0) {
      // draft model 读 draftLen 次权重，target model 读 1 次，共用同一 HBM 带宽
      const draftWeightGB = draftModelParams * quantBytes * decodeWeightReadRatio
      const totalIOPerVerifyStep = decodeBytesPerStep + draftWeightGB * draftLen
      bwLimit = (effectiveBw / (totalIOPerVerifyStep / ppCount)) * batch * ppBubbleEff
    }
  }

  // ─────────────────────────────────────────────
  // Prefill 速度（算力瓶颈）
  // ─────────────────────────────────────────────
  // Prefill 是计算密集型，FLOPs ≈ 2 × active_params × promptLen
  // MoE 用 active_params（每 token 实际激活的参数量），Dense 用全部参数
  const activeParams = model.type === 'moe'
    ? (model.active_params ?? model.params)
    : model.params

  // 动态注意力 FLOPs 因子：综合考虑 seq_len、GQA/MQA、线性 attention 层
  // factor > 1 表示 attention 增加了额外 FLOPs，需要在 computeBaseLimit 中除以它
  const prefillAttentionFactor = getPrefillAttentionFactor({
    totalHeads,
    kvHeads:    model.kv_heads,
    headDim:    model.head_dim,
    layers:     model.layers,
    promptLen:  effectivePromptLen,
    activeParams,
    linearAttnLayers,
  })

  // tok/s：prefill FLOPs/tok = 2 × activeParams × 1e9（FFN 部分）
  // 加上 attention FLOPs 后，实际总 FLOPs/tok = prefillAttentionFactor × 2 × activeParams × 1e9
  // 推导：prefill_speed = tflops × 1e12 / (prefillAttentionFactor × 2 × activeParams × 1e9)
  const computeBaseLimit = (tflops * 1e12) / (2 * activeParams * 1e9)
  const computeLimit = (computeBaseLimit / prefillAttentionFactor) * flashFactor
  const prefillToks  = computeLimit * framework.prefill
  const prefillToksMin = (computeBaseLimit / prefillAttentionFactor) * prefillFactorMin * scaledFlashRange.min
  const prefillToksMax = (computeBaseLimit / prefillAttentionFactor) * prefillFactorMax * scaledFlashRange.max

  // 首 token 延迟（ms）：纯 prefill 计算时间
  // continuous batching 模式（vLLM/TRT-LLM/TGI）下请求并发处理，TTFT 不随 batch 线性增加
  // serial 模式（llama.cpp）下请求串行排队，TTFT × batch
  // 实际 FLOPs/token = prefillAttentionFactor × 2 × activeParams × 1e9
  const isContinuousBatching = (framework.schedulingMode ?? 'continuous') === 'continuous'
  const ttft = (effectivePromptLen * prefillAttentionFactor * 2 * activeParams * 1e9) / (tflops * 1e12) * 1000 / (flashFactor * framework.prefill) * (isContinuousBatching ? 1 : Math.max(1, batch)) * getAppleTtftScale(gpu)

  // 单 token 生成时间（ms），batch=1 时的延迟基准
  // offload 模式：bwLimit 已包含串行 IO，从 bwLimit 反推 tpot 保持一致
  // PP 模式：batch / bwLimit 已包含 ppCount 和 ppBubbleEff，反推出每请求 tpot
  // 再叠加 PP 阶段间 P2P 通信延迟 ppP2pMs
  const getDecodeTpotBaseMs = (decodeFactor) => {
    if (pureCpu && cpuMemBw != null) {
      return (decodeBytesPerStep / effectiveBw) * 1000 / decodeFactor
    }
    if (isLlamaCppHybrid && cpuMemBw != null) {
      return (batch / bwLimit) * 1000 / decodeFactor
    }
    if (cpuOffload && model.type === 'moe' && pcieBw != null) {
      return (batch / bwLimit) * 1000 / decodeFactor
    }
    return (decodeBytesPerStep / ppCount / effectiveBw / ppBubbleEff) * 1000 / decodeFactor
  }

  const moeExtraDecodeMs = getMoeExtraDecodeMs({
    gpu,
    framework: adjustedFramework,
    model,
    batch,
  })
  const tpotBase = getDecodeTpotBaseMs(decodeFactors.mid)
  const tpotBaseMin = getDecodeTpotBaseMs(decodeFactorMin)
  const tpotBaseMax = getDecodeTpotBaseMs(decodeFactorMax)

  // decodeToks 在 tpotBase 最终确定后统一计算。
  // Apple MoE 的额外 dispatch 延迟体现在每 token 的串行时间上，而不是简单吞吐折扣。
  let decodeToks = batch / Math.max((tpotBase + moeExtraDecodeMs) / 1000, 1e-9) * speculativeSpeedup
  let decodeToksMin = batch / Math.max((tpotBaseMin + moeExtraDecodeMs) / 1000, 1e-9) * speculativeSpeedup
  let decodeToksMax = batch / Math.max((tpotBaseMax + moeExtraDecodeMs) / 1000, 1e-9) * speculativeSpeedup

  const batchSchedEff = getBatchSchedulingEfficiency(batch, adjustedFramework)
  decodeToks *= batchSchedEff
  decodeToksMin *= batchSchedEff
  decodeToksMax *= batchSchedEff

  const tpot = tpotBase + moeExtraDecodeMs + ppP2pMs

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
  // 核心公式：efficiency = t_compute / (t_compute + t_comm)
  //
  // t_compute_per_layer（纯物理 HBM 时间，不含框架系数）：
  //   (decodeBytesPerStep / ppCount) / totalBw / layers
  //
  // t_comm（ring all-reduce，LogP 模型：α + β × message_size）：
  //   message_size = 2*(N-1)/N × hidden_size × batch × 2 bytes（BF16）
  //   α（固定握手延迟）= latency_per_hop × 2*(N-1) 次握手
  //     节点内 NVLink：~1μs/hop；跨节点 IB：~4μs/hop
  //   β 项 = message_size / interconnect.bw
  //
  // pureCpu / llamacpp hybrid 不做 TP，跳过此计算
  let tpEfficiency = 1.0
  const isGpuPath = !pureCpu && !isLlamaCppHybrid
  if (isGpuPath && gpuCount > 1 && interconnect) {
    // 每层 all-reduce 消息大小（bytes，BF16，ring 系数 2*(N-1)/N）
    const commBytesPerLayer = 2 * (model.hidden_size ?? 4096) * batch * 2 * (gpuCount - 1) / gpuCount

    // β 项：带宽传输时间（ms）
    const commBwMs = commBytesPerLayer / (interconnect.bw * 1e9) * 1000

    // α 项：固定延迟（ms）
    // 节点内（NVLink/PCIe）：~1μs；跨节点（IB）：~4μs per hop，ring 需 2*(N-1) 次握手
    const alphaMs = (interconnect.scope === 'inter')
      ? 0.004 * 2 * (gpuCount - 1)   // IB：4μs × 2*(N-1) 次握手
      : 0.001 * 2 * (gpuCount - 1)   // NVLink：1μs × 2*(N-1) 次握手

    const commLatencyPerLayer = commBwMs + alphaMs  // ms，总通信延迟

    // 纯物理计算时间（ms/layer）：不含框架系数，只看 HBM 带宽
    // 使用 totalBw（GPU HBM 总带宽），decodeBytesPerStep / ppCount 是单 stage IO
    const physicalTimePerLayer = (decodeBytesPerStep / ppCount) / totalBw / (model.layers ?? 1) * 1000

    tpEfficiency = physicalTimePerLayer / (physicalTimePerLayer + commLatencyPerLayer)
    tpEfficiency = Math.min(1.0, Math.max(0.01, tpEfficiency))
  }

  // ─────────────────────────────────────────────
  // EP 通信效率（Expert Parallelism all-to-all）
  // ─────────────────────────────────────────────
  // EP 每个 MoE 层需要两次 all-to-all：
  //   1. dispatch：把 token 路由到持有对应 expert 的卡（发送 hidden_size × experts_per_token tokens）
  //   2. combine：把 expert 输出汇聚回原卡
  //
  // 每次 all-to-all 消息大小（per card）：
  //   batch × experts_per_token × hidden_size × 2 bytes（BF16）/ epCount
  //   （每卡平均接收 batch × experts_per_token / epCount 个 token）
  //
  // 通信延迟模型（LogP）：α + β × message_size
  //   α：节点内 ~1μs，跨节点 ~4μs（与 TP 相同）
  //   两次 all-to-all = 2 × (α + β × msg)
  //
  // MoE 层数 = layers（所有层都有 MoE FFN，attention 层不参与 EP）
  let epEfficiency = 1.0
  if (isEP && isGpuPath && interconnect) {
    const moeLayerCount = model.layers ?? 1
    const hiddenSize = model.hidden_size ?? 4096
    const expertsPerToken = model.experts_per_token ?? 1

    // 每次 all-to-all 每卡消息大小（bytes）
    const a2aMsgBytes = batch * expertsPerToken * hiddenSize * 2 / epCount

    // β 项：带宽传输时间（ms），两次 all-to-all
    const a2aBwMs = 2 * a2aMsgBytes / (interconnect.bw * 1e9) * 1000

    // α 项：固定延迟（ms），两次 all-to-all
    const a2aAlphaMs = (interconnect.scope === 'inter')
      ? 2 * 0.004  // IB：4μs × 2
      : 2 * 0.001  // NVLink：1μs × 2

    const epCommLatencyPerLayer = a2aBwMs + a2aAlphaMs  // ms，每 MoE 层

    // 纯物理计算时间（ms/layer）：每卡只读自己的 expert 权重
    // 注意：decodeBytesPerStep 是每卡 IO，应除以单卡带宽，而非 totalBw（N 卡总带宽）
    const singleCardBw = gpu.bw * (gpu.bwUtilization ?? 0.80)
    const physicalTimePerLayer = (decodeBytesPerStep / ppCount) / singleCardBw / moeLayerCount * 1000

    epEfficiency = physicalTimePerLayer / (physicalTimePerLayer + epCommLatencyPerLayer)
    epEfficiency = Math.min(1.0, Math.max(0.01, epEfficiency))
  }

  // ─────────────────────────────────────────────
  // 综合结果
  // ─────────────────────────────────────────────
  // EP 和 TP 效率叠加：两者都会降低有效吞吐
  const combinedEfficiency = tpEfficiency * epEfficiency
  const effectiveToks = decodeToks * combinedEfficiency
  const effectiveToksMin = decodeToksMin * combinedEfficiency
  const effectiveToksMax = decodeToksMax * combinedEfficiency
  const singleToks    = effectiveToks / batch
  const singleToksMin = effectiveToksMin / batch
  const singleToksMax = effectiveToksMax / batch
  // 总延迟 = TTFT + 输出 token 数 × 单 token 时间
  const totalLatency  = ttft + outputLen * tpot  // ms

  const totalPower = gpu.tdp * gpuCount * ppCount / 1000  // kW，总卡数 = TP × PP
  // 能效比：tok/J = decode吞吐(tok/s) / 总功耗(W)
  // 方便数据中心选型比较能效
  const tokPerJoule = totalPower > 0 ? effectiveToks / (totalPower * 1000) : null
  const accuracyTier = (() => {
    if (gpu.vendor !== 'apple') return 'high'
    if (model.params < 15) return 'low'
    if (model.type === 'moe' && model.experts_per_token === 1) return 'low'
    if (model.type === 'moe' && gpu.bw < 580) return 'mid'
    if (model.params >= 30 && gpu.bw >= 500) return 'high'
    return 'mid'
  })()

  return {
    // 显存
    weightGB, kvGB, overheadGB, activationGB, totalNeeded, totalVram,
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
    epEfficiency,
    epCount,
    isEP,
    totalPower,
    tokPerJoule,
    flashAttention,
    flashFactorMin: scaledFlashRange.min,
    flashFactorMax: scaledFlashRange.max,
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
    pcieWidthLabel: (cpuOffload && model.type === 'moe' && pcieWidth) ? pcieWidth.label : null,
    pureCpu,
    cpuMemBwLabel: (pureCpu && cpuMemBw) ? cpuMemBw.label : null,
    cpuRamNeededGB,
    sysRam,
    speculativeDecoding,
    speculativeSpeedup,
    acceptanceRate,
    draftLen,
    ppCount,
    ppBubbleEff,
    ppP2pMs,
    imageCount,
    visionPatchTokens,
    accuracyTier,
    gpuVendor: gpu.vendor,
    gpuBw: gpu.bw,
    modelType: model.type,
    modelParams: model.params,
    modelExpertsPerToken: model.experts_per_token ?? null,
  }
}

/**
 * 动态计算 prefill 总 FLOPs 修正因子
 *
 * 返回值 factor = total_flops_per_token / ffn_flops_per_token（≥ 1）
 * 在 computeBaseLimit 中除以此因子，得到实际 prefill 速度。
 *
 * computeBaseLimit = tflops / (2 × activeParams × 1e9) 的分母已包含：
 *   - FFN 层 FLOPs（O(n)，per token）
 *   - 线性 attention 层 FLOPs（O(n)，per token，参数已计入 activeParams）
 *
 * 需要额外修正的只有 softmax attention 的 O(n²) 开销：
 *   4 × kv_heads × head_dim × seq_len × softmax_layers
 *   （QK^T + AV，每 token 需 attend 到 seq_len 个位置）
 *
 * 线性 attention 层（GatedDeltaNet 等）无 O(n²) 开销，其 FLOPs 已被 activeParams 覆盖，
 * 不需要额外计入 factor。
 *
 * @param {object} params
 * @param {number} params.kvHeads           - KV 头数（决定 softmax attention FLOPs）
 * @param {number} params.headDim           - 每头维度
 * @param {number} params.layers            - 总层数
 * @param {number} params.promptLen         - prompt 长度（tokens）
 * @param {number} params.activeParams      - 激活参数量（B）
 * @param {number} [params.linearAttnLayers] - 线性注意力层数（从总层数中排除，不计入 softmax attention）
 */
function getPrefillAttentionFactor({ totalHeads, kvHeads, headDim, layers, promptLen, activeParams, linearAttnLayers }) {
  // softmax attention 层数（排除线性 attention 层）
  const linLayers = linearAttnLayers ?? 0
  const softmaxLayers = Math.max(0, (layers ?? 1) - linLayers)

  const kHeads = kvHeads ?? (totalHeads ?? 1)
  const hDim   = headDim ?? 128
  const seqLen = promptLen ?? 512

  // softmax attention 额外 FLOPs/token（O(n²)，不在 activeParams 里）：
  //   QK^T + AV = 4 × kv_heads × head_dim × seq_len × softmax_layers
  const softmaxAttnFlops = 4 * kHeads * hDim * seqLen * softmaxLayers

  // FFN FLOPs/token（O(n)，已被 activeParams 覆盖，作为分母基准）
  const ffnFlopsPerToken = 2 * (activeParams ?? 1) * 1e9

  // factor = (softmax_attn_extra + ffn) / ffn
  // 线性 attention 层的 O(n) FLOPs 已在 ffnFlopsPerToken 中，不重复计入
  return (softmaxAttnFlops + ffnFlopsPerToken) / ffnFlopsPerToken
}

function getMoeNonExpertParams(model) {
  if (model?.type !== 'moe' || model.active_params == null || model.params == null) return null
  if (!model.experts || !model.experts_per_token) return null

  const denom = model.experts_per_token - model.experts
  if (denom === 0) return null

  return (model.params * model.experts_per_token - model.experts * model.active_params) / denom
}

/** GGUF/Ollama 用 gguf_bytes；Apple 默认走 GGUF 体积 */
function getQuantBytes(quant, gpu, framework) {
  const useGguf = gpu?.vendor === 'apple'
    || framework?.id === 'llamacpp'
    || framework?.id === 'llamacpp_metal'
  return useGguf ? (quant?.gguf_bytes ?? quant?.bytes ?? 0.5) : (quant?.bytes ?? 0.5)
}

/** Prefill 算力：量化权重通常不走 INT4 Tensor Core 峰值 */
function getPrefillTflops(gpu, quant) {
  const key = quant?.prefill_flops_key ?? quant?.flops_key ?? 'bf16'
  return gpu?.[key] ?? gpu?.bf16 ?? 1
}

/**
 * Decode 每步实际读取的权重比例（相对存储量）
 * - Apple M4/M5：Metal/MLX 片上缓存显著降低有效 IO
 * - NVIDIA BF16：小模型 kernel fusion / L2 缓存
 */
function getDecodeWeightReadRatio(gpu, quant, model, framework) {
  const quantId = quant?.id ?? 'bf16'
  const isGgufQuant = ['int2', 'int3', 'int4', 'int5', 'int6'].includes(quantId)
  const chipId = gpu?.id ?? ''

  if (gpu?.vendor === 'apple') {
    const isM4M5 = /apple_m[45]/.test(chipId)
    if (isM4M5) {
      if (framework?.id === 'mlx') {
        if (/_(max|ultra)_/.test(chipId)) return isGgufQuant ? 0.52 : 0.70
        if (/_pro_/.test(chipId)) return isGgufQuant ? 0.44 : 0.66
        return isGgufQuant ? 0.62 : 0.68
      }
      if (/_(max|ultra)_/.test(chipId)) return isGgufQuant ? 0.60 : 0.78
      if (/_pro_/.test(chipId)) return isGgufQuant ? 0.52 : 0.72
      return isGgufQuant ? 0.70 : 0.78
    }
    return isGgufQuant ? 0.84 : 0.88
  }

  if (quantId === 'bf16' || quantId === 'fp32') {
    const params = model?.params ?? 8
    if (params < 15) return 0.34
    if (params < 30) return 0.55
    return 0.82
  }

  if (isGgufQuant) return 0.96
  return 1.0
}

/** Apple 代际 decode 有效带宽缩放（M2/M3 Max 实测低于理论带宽上限） */
function getAppleDecodeBwScale(gpu) {
  if (gpu?.vendor !== 'apple') return 1.0
  if (gpu.decodeBwScale != null) return gpu.decodeBwScale
  const id = gpu.id ?? ''
  if (/apple_m[45]/.test(id)) return 1.0
  if (/apple_m3/.test(id)) return 0.76
  if (/apple_m2/.test(id)) return 0.58
  if (/apple_m1/.test(id)) return 1.12
  return 1.0
}

/** Continuous batching 高 batch 调度效率衰减（batch>8 后显著） */
function getBatchSchedulingEfficiency(batch, framework) {
  if ((framework?.schedulingMode ?? 'continuous') !== 'continuous') return 1.0
  if (batch <= 8) return 1.0
  return 1 / (1 + (batch - 8) * 0.048)
}

/** Apple TTFT 修正：Metal prefill 效率低于 Roofline 估算 */
function getAppleTtftScale(gpu) {
  if (gpu?.vendor !== 'apple') return 1.0
  return /apple_m[45]/.test(gpu.id ?? '') ? 1.28 : 1.12
}

function getDecodeFactors({ framework }) {
  return {
    mid: framework.decode,
    min: framework.decodeMin ?? framework.decode,
    max: framework.decodeMax ?? framework.decode,
  }
}

// MoE expert dispatch 额外延迟，覆盖 Apple Metal 与 CUDA
// 与 modelSizeScaling 互补：modelSizeScaling 处理 dense 部分的效率，此处处理 MoE 特有的碎片化 dispatch
function getMoeExtraDecodeMs({ gpu, framework, model, batch }) {
  if (model?.type !== 'moe') return 0

  const activeExperts = model.experts_per_token ?? 1
  const totalExperts = model.experts ?? activeExperts
  if (totalExperts <= 1) return 0

  // 按 vendor 选择 dispatch 延迟基准值
  const dispatchUsBase = gpu?.vendor === 'apple'
    ? framework.appleMoeDispatchUs
    : framework.cudaMoeDispatchUs
  if (dispatchUsBase == null) return 0

  const executionMode = model.moe_execution ?? (activeExperts <= 1 ? 'top1_routed' : 'routed')
  const executionScaleMap = {
    top1_routed: 0.20,
    routed: 0.55,
    shared_routed: 0.70,
    parallel_dense_routed: 1.00,
  }
  const executionScale = executionScaleMap[executionMode] ?? 0.55
  const batchScale = 1 / Math.sqrt(Math.max(1, batch))

  // MLX 原生 MoE kernel 碎片化远小于 GGML Metal
  const moeDispatchScale = framework?.id === 'mlx' ? 0.20
    : (gpu?.vendor === 'apple' ? 0.45 : 1.0)

  // top-1 routing（如 Llama 4 Scout）存在显著固定 gate/dispatch 开销，
  // 不应被 fanoutScale 和 activeFragments 稀释。
  if (activeExperts <= 1) {
    const top1FixedUsPerLayer = 450
    const bwScale = Math.max(1.0, Math.sqrt(600 / (gpu.bw ?? 600)))
    return ((model.layers ?? 1) * top1FixedUsPerLayer * batchScale * bwScale * moeDispatchScale) / 1000
  }

  const fanoutScale = Math.sqrt(Math.max(1, totalExperts / 128))
  const activeFragmentCount = activeExperts - 1
  const bwScale = Math.max(1.0, Math.sqrt(600 / (gpu.bw ?? 600)))

  const extraUs =
    (model.layers ?? 1) *
    activeFragmentCount *
    dispatchUsBase *
    executionScale *
    fanoutScale *
    batchScale *
    bwScale *
    moeDispatchScale

  return extraUs / 1000
}

function getFlashAttentionBoostRange({ enabled, promptLen, headDim = 128 }) {
  if (!enabled) return { min: 1, mid: 1, max: 1 }

  // Flash Attention 加速比 ∝ head_dim（每计算块节省的 HBM IO ∝ head_dim）
  // 基于 head_dim=128 的基准值，线性缩放，范围限制在 [0.5, 2.0] 内
  const hdScale = Math.min(2.0, Math.max(0.5, headDim / 128))

  // 连续 log 线性插值：在 [2048, 65536] 区间内平滑过渡，消除档位边界跳变
  // logScale = 0 @ promptLen=2048，logScale = 1 @ promptLen=65536
  // < 2048 时 logScale = 0（取下界值），> 65536 时 logScale = 1（取上界值）
  const logScale = Math.min(1, Math.max(0,
    Math.log2(Math.max(2048, promptLen) / 2048) / Math.log2(65536 / 2048)
  ))
  const base = {
    min: 1.2 + (3.0 - 1.2) * logScale,
    mid: 1.3 + (4.0 - 1.3) * logScale,
    max: 1.5 + (5.0 - 1.5) * logScale,
  }

  return {
    min: Math.max(1, base.min * hdScale),
    mid: Math.max(1, base.mid * hdScale),
    max: Math.max(1, base.max * hdScale),
  }
}

/**
 * 生成警告列表
 */
export function getWarnings(result, t) {
  const warnings = []
  const {
    vramOk,
    vramPct,
    totalNeeded,
    totalVram,
    tpEfficiency,
    singleToks,
    singleToksMin,
    roofline,
    totalPower,
    activationGB,
    cpuRamNeededGB,
    sysRam,
    gpuVendor,
    gpuBw,
    modelParams,
    modelType,
    modelExpertsPerToken,
  } = result

  if (!vramOk) {
    warnings.push({
      level: 'error',
      key: 'vram_oom',
      diff: (totalNeeded - totalVram).toFixed(1),
    })
  } else if (vramPct > 95) {
    warnings.push({ level: 'warn', key: 'vram_high' })
  }

  if (activationGB > 2) {
    warnings.push({ level: 'info', key: 'activation_high', gb: activationGB.toFixed(1) })
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

  if (sysRam != null && cpuRamNeededGB > 0 && cpuRamNeededGB > sysRam) {
    warnings.push({
      level: 'error',
      key: 'cpu_ram_oom',
      diff: (cpuRamNeededGB - sysRam).toFixed(1),
      needed: cpuRamNeededGB.toFixed(1),
    })
  }

  if (gpuVendor === 'apple' && modelParams < 15) {
    warnings.push({ level: 'info', key: 'apple_small_model_accuracy' })
  }

  if (gpuVendor === 'apple' && modelType === 'moe' && gpuBw < 580) {
    warnings.push({ level: 'info', key: 'apple_moe_midrange_accuracy' })
  }

  if (modelType === 'moe' && modelExpertsPerToken === 1) {
    warnings.push({ level: 'info', key: 'top1_moe_accuracy' })
  }

  return warnings
}

/**
 * Batch sweep 曲线：固定配置下，扫描 batch 1→256 的吞吐/延迟
 *
 * @param {object} params  - 与 calcAll 相同的参数对象，其中 batch 字段会被覆盖
 * @param {number[]} [batches] - 要扫描的 batch 值数组，默认 [1,2,4,8,16,32,64,128,256]
 * @returns {Array<{batch:number, decodeToks:number, effectiveToks:number, tpot:number, ttft:number, vramOk:boolean, ppBubbleEff:number}>}
 */
export function calcBatchSweep(params, batches = [1, 2, 4, 8, 16, 32, 64, 128, 256]) { // keep in sync with BATCH_OPTIONS in RunConfig.vue
  return batches.map(b => {
    try {
      const r = calcAll({ ...params, batch: b })
      return {
        batch: b,
        decodeToks:    r.decodeToks,
        effectiveToks: r.effectiveToks,
        singleToks:    r.singleToks,
        tpot:          r.tpot,
        ttft:          r.ttft,
        totalLatency:  r.totalLatency,
        vramOk:        r.vramOk,
        ppBubbleEff:   r.ppBubbleEff,
        bottleneck:    r.bottleneck,
      }
    } catch {
      return { batch: b, error: true }
    }
  })
}

/**
 * 聚合多卡配置为 calcAll 所需的单一 gpu 对象
 * 单卡时直接返回原对象；多卡时线性叠加带宽/算力，VRAM 取短板
 *
 * @param {Array<{gpu: object, count: number}>} slots
 */
export function aggregateGpuSlots(slots) {
  if (!slots || slots.length === 0) return null
  if (slots.length === 1) return slots[0].gpu

  const totalCount = slots.reduce((s, g) => s + g.count, 0)

  // 聚合后的对象代表"等效单卡"，配合 gpuCount=totalCount 传入 calcAll
  // calcAll 内部会再 × gpuCount，所以这里存的是单卡等效值
  // bw：各卡实际带宽（已乘 bwUtilization）之和 ÷ totalCount = 等效单卡带宽
  // 然后 calcAll 里 totalBw = bw * gpuCount * bwUtilization(=1.0) 还原回总带宽
  const totalBw   = slots.reduce((s, g) => s + g.gpu.bw * g.count * (g.gpu.bwUtilization ?? 0.80), 0)
  const totalBf16 = slots.reduce((s, g) => s + (g.gpu.bf16 ?? 0) * g.count, 0)
  const totalInt8 = slots.reduce((s, g) => s + (g.gpu.int8 ?? g.gpu.bf16 ?? 0) * g.count, 0)
  const totalInt4 = slots.reduce((s, g) => s + (g.gpu.int4 ?? g.gpu.bf16 ?? 0) * g.count, 0)
  const totalTdp  = slots.reduce((s, g) => s + g.gpu.tdp * g.count, 0)

  return {
    // VRAM：TP 下每卡存等量权重，短板决定上限（单卡值，calcAll 会 × gpuCount）
    vram: Math.min(...slots.map(g => g.gpu.vram ?? 0)),
    // 等效单卡值 = 总值 ÷ totalCount，calcAll 内 × gpuCount 还原
    bw:   totalBw   / totalCount,
    bf16: totalBf16 / totalCount,
    int8: totalInt8 / totalCount,
    int4: totalInt4 / totalCount,
    tdp:  totalTdp  / totalCount,
    // bwUtilization 已内联到 bw 里，usableRatio 保持 1.0（vram 已是单卡最小值）
    bwUtilization: 1.0,
    usableRatio:   1.0,
    // 混合卡不保证 NVLink
    nvlink_bw: null,
    // 展示字段取主卡
    vendor: slots[0].gpu.vendor,
    tier:   slots[0].gpu.tier,
    id:     'mixed',
    name:   slots.map(g => `${g.gpu.name} ×${g.count}`).join(' + '),
  }
}

