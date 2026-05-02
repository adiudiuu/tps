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
  cpuOffload = false, pcieBw = null,
  pureCpu = false, cpuMemBw = null,
  nglCount = null,
  speculativeDecoding = false, acceptanceRate = 0.7, draftLen = 4, draftModelParams = null,
  ppCount = 1,
  epCount = 1,
  imageCount = 0,
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
  // EP（Expert Parallelism）预计算
  // ─────────────────────────────────────────────
  // EP 仅对 MoE 模型有效，epCount > 1 时启用
  // 每卡只存 1/epCount 的 expert 权重，非 expert 权重（attention/embed/norm）每卡完整保留
  //
  // 推导非 expert 参数量（non_expert_params）：
  //   non_expert_params = (params × experts_per_token - experts × active_params)
  //                       / (experts_per_token - experts)
  //   （与 CPU Offload 路径相同的代数推导）
  // 每卡 expert 权重 = (active_params - non_expert_params) / epCount × experts
  //   注意：active_params 里的 expert 部分 = active_params - non_expert_params
  //         每卡存 experts/epCount 个 expert，每个 expert 的参数量 = expert_params / experts
  //         所以每卡 expert 权重 = (active_params - non_expert_params) / epCount
  //         （等价于总 expert 权重 / epCount）
  const isEP = epCount > 1 && model.type === 'moe' && model.experts && model.experts_per_token
  let epWeightGB = null  // EP 模式下每卡实际权重（GB）
  let nonExpertParams = null
  if (isEP) {
    const denom = model.experts_per_token - model.experts
    if (denom !== 0) {
      nonExpertParams = (model.params * model.experts_per_token - model.experts * model.active_params) / denom
    } else {
      // experts_per_token === experts（top-all）：无 expert 分离，EP 退化为 TP
      nonExpertParams = model.active_params
    }
    nonExpertParams = Math.max(0, nonExpertParams)
    // 总 expert 参数量（所有 expert 的 FFN 权重之和）
    const totalExpertParams = model.params - nonExpertParams
    // 每卡 expert 权重 = 总 expert 权重 / epCount
    const expertParamsPerCard = totalExpertParams / epCount
    // 每卡权重 = 非 expert（完整）+ 本卡 expert 分片
    epWeightGB = (nonExpertParams + expertParamsPerCard) * quant.bytes
  }

  // ─────────────────────────────────────────────
  // 显存计算
  // ─────────────────────────────────────────────

  // 权重显存：总参数 × 每参数字节数
  // EP 模式：每卡只存 1/epCount 的 expert + 完整非 expert 权重
  // MoE CPU Offload：expert 权重卸载到 CPU RAM，GPU 只需保留当前激活的 expert 块 + 非 MoE dense 层
  // 估算：active_params × quant.bytes × 1.5
  //   active_params × quant.bytes ≈ 当前激活 expert 权重
  //   × 1.5 覆盖 attention / embedding / normalization 等始终驻留 GPU 的非 MoE 层
  const weightGB = isEP
    ? epWeightGB
    : (cpuOffload && model.type === 'moe' && framework?.id !== 'llamacpp')
      ? model.active_params * quant.bytes * 1.5
      : model.params * quant.bytes
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
  // llama.cpp 混合推理：GPU 只持有前 nglCount 层的权重和 KV Cache
  const isLlamaCppHybrid = cpuOffload && framework?.id === 'llamacpp'
  const _effectiveNgl = isLlamaCppHybrid ? (nglCount ?? Math.floor(model.layers / 2)) : model.layers
  const gpuLayerRatio = isLlamaCppHybrid ? Math.min(1, Math.max(0, _effectiveNgl / Math.max(model.layers, 1))) : 1.0
  // PP：每个 pipeline stage 只持有 1/ppCount 的权重和 KV Cache
  // totalVram 是单个 PP stage（一个 TP 组）的可用显存
  const totalNeeded = weightGB * gpuLayerRatio / ppCount + kvGB * gpuLayerRatio / ppCount + overheadGB

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
  const activeWeight = isEP
    ? epWeightGB  // EP 下每卡只读自己那份权重
    : model.type === 'moe'
      ? model.active_params * quant.bytes
      : weightGB

  const decodeFactorMin = adjustedFramework.decodeMin ?? adjustedFramework.decode
  const decodeFactorMax = adjustedFramework.decodeMax ?? adjustedFramework.decode
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
    let expertIOPerStep
    if (model.experts && model.experts_per_token) {
      // 有字段时精确计算：代数推导非专家参数量
      // non_expert_total = (params × experts_per_token - experts × active_params) / (experts_per_token - experts)
      // 前提：experts_per_token < experts（正常 MoE 路由，每 token 只激活部分专家）
      // 边界：experts_per_token === experts 时分母为零（top-all 或数据异常），回退到 70% 估算
      const denom = model.experts_per_token - model.experts
      if (denom !== 0) {
        const non_expert_total = (model.params * model.experts_per_token - model.experts * model.active_params) / denom
        const active_expert_params = model.active_params - non_expert_total
        // active_expert_params 理论上应 > 0；若算出负值说明数据异常，同样回退
        expertIOPerStep = active_expert_params > 0
          ? active_expert_params * quant.bytes
          : model.active_params * 0.70 * quant.bytes
      } else {
        // experts_per_token === experts：所有专家都激活，等同于 dense 层，无 expert IO 分离
        expertIOPerStep = model.active_params * 0.70 * quant.bytes
      }
    } else {
      // 无字段时：expert FFN 约占 active_params 的 70%
      expertIOPerStep = model.active_params * 0.70 * quant.bytes
    }
    const nonExpertIOPerStep = model.active_params * quant.bytes - expertIOPerStep
    const gpuIOPerStep = nonExpertIOPerStep + kvReadGB
    // pcieBw.bw = PCIe x16 单向理论峰值（见 runtime.js）
    // 台式机 GPU 通常走 x8 插槽（如 RTX 4060），实际单向带宽 = bw / 2
    const pcieBwUnidirectional = pcieBw.bw / 2
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
      const draftWeightGB = draftModelParams * quant.bytes
      const totalIOPerVerifyStep = decodeBytesPerStep + draftWeightGB * draftLen
      bwLimit = (effectiveBw / (totalIOPerVerifyStep / ppCount)) * batch * ppBubbleEff
    }
  }

  // decodeToks 在 bwLimit 最终确定后统一计算
  let decodeToks = bwLimit * adjustedFramework.decode * speculativeSpeedup
  let decodeToksMin = bwLimit * decodeFactorMin * speculativeSpeedup
  let decodeToksMax = bwLimit * decodeFactorMax * speculativeSpeedup

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
  const ttft = (effectivePromptLen * prefillAttentionFactor * 2 * activeParams * 1e9) / (tflops * 1e12) * 1000 / (flashFactor * framework.prefill) * (isContinuousBatching ? 1 : Math.max(1, batch))

  // 单 token 生成时间（ms），batch=1 时的延迟基准
  // offload 模式：bwLimit 已包含串行 IO，从 bwLimit 反推 tpot 保持一致
  // PP 模式：batch / bwLimit 已包含 ppCount 和 ppBubbleEff，反推出每请求 tpot
  // 再叠加 PP 阶段间 P2P 通信延迟 ppP2pMs
  const tpotBase = (pureCpu && cpuMemBw != null)
    ? (decodeBytesPerStep / effectiveBw) * 1000 / framework.decode  // ms/tok，纯 DDR 带宽
    : (isLlamaCppHybrid && cpuMemBw != null)
      ? (batch / bwLimit) * 1000 / framework.decode
      : (cpuOffload && model.type === 'moe' && pcieBw != null)
        ? (batch / bwLimit) * 1000 / framework.decode
        : (decodeBytesPerStep / ppCount / effectiveBw / ppBubbleEff) * 1000 / framework.decode
  const tpot = tpotBase + ppP2pMs

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
    const physicalTimePerLayer = (decodeBytesPerStep / ppCount) / totalBw / moeLayerCount * 1000

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
    pureCpu,
    cpuMemBwLabel: (pureCpu && cpuMemBw) ? cpuMemBw.label : null,
    speculativeDecoding,
    speculativeSpeedup,
    acceptanceRate,
    draftLen,
    ppCount,
    ppBubbleEff,
    ppP2pMs,
    imageCount,
    visionPatchTokens,
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

function getFlashAttentionBoostRange({ enabled, promptLen, headDim = 128 }) {
  if (!enabled) return { min: 1, mid: 1, max: 1 }

  // Flash Attention 加速比 ∝ head_dim（每计算块节省的 HBM IO ∝ head_dim）
  // 基于 head_dim=128 的基准值，线性缩放，范围限制在 [0.5, 2.0] 内
  const hdScale = Math.min(2.0, Math.max(0.5, headDim / 128))

  let base
  if (promptLen >= 32768) base = { min: 3, mid: 4, max: 5 }  // 序列越长，HBM IO 节省越显著
  else if (promptLen >= 8192)  base = { min: 2, mid: 2.5, max: 3 }
  else if (promptLen >= 2048)  base = { min: 1.5, mid: 1.75, max: 2 }
  else return { min: 1.1, mid: 1.3, max: 1.8 }  // < 2048 tokens，FA2 paper 实测 seq=1024 仍有 1.5-2x 加速

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
  const { vramOk, vramPct, totalNeeded, totalVram, tpEfficiency, singleToks, singleToksMin, roofline, totalPower, activationGB } = result

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

