// src/utils/calc.js
import { getAttentionSummary, getAttentionType, getTotalHeads } from './model.js'
import { applySpeedCalibration, attachRoofToks } from './calibrate.js'

/**
 * 核心计算函数，无副作用
 *
 * 关键设计决策：
 * - KV Cache 精度独立于权重量化（kv_bytes），INT4 权重的 KV Cache 通常仍是 FP16
 * - MoE 模型 prefill 用 active_params 计算 FLOPs，而非总参数
 * - 多卡：gpuCount 是物理卡数，tp×ep×dp×pp = gpuCount（默认 tp=n, ep=1, dp=1）
 * - EP：每卡只存部分 expert，需要 all-to-all；不要再按 TP=gpuCount 叠乘
 *
 * @param {object} params
 * @param {object} params.gpu          - GPU 对象
 * @param {number} params.gpuCount     - 物理 GPU 数量
 * @param {object} params.interconnect - 互联方式对象
 * @param {object} params.model        - 模型对象
 * @param {object} params.quant        - 量化精度对象
 * @param {number} params.ctx          - 上下文长度（tokens）
 * @param {number} params.batch        - 并发请求数
 * @param {number} params.promptLen    - Prompt 长度（tokens）
 * @param {number} params.outputLen    - 输出长度（tokens）
 * @param {object} params.framework    - 推理框架对象
 * @param {number} [params.epCount]    - Expert Parallelism 度（仅 MoE，默认 1）
 * @param {number} [params.dpCount]    - Data Parallelism 度（默认 1，无单独滑条）
 * @param {boolean} [params.skipCalibration] - 跳过残差校准层（拟合脚本用）
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
  dpCount = 1,
  imageCount = 0,
  skipCalibration = false,
}) {
  // Dense / 无 experts：强制 EP=1，按 TP=gpuCount/PP 布局（与 RunConfig.epSupported 一致）
  const layout = resolveParallelLayout({
    gpuCount,
    ppCount,
    epCount: effectiveEpCount(model, epCount),
    dpCount,
  })
  const totalGpus = layout.totalGpus
  const tpCount = layout.tpCount
  epCount = layout.epCount
  dpCount = layout.dpCount
  ppCount = layout.ppCount

  const replicaGpus = tpCount * epCount * ppCount
  const totalVram = gpu.vram * totalGpus * (gpu.usableRatio ?? 1.0)
  const singleCardBw = gpu.bw * (gpu.bwUtilization ?? 0.80) * getAppleDecodeBwScale(gpu)
  const totalBw   = singleCardBw * replicaGpus
  const quantBytes = getQuantBytes(quant, gpu, framework)
  const actBytes = getActBytes(quant)
  const gpuTflops = getPrefillTflops(gpu, quant, framework, model)
  const tflops    = gpuTflops * replicaGpus
  const attentionType = getAttentionType(model)
  const attentionSummary = getAttentionSummary(model)
  const totalHeads = getTotalHeads(model) ?? model.kv_heads ?? 1
  const prefixHitRatio = Math.min(0.99, Math.max(0, Number(prefixCacheHit || 0) / 100))
  const effectivePromptLen = Math.max(1, Math.round(promptLen * (1 - prefixHitRatio)))
  const visionPatchTokens = (model.vision_seq_tokens && imageCount > 0)
    ? model.vision_seq_tokens * imageCount
    : 0
  const visionWeightParams = getVisionWeightParams(model)
  // decode 每步读取长度 = 文本前缀均值 + vision patch 前缀（图像不占用 sliding 窗外的增量）
  const textDecodeSeqLen = Math.max(1, Math.min(ctx, promptLen + Math.round(outputLen / 2)))
  const avgDecodeSeqLen = textDecodeSeqLen + visionPatchTokens

  // 框架效率按模型规模动态调整（CUDA llama.cpp 等；Apple 走独立校准路径）
  let adjustedFramework = framework
  if (framework.modelSizeScaling && Array.isArray(framework.modelSizeScaling) && gpu.vendor !== 'apple') {
    const params = model.params
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
  // NVIDIA + llama.cpp：
  // - GDDR 8–14B Q4：消费卡 mmq 高于通用 0.52（锚点 4090 Llama 8B Q4 tg1024≈128）
  // - GDDR 8–14B BF16：无 dequant，略高于 Q4（锚点 4090 Llama 8B F16 tg1024≈54）
  // - HBM（A100/H100 类，bw≥1500 的 datacenter）：吃不满消费卡那套带宽利用率
  //   （XiongjieDai H100 PCIe 8B Q4 tg1024≈144，不是 0.76×HBM）
  // - <3B：小 GEMM（LocalScore 1B）；HBM 上更空
  if (gpu.vendor === 'nvidia' && framework.id === 'llamacpp') {
    const hbm = isNvidiaHbm(gpu)
    const quantId = quant?.id ?? 'bf16'
    const isFp16Family = quantId === 'bf16' || quantId === 'fp32'
    if (model.params < 3) {
      const d = hbm ? 0.15 : 0.40
      adjustedFramework = {
        ...adjustedFramework,
        decode: d,
        decodeMin: d * 0.90,
        decodeMax: d * 1.10,
      }
    } else if (model.params < 15) {
      const d = hbm ? 0.40 : (isFp16Family ? 0.88 : Math.max(adjustedFramework.decode, 0.76))
      adjustedFramework = {
        ...adjustedFramework,
        decode: d,
        decodeMin: d * 0.92,
        decodeMax: d * 1.10,
      }
    }
  }
  // vLLM dense GPTQ/AWQ INT4：unpack 开销，不要沿用 BF16/FP8 的 0.65
  // 锚点：Qwen 官方 A100 Qwen2.5-7B/14B GPTQ-Int4 batch=1（勿碰 MoE FP8 饱和）
  if (
    gpu.vendor === 'nvidia'
    && framework.id === 'vllm'
    && model.type !== 'moe'
    && (quant?.id === 'int4' || quant?.id === 'int3' || quant?.id === 'int2')
  ) {
    adjustedFramework = {
      ...adjustedFramework,
      decode: 0.36,
      decodeMin: 0.32,
      decodeMax: 0.40,
    }
  }
  adjustedFramework = applyAppleFrameworkAdjustments(gpu, framework, adjustedFramework)
  // MoE CUDA：dense 的 vLLM 0.65 等 Llama 锚点保持不动，只在 MoE 上乘独立 kernel 效率
  // Apple 已用 appleMoeDispatchUs + overfetch 标定，不要套 CUDA moeKernelEff
  // grouped GEMM：小 batch 专家矩阵偏空，大 batch 接近 dense（见 getCudaMoeKernelEff）
  if (model.type === 'moe' && gpu.vendor !== 'apple' && adjustedFramework.moeKernelEff != null) {
    const k = getCudaMoeKernelEff(adjustedFramework.moeKernelEff, batch, model)
    adjustedFramework = {
      ...adjustedFramework,
      decode: adjustedFramework.decode * k,
      decodeMin: (adjustedFramework.decodeMin ?? adjustedFramework.decode) * k,
      decodeMax: (adjustedFramework.decodeMax ?? adjustedFramework.decode) * k,
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

  // EP：epCount > 1 且 nonExpertParams 可计算。权重按 tp×ep 分片，不再把 gpuCount 当第二层 TP
  const isEP = epCount > 1 && model.type === 'moe' && nonExpertParams != null
  const visionWeightGB = visionWeightParams * quantBytes
  let epWeightGB = null
  if (isEP) {
    const totalExpertParams = model.params - nonExpertParams
    epWeightGB = (nonExpertParams / tpCount + totalExpertParams / (epCount * tpCount)) * quantBytes
  }

  // ─────────────────────────────────────────────
  // 显存计算
  // ─────────────────────────────────────────────

  // 权重显存：总参数 × 每参数字节数
  // EP 模式：每卡只存 1/epCount 的 expert + 完整非 expert 权重
  // MoE CPU Offload：expert 权重卸载到 CPU RAM，GPU 只需保留 non-expert dense 层
  const targetWeightGB = (isEP
    ? epWeightGB
    : (cpuOffload && model.type === 'moe')
      ? (nonExpertParams != null
          ? nonExpertParams * quantBytes
          : model.active_params * 0.20 * quantBytes)  // 无 experts 字段时按 active 的 20% 估算 non-expert
      : model.params * quantBytes) + visionWeightGB
  // Speculative Decoding：draft 模型常驻显存（与权重同 quantBytes；未指定规模时按主模型激活参数 10%）
  // 不并入 targetWeightGB，避免 MoE offload / decode activeWeight 重复或口径错乱
  let draftParams = 0
  let draftWeightGB = 0
  if (speculativeDecoding) {
    draftParams = (draftModelParams != null && draftModelParams > 0)
      ? draftModelParams
      : (model.type === 'moe'
          ? (model.active_params ?? model.params)
          : model.params) * 0.10
    draftWeightGB = draftParams * quantBytes
  }
  const weightGB = targetWeightGB + draftWeightGB

  // KV Cache 显存：精度独立于权重量化，通常为 FP16（2 bytes）
  // 混合注意力：global 全上下文；sliding 只计窗口；线性层（GatedDeltaNet 等）KV 归零
  // linear_attention_layers 与 local_layers+sliding_window===0 同等处理（Qwen3.5 仅有前者）
  const kvBytesPerElem = getKvBytesPerElem(kvCacheQuant)
  const kvParts = getKvLayerParts(model)
  const kvScale = { mlaRatio: model.mla_ratio, mambaRatio: model.mamba_ratio }
  let kvGB = kvFootprintGB({
    parts: kvParts,
    globalSeq: ctx,
    slidingSeq: ctx,
    batch,
    kvBytesPerElem,
    ...kvScale,
  })
  // vision patch 前缀：与文本同一套层数 / GQA / MLA 逻辑；滑动窗已按 window 计满，不再加 vision
  if (visionPatchTokens > 0) {
    kvGB += kvFootprintGB({
      parts: kvParts,
      globalSeq: visionPatchTokens,
      slidingSeq: 0,
      batch,
      kvBytesPerElem,
      ...kvScale,
    })
  }

  // 系统开销（CUDA context、激活值、临时 buffer 等）
  // 基础部分：小模型固定 1GB，大模型按权重 3% 计算，上限 5GB
  // 激活值部分：纯推理不保留中间层激活，峰值仅为当前层，但需区分两个阶段：
  //   decode  ：每步每请求只算 1 token → batch 个 token
  //   prefill ：一次前向处理多个 token；主流框架启用 chunked prefill，
  //             单批 token 数受 max_num_batched_tokens（llama.cpp 为 n_batch）约束
  //   单 token 估算：hidden_size × 4（FFN 中间层约 4× hidden）× 2 bytes（BF16）× 4（安全系数）
  // token 数上限即"单次前向的最大 token 数"，由调度模式决定，因此无需再额外硬顶容量：
  //   continuous batching（vLLM/SGLang/TRT-LLM/TGI）：max_num_batched_tokens 默认量级 8192
  //   serial（llama.cpp/MLX）：请求串行，受 n_batch 默认 2048 约束
  const isContinuousBatching = (framework?.schedulingMode ?? 'continuous') === 'continuous'
  const maxFwdTokens = isContinuousBatching ? 8192 : 2048
  const actTokens = Math.max(batch, Math.min(batch * effectivePromptLen, maxFwdTokens))
  const activationGB = actTokens * (model.hidden_size ?? 4096) * 4 * actBytes / 1e9 * 4
  const overheadGB  = Math.max(1.0, Math.min(targetWeightGB * 0.03, 5.0)) + activationGB
  // Dense + llamacpp + offload → NGL 分层，DDR 带宽
  // MoE 不走 NGL 分层（expert 通过 PCIe 卸载，见 decode 带宽路径）
  const isLlamaCppHybrid = cpuOffload && framework?.id === 'llamacpp' && model.type !== 'moe'
  const _effectiveNgl = isLlamaCppHybrid ? (nglCount ?? Math.floor(model.layers / 2)) : model.layers
  const gpuLayerRatio = isLlamaCppHybrid ? Math.min(1, Math.max(0, _effectiveNgl / Math.max(model.layers, 1))) : 1.0
  // PP：每个 pipeline stage 只持有 1/ppCount 的权重和 KV Cache
  // totalVram 是单个 PP stage（一个 TP 组）的可用显存
  // draft 常驻显存已并入 weightGB；speculative 框架下 gpuLayerRatio 恒为 1
  const totalNeeded = weightGB * gpuLayerRatio / ppCount + kvGB * gpuLayerRatio / ppCount + overheadGB

  // CPU RAM 需求（仅在涉及 CPU 内存的模式下有效）
  // pureCpu: 全部权重 + KV Cache 都在 DDR
  // llamacpp 混合: CPU 层权重 + 对应比例 KV Cache 在 DDR
  // MoE CPU Offload: expert 权重放 CPU RAM，non-expert + KV Cache 在 GPU HBM
  const cpuRamNeededGB = (() => {
    if (pureCpu) return weightGB + kvGB + overheadGB
    if (isLlamaCppHybrid) return (1 - gpuLayerRatio) * (model.params * quantBytes + kvGB)
    if (cpuOffload && model.type === 'moe') {  // 去掉 !== 'llamacpp'，MoE offload 统一计算
      // vision encoder 常驻 GPU，不从 params 里扣到 CPU
      return Math.max(0, model.params * quantBytes - (targetWeightGB - visionWeightGB))
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
  const activeWeightRaw = (isEP
    ? (() => {
        const activeExpert = Math.max(0, (model.active_params ?? model.params) - (nonExpertParams ?? 0))
        return (nonExpertParams / tpCount + activeExpert / (epCount * tpCount)) * quantBytes
      })()
    : model.type === 'moe'
      ? model.active_params * quantBytes
      : (targetWeightGB - visionWeightGB)) + visionWeightGB
  const decodeWeightReadRatio = (() => {
    let ratio = getDecodeWeightReadRatio(gpu, quant, model, framework)
    // Apple MoE：expert gather/scatter 会 overfetch；按 top-k 缩放（Mixtral k=2 远轻于 Qwen A3B k=8）
    // 锚点：mlx#3209 Mixtral Q4≈68 @ M3 Ultra；Ante Qwen3.5-35B-A3B MLX≈110–130 @ M4 Max
    // 允许 ratio>1；旧固定 ×1.80 会把 Mixtral 压到带宽锚点的 ~一半，且 Metal 未 overfetch 会反倒 MLX
    if (gpu.vendor === 'apple' && model.type === 'moe') {
      const k = Math.max(1, model.experts_per_token ?? 2)
      if (framework?.id === 'mlx') {
        // k=2 Mixtral→≈1.07（对齐 mlx#3209≈68）；k=8 Qwen A3B→≈1.46（Ante≈110–130，偏保守）
        const overfetch = Math.min(1.55, 1.0 + 0.065 * Math.max(0, k - 1))
        ratio = Math.min(1.75, ratio * overfetch)
      } else if (framework?.id === 'llamacpp_metal') {
        const overfetch = Math.min(1.45, 1.05 + 0.05 * Math.max(0, k - 1))
        ratio = Math.min(1.60, ratio * overfetch)
      }
    }
    return ratio
  })()
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
  let kvReadGB = kvFootprintGB({
    parts: kvParts,
    globalSeq: Math.min(textDecodeSeqLen, ctx),
    slidingSeq: textDecodeSeqLen,
    batch,
    kvBytesPerElem,
    ...kvScale,
  })
  if (visionPatchTokens > 0) {
    kvReadGB += kvFootprintGB({
      parts: kvParts,
      globalSeq: visionPatchTokens,
      slidingSeq: 0,
      batch,
      kvBytesPerElem,
      ...kvScale,
    })
  }

  // Speculative Decoding 加速：每步尝试验证 draftLen 个 token，接受率为 acceptanceRate
  // 期望接受 token 数：mean_accepted = (1 - α^(γ+1)) / (1 - α)，其中 α=acceptanceRate，γ=draftLen
  // 例：α=0.7, γ=4 → mean_accepted ≈ 2.83
  // draft 权重量已在上方计入 weightGB；此处将 draft IO 并入 decodeBytesPerStep，
  //   使 bwLimit / tpot / 吞吐三者口径一致
  let speculativeSpeedup = 1.0
  let draftIOPerStep = 0
  if (speculativeDecoding && acceptanceRate > 0 && draftLen > 0) {
    // 期望每步接受的 token 数（含 target model 强制接受的最后一个 token）
    const alpha = Math.min(0.999, acceptanceRate)
    speculativeSpeedup = (1 - Math.pow(alpha, draftLen + 1)) / (1 - alpha)  // ≤ draftLen + 1
    if (draftParams > 0) {
      draftIOPerStep = draftParams * quantBytes * decodeWeightReadRatio * draftLen
    }
  }

  const decodeBytesCluster = isEP
    ? activeWeight * tpCount + kvReadGB + draftIOPerStep
    : activeWeight + kvReadGB + draftIOPerStep
  const decodeBytesPerCard = isEP
    ? activeWeight + kvReadGB / tpCount + draftIOPerStep / tpCount
    : decodeBytesCluster / tpCount
  const decodeBytesPerStep = decodeBytesCluster

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
    ? (ppCount - 1) * (model.hidden_size ?? 4096) * batch * actBytes / (interconnect.bw * 1e9) * 1000
    : 0

  let effectiveBw, bwLimit
  let hybridTGpu = 0
  let hybridTCpu = 0
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
    hybridTGpu = gpuLayerRatio > 0 ? gpuLayerRatio * decodeBytesPerStep / totalBw : 0
    hybridTCpu = (1 - gpuLayerRatio) > 0 ? (1 - gpuLayerRatio) * decodeBytesPerStep / cpuMemBw.bw : 0
    bwLimit = batch / Math.max(hybridTGpu + hybridTCpu, 1e-9)
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
    // draft model 常驻 HBM，与非专家权重、KV 一起计入 GPU 侧 IO
    const gpuIOPerStep = nonExpertIOPerStep + kvReadGB + draftIOPerStep
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
    // 统一按「每卡 IO / 单卡带宽」。dense TP 与旧公式 full/(N×bw) 等价；纯 EP 不再用集群带宽去除以每卡 IO
    bwLimit = (singleCardBw / (decodeBytesPerCard / ppCount)) * batch * ppBubbleEff
  }
  // bwLimit 保持为纯物理带宽上限（不含框架效率 / 调度效率），
  // 供 Roofline 对比与 offload 串行时序反推使用；
  // 框架系数、batch 调度效率、TP/EP 通信损耗统一在 tpot 链路上施加，避免重复折扣。

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
  const visionEncoderParams = model.vision_encoder_params ?? 0
  // params 已含 ViT 时，文本 prefill 始终扣掉 encoder；有图再把 ViT FLOPs 加回来，避免「加图反而更快」
  const tokenActiveParams = model.vision_encoder_in_params
    ? Math.max(0.01, activeParams - visionEncoderParams)
    : activeParams
  const visionPrefillFlops = (imageCount > 0 && visionEncoderParams > 0)
    ? 2 * visionEncoderParams * 1e9 * imageCount
    : 0

  const prefillAttentionFactor = getPrefillAttentionFactor({
    totalHeads,
    kvHeads:    model.kv_heads,
    headDim:    model.head_dim,
    layers:     model.layers,
    promptLen:  effectivePromptLen,
    activeParams: tokenActiveParams,
    linearAttnLayers,
  })

  const computeBaseLimit = (tflops * 1e12) / (2 * tokenActiveParams * 1e9)
  const computeLimit = (computeBaseLimit / prefillAttentionFactor) * flashFactor
  let prefillFactor = adjustedFramework.prefill
  let prefillLo = prefillFactorMin
  let prefillHi = prefillFactorMax
  // llama.cpp CUDA F16：无 unpack，消费卡 prompt eval 高于 Q4 的 0.35
  // 锚点：XiongjieDai 4090 Llama 8B F16 pp1024≈9056（Q4 pp 仍走 0.35 + mmq）
  if (
    gpu.vendor === 'nvidia'
    && framework.id === 'llamacpp'
    && (quant?.id === 'bf16' || quant?.id === 'fp32')
    && !isNvidiaHbm(gpu)
  ) {
    prefillFactor = 0.78
    prefillLo = 0.70
    prefillHi = 0.86
  }
  const prefillToks  = computeLimit * prefillFactor
  const prefillToksMin = (computeBaseLimit / prefillAttentionFactor) * prefillLo * scaledFlashRange.min
  const prefillToksMax = (computeBaseLimit / prefillAttentionFactor) * prefillHi * scaledFlashRange.max

  const textTtft = (effectivePromptLen * prefillAttentionFactor * 2 * tokenActiveParams * 1e9) / (tflops * 1e12) * 1000 / (flashFactor * prefillFactor) * (isContinuousBatching ? 1 : Math.max(1, batch)) * getAppleTtftScale(gpu)
  // 文本 prefill 用 replicaGpus（TP×EP×PP）叠算力；ViT 编码器通常不在 EP 各 rank / 各 PP stage 各算一份
  // 只按 TP 组内一份，避免多模态 TTFT 随 EP replica 系统性偏乐观
  const visionTflops = gpuTflops * tpCount
  const visionTtft = visionPrefillFlops > 0
    ? visionPrefillFlops / (visionTflops * 1e12) * 1000 / prefillFactor * getAppleTtftScale(gpu)
    : 0
  const ttft = textTtft + visionTtft

  // 单 token 生成时间（ms）基准：物理 IO 时间 + 框架效率系数
  // 此处只含物理带宽与框架系数；调度效率 / speculative / TP·EP 通信损耗在后面统一施加，
  // 保证 tpot 与 decodeToks / singleToks 始终可以互相换算（singleToks === 1000 / tpot）
  // offload 模式：bwLimit 为物理串行上限，从 bwLimit 反推 tpot 保持口径一致
  // PP 模式：batch / bwLimit 已包含 ppCount 和 ppBubbleEff，反推出每请求 tpot
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
    return (decodeBytesPerCard / ppCount / singleCardBw / ppBubbleEff) * 1000 / decodeFactor
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

  // 每 decode step 的串行墙钟时间（ms）：
  //   物理 IO 时间 + MoE dispatch 额外延迟 + PP 阶段间 P2P 传输
  // Apple / CUDA MoE 的 dispatch 开销是每 token 的串行时间，不是简单吞吐折扣。
  const stepMs    = tpotBase    + moeExtraDecodeMs + ppP2pMs
  const stepMsMin = tpotBaseMin + moeExtraDecodeMs + ppP2pMs
  const stepMsMax = tpotBaseMax + moeExtraDecodeMs + ppP2pMs

  // batch 调度效率：continuous batching 在高 batch 下的排队/调度损耗
  // speculative decoding：每步平均产出 speculativeSpeedup 个 token
  // 两者都折算成"每 token 有效时间"，使延迟与吞吐同源
  const batchSchedEff = getBatchSchedulingEfficiency(batch, adjustedFramework, model)
  const perTokenScale = Math.max(batchSchedEff * speculativeSpeedup, 1e-9)

  // TP/EP 通信损耗之前的每 token 时间（ms）
  const tpotPreComm    = stepMs    / perTokenScale
  const tpotPreCommMin = stepMsMin / perTokenScale
  const tpotPreCommMax = stepMsMax / perTokenScale

  // 通信损耗前的聚合吞吐（tok/s），与 tpotPreComm 严格互为倒数
  const decodeToks    = batch / Math.max(tpotPreComm    / 1000, 1e-12)
  const decodeToksMin = batch / Math.max(tpotPreCommMin / 1000, 1e-12)
  const decodeToksMax = batch / Math.max(tpotPreCommMax / 1000, 1e-12)

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
  // gpuCount 是物理卡数；只在 tpCount>1 时算 TP all-reduce，避免 8 卡 EP=8 再叠一层 TP=8
  // ─────────────────────────────────────────────
  // efficiency = t_compute / (t_compute + t_comm)
  // t_comm：ring all-reduce，LogP：α + β × message_size
  //   每层默认 2 次 all-reduce（attention + MLP）；message 用 actBytes（残差精度）
  //   α：NCCL 小消息节点内 ~8μs/hop，跨节点 IB ~25μs/hop（1μs 纯 NVLink hop 偏乐观）
  let tpEfficiency = 1.0
  const isGpuPath = !pureCpu && !isLlamaCppHybrid
  const tpArPerLayer = 2
  const ncclAlphaMs = (interconnect?.scope === 'inter') ? 0.025 : 0.008
  if (isGpuPath && tpCount > 1 && interconnect) {
    const commBytesPerLayer = tpArPerLayer * 2 * (model.hidden_size ?? 4096) * batch * actBytes * (tpCount - 1) / tpCount
    const commBwMs = commBytesPerLayer / (interconnect.bw * 1e9) * 1000
    const bytesPerAr = commBytesPerLayer / Math.max(1, tpArPerLayer)
    // 大消息 all-reduce 以带宽为主；8μs/hop 只适用于小消息（否则双卡 Mixtral 高 batch 被 α 钉死）
    const alphaScale = Math.min(1, 65536 / Math.max(bytesPerAr, 1))
    const alphaMs = ncclAlphaMs * 2 * (tpCount - 1) * tpArPerLayer * alphaScale
    const commLatencyPerLayer = commBwMs + alphaMs
    const physicalTimePerLayer = (decodeBytesPerCard / ppCount) / singleCardBw / (model.layers ?? 1) * 1000
    tpEfficiency = physicalTimePerLayer / (physicalTimePerLayer + commLatencyPerLayer)
    tpEfficiency = Math.min(1.0, Math.max(0.01, tpEfficiency))
  }

  // ─────────────────────────────────────────────
  // EP 通信效率（Expert Parallelism all-to-all）
  // ─────────────────────────────────────────────
  let epEfficiency = 1.0
  if (isEP && isGpuPath && interconnect) {
    const moeLayerCount = model.layers ?? 1
    const hiddenSize = model.hidden_size ?? 4096
    const expertsPerToken = model.experts_per_token ?? 1
    const a2aMsgBytes = batch * expertsPerToken * hiddenSize * actBytes / epCount
    const a2aBwMs = 2 * a2aMsgBytes / (interconnect.bw * 1e9) * 1000
    const a2aAlphaMs = 2 * ncclAlphaMs
    const epCommLatencyPerLayer = a2aBwMs + a2aAlphaMs
    const physicalTimePerLayer = (decodeBytesPerCard / ppCount) / singleCardBw / moeLayerCount * 1000
    epEfficiency = physicalTimePerLayer / (physicalTimePerLayer + epCommLatencyPerLayer)
    epEfficiency = Math.min(1.0, Math.max(0.01, epEfficiency))
  }

  // ─────────────────────────────────────────────
  // 综合结果
  // ─────────────────────────────────────────────
  // EP 和 TP 效率叠加：两者都会降低有效吞吐，同时等价地拉长每 token 时间
  const combinedEfficiency = tpEfficiency * epEfficiency
  const effectiveToks = decodeToks * combinedEfficiency
  const effectiveToksMin = decodeToksMin * combinedEfficiency
  const effectiveToksMax = decodeToksMax * combinedEfficiency
  const singleToks    = effectiveToks / batch
  const singleToksMin = effectiveToksMin / batch
  const singleToksMax = effectiveToksMax / batch

  // 对外暴露的 TPOT 与吞吐同源：tpot === 1000 / singleToks，
  // 因此调度效率、speculative、TP/EP 通信损耗都已反映在延迟里。
  const tpot = tpotPreComm / Math.max(combinedEfficiency, 1e-9)
  // 总延迟 = TTFT + 输出 token 数 × 单 token 时间
  const totalLatency  = ttft + outputLen * tpot  // ms

  const totalPower = gpu.tdp * totalGpus / 1000  // kW，物理卡数
  const tokPerJoule = totalPower > 0 ? effectiveToks / (totalPower * 1000) : null
  const accuracyTier = getAccuracyTier({
    gpu,
    model,
    framework: adjustedFramework,
    isEP,
    tpCount,
    quant,
  })

  const perCardVram = gpu.vram * (gpu.usableRatio ?? 1.0)
  const weightKvPerCard = (() => {
    if (isEP) {
      return (epWeightGB + draftWeightGB / tpCount) * gpuLayerRatio / ppCount
        + kvGB * gpuLayerRatio / tpCount / ppCount
    }
    return (weightGB + kvGB) * gpuLayerRatio / tpCount / ppCount
  })()
  const perCardNeeded = weightKvPerCard + overheadGB
  const displayNeeded = totalGpus > 1 ? perCardNeeded : totalNeeded
  const displayVram = totalGpus > 1 ? perCardVram : totalVram
  const clusterNeeded = totalGpus > 1 ? perCardNeeded * totalGpus : totalNeeded
  const vramOk = perCardNeeded <= perCardVram
  const vramPct = perCardNeeded / perCardVram * 100
  // 纯 CPU / llama.cpp 混合 / MoE offload 会把权重压到系统内存，
  // 此时显存够用不等于跑得起来，需要额外校验 DDR 容量。
  // sysRam 未提供（如 solver / 排行榜路径）时不做判定，保持既有行为。
  const ramOk = !(sysRam != null && cpuRamNeededGB > 0 && cpuRamNeededGB > sysRam)
  const runnable = vramOk && ramOk

  const raw = {
    // 显存
    weightGB, kvGB, overheadGB, activationGB, totalNeeded, totalVram,
    perCardNeeded, perCardVram, displayNeeded, displayVram, clusterNeeded,
    gpuCount: totalGpus,
    tpCount,
    dpCount,
    vramScope: totalGpus > 1 ? 'per_card' : 'total',
    vramOk,
    ramOk,
    runnable,
    vramPct,
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

  // 独立校准层：Roofline tok/s × Π(因子)。关：skipCalibration 或 CALIBRATION_ENABLED=false
  // 纯 CPU / ngl=0 不套 GPU 残差；hybrid 只按 GPU 段墙钟时间混合，DDR 段保持 1
  attachRoofToks(raw)
  if (skipCalibration) {
    raw.calibrationScale = { decode: 1, prefill: 1 }
    return raw
  }
  const gpuTimeShare = pureCpu
    ? 0
    : (isLlamaCppHybrid && cpuMemBw != null
      ? hybridTGpu / Math.max(hybridTGpu + hybridTCpu, 1e-9)
      : 1)
  return applySpeedCalibration(raw, {
    gpu,
    model,
    framework,
    batch,
    tpCount,
    outputLen,
    pureCpu,
    nglCount,
    gpuLayerRatio: pureCpu ? 0 : gpuLayerRatio,
    gpuTimeShare,
    cpuMemBw,
  })
}

/**
 * 混合 / 线性注意力的 KV 层拆分。
 * linear_attention_layers 与 local_layers+sliding_window===0 同等：这些层不占标准 KV。
 * 已同时填写两者的条目（qwen38_max / qwen3_next / kimi_k3）只扣一次，不重复。
 * sliding_window>0 的 local_layers 仍按滑动窗计 KV（Gemma 3 / GPT-OSS 等）。
 */
function getKvLayerParts(model) {
  const layers = model.layers ?? 1
  const linearLayers = model.linear_attention_layers
    ?? (model.local_layers != null && model.sliding_window === 0 ? model.local_layers : 0)
  const hasSliding = model.sliding_window != null && model.local_layers != null && model.sliding_window > 0
  const slidingLayers = hasSliding ? model.local_layers : 0
  return {
    globalLayers: Math.max(0, layers - linearLayers - slidingLayers),
    slidingLayers,
    slidingWindow: hasSliding ? model.sliding_window : 0,
    linearLayers,
    globalKvHeads: model.global_kv_heads ?? model.kv_heads,
    globalHeadDim: model.global_head_dim ?? model.head_dim,
    kvHeads: model.kv_heads,
    headDim: model.head_dim,
  }
}

function kvFootprintGB({ parts, globalSeq, slidingSeq, batch, kvBytesPerElem, mlaRatio, mambaRatio }) {
  const {
    globalLayers, slidingLayers, slidingWindow,
    globalKvHeads, globalHeadDim, kvHeads, headDim,
  } = parts
  const localSeq = slidingLayers > 0
    ? Math.min(Math.max(0, slidingSeq), slidingWindow)
    : 0
  let gb = 2 * batch * kvBytesPerElem * (
    globalLayers * globalKvHeads * globalHeadDim * Math.max(0, globalSeq) +
    slidingLayers * kvHeads * headDim * localSeq
  ) / 1e9
  if (mlaRatio) gb *= mlaRatio
  if (mambaRatio) gb *= mambaRatio
  return gb
}

/** params 已含视觉时（vision_encoder_in_params）不再加；否则加上独立的 vision_encoder_params */
function getVisionWeightParams(model) {
  if (model?.vision_encoder_in_params) return 0
  return model?.vision_encoder_params ?? 0
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
 *   4 × query_heads × head_dim × seq_len × softmax_layers
 *   （QK^T + AV；GQA/MQA 下 query 头数 ≥ kv_heads，须用 query heads）
 *
 * 线性 attention 层（GatedDeltaNet 等）无 O(n²) 开销，其 FLOPs 已被 activeParams 覆盖，
 * 不需要额外计入 factor。
 *
 * @param {object} params
 * @param {number} params.totalHeads        - Query 头数（决定 softmax attention FLOPs）
 * @param {number} params.kvHeads           - KV 头数（仅作 totalHeads 缺失时的回退）
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

  // GQA/MQA：注意力 FLOPs 由 query heads 决定，不能用 kv_heads 低估
  const qHeads = totalHeads ?? kvHeads ?? 1
  const hDim   = headDim ?? 128
  const seqLen = promptLen ?? 512

  // softmax attention 额外 FLOPs/token（O(n²)，不在 activeParams 里）：
  //   QK^T + AV = 4 × query_heads × head_dim × seq_len × softmax_layers
  const softmaxAttnFlops = 4 * qHeads * hDim * seqLen * softmaxLayers

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

function getKvBytesPerElem(kvCacheQuant) {
  // Auto / 未选：对齐 vLLM/SGLang 默认 BF16/FP16 KV，不因 FP8 权重改成 FP8 KV
  if (!kvCacheQuant || kvCacheQuant.id === 'auto' || kvCacheQuant.bytes == null) return 2.0
  return kvCacheQuant.bytes
}

function getActBytes(quant) {
  return quant?.act_bytes ?? 2.0
}

/**
 * EP 仅对带 experts 的 MoE 有效。dense / 无 experts 强制 1，与 RunConfig.epSupported 一致。
 */
export function effectiveEpCount(model, epCount = 1) {
  if (model?.type === 'moe' && model?.experts != null) {
    return Math.max(1, Math.round(Number(epCount) || 1))
  }
  return 1
}

/**
 * tp × ep × dp × pp = gpuCount（物理卡数）。
 * 默认 ep=1, dp=1, pp=1 → tp = gpuCount。无法整除时回退 ep/dp，避免 TP=8 再叠 EP=8。
 */
export function resolveParallelLayout({ gpuCount = 1, ppCount = 1, epCount = 1, dpCount = 1 } = {}) {
  const totalGpus = Math.max(1, Math.round(Number(gpuCount) || 1))
  let pp = Math.max(1, Math.round(Number(ppCount) || 1))
  let ep = Math.max(1, Math.round(Number(epCount) || 1))
  let dp = Math.max(1, Math.round(Number(dpCount) || 1))
  if (totalGpus % pp !== 0) pp = 1
  const perStage = totalGpus / pp
  if (perStage % (ep * dp) !== 0) {
    if (perStage % ep !== 0) {
      let nextEp = 1
      for (let n = ep; n >= 1; n--) {
        if (perStage % n === 0 && ep % n === 0) { nextEp = n; break }
      }
      ep = nextEp
    }
    if (perStage % (ep * dp) !== 0) dp = 1
  }
  const tp = Math.max(1, perStage / (ep * dp))
  return { totalGpus, tpCount: tp, epCount: ep, dpCount: dp, ppCount: pp }
}

function gpuHasNativeFp8(gpu) {
  if (gpu?.fp8 != null && gpu.fp8 > 0) return true
  const id = gpu?.id ?? ''
  // Ada / Hopper / Blackwell：原生 FP8 Tensor Core；Ampere 及更早走 BF16 回落
  if (/^(h100|h200|h800|b200|b300|gb200|gb300|l4|l40|rtx40|rtx50|rtx_pro)/.test(id)) return true
  if (/^rtx4[0-9]{3}/.test(id) || /^rtx5[0-9]{3}/.test(id)) return true
  return false
}

function gpuHasNativeFp4(gpu) {
  if (gpu?.fp4 != null && gpu.fp4 > 0) return true
  const id = gpu?.id ?? ''
  // Blackwell 5th-gen Tensor：NVFP4 / MXFP4 可走 FP4 峰值；Hopper/Ada 无原生 FP4
  return /^(b200|b300|gb200|gb300|rtx50|rtx_pro_6000)/.test(id) || /^rtx5[0-9]{3}/.test(id)
}

/** 按卡能力取 TFLOPS；缺字段时按架构回落，不把消费卡 FP8 默默当成 BF16 */
function getGpuTflops(gpu, key) {
  if (gpu?.[key] != null && gpu[key] > 0) return gpu[key]
  if (key === 'fp8') {
    if (gpuHasNativeFp8(gpu) && gpu.int8 != null && gpu.int8 > 0) return gpu.int8
    return gpu?.bf16 ?? 1
  }
  if (key === 'fp4' || key === 'nvfp4') {
    if (gpu?.fp4 != null && gpu.fp4 > 0) return gpu.fp4
    if (gpuHasNativeFp4(gpu) && gpu.int4 != null && gpu.int4 > 0) return gpu.int4
    // 无 FP4 算力：bytes 仍按 4-bit 计，prefill 回落 BF16
    return gpu?.bf16 ?? 1
  }
  if (key === 'int4') return gpu?.int4 ?? gpu?.bf16 ?? 1
  if (key === 'int8') return gpu?.int8 ?? gpu?.bf16 ?? 1
  return gpu?.bf16 ?? 1
}

function getAccuracyTier({ gpu, model, framework, isEP, tpCount, quant }) {
  const rank = { high: 2, mid: 1, low: 0 }
  const worse = (a, b) => (rank[a] <= rank[b] ? a : b)
  let tier = 'high'

  if (gpu.vendor === 'apple') {
    if (model.params < 15) return 'low'
    if (model.type === 'moe' && model.experts_per_token === 1) return 'low'
    if (model.type === 'moe' && gpu.bw < 580) return 'mid'
    if (model.params >= 30 && gpu.bw >= 500) return 'high'
    return 'mid'
  }

  if (model.id === 'custom' || model.status === 'preview') tier = worse(tier, 'low')
  if (model.type === 'moe' && model.experts_per_token === 1) tier = worse(tier, 'low')
  if (model.type === 'moe' && ['vllm', 'sglang', 'tgi'].includes(framework?.id)) {
    tier = worse(tier, 'mid')
  }
  if (isEP && tpCount > 1) tier = worse(tier, 'mid')
  if (quant && ['int2', 'int3'].includes(quant.id)) tier = worse(tier, 'mid')
  return tier
}

/** GGUF/Ollama 用 gguf_bytes；Apple 默认走 GGUF 体积 */
export function getQuantBytes(quant, gpu, framework) {
  const useGguf = gpu?.vendor === 'apple'
    || framework?.id === 'llamacpp'
    || framework?.id === 'llamacpp_metal'
  return useGguf ? (quant?.gguf_bytes ?? quant?.bytes ?? 0.5) : (quant?.bytes ?? 0.5)
}

/** NVIDIA HBM 数据中心卡（A100/H100/H200/B200…）。5090 虽带宽高但是 GDDR，不算 HBM。 */
function isNvidiaHbm(gpu) {
  return gpu?.vendor === 'nvidia' && gpu?.tier === 'datacenter' && (gpu.bw ?? 0) >= 1500
}

/** Prefill 算力：llama.cpp 量化默认 BF16；消费卡 Q4 mmq 吃一部分 INT4 TC；vLLM/Marlin 走满额 INT4/FP4 */
function getPrefillTflops(gpu, quant, framework, model) {
  const fw = framework?.id
  const quantId = quant?.id ?? 'bf16'
  const marlinLike = ['vllm', 'sglang', 'trtllm', 'lmdeploy', 'exllamav2'].includes(fw)
  const isInt4Family = quantId === 'int4' || quantId === 'int3' || quantId === 'int2'
  const isInt8Family = quantId === 'int8' || quantId === 'int5' || quantId === 'int6'
  const isFp4Family = quantId === 'mxfp4' || quantId === 'nvfp4'
  let tflops
  if (marlinLike && isInt4Family) tflops = getGpuTflops(gpu, 'int4')
  else if (marlinLike && isFp4Family) tflops = getGpuTflops(gpu, 'fp4')
  else if (!marlinLike && (isInt4Family || isFp4Family || isInt8Family)) {
    const bf16 = getGpuTflops(gpu, 'bf16')
    // 消费卡 llama.cpp mmq：Q4 prompt eval 会吃到一部分 INT4 TC，短上下文不要钉死 unpack→BF16
    // 锚点：4090 Llama 8B Q4 LocalScore 9 项 PP 均值 ~6697–7594（decode 仍走带宽，不走这条）
    // <3B 小 GEMM 吃不满 INT4 TC（LocalScore 1B PP），不要套 8B 的 mmq 加成
    if (
      gpu?.vendor === 'nvidia'
      && gpu?.tier === 'consumer'
      && isInt4Family
      && fw === 'llamacpp'
      && (model?.params ?? 8) >= 3
    ) {
      const int4 = getGpuTflops(gpu, 'int4')
      tflops = (int4 > bf16) ? bf16 + 0.27 * (int4 - bf16) : bf16
    } else {
      tflops = bf16
    }
  } else {
    const key = quant?.prefill_flops_key ?? quant?.flops_key ?? 'bf16'
    tflops = getGpuTflops(gpu, key)
  }
  return capLlamacppCudaPrefillTflops(gpu, quant, framework, model, tflops)
}

/** llama.cpp CUDA 吃不满 Hopper/Ada 数据中心标称 BF16 TC（无 Transformer Engine） */
function capLlamacppCudaPrefillTflops(gpu, quant, framework, model, tflops) {
  if (gpu?.vendor !== 'nvidia' || framework?.id !== 'llamacpp') return tflops
  const quantId = quant?.id ?? 'bf16'
  const isInt4Family = quantId === 'int4' || quantId === 'int3' || quantId === 'int2'
  const isFp16Family = quantId === 'bf16' || quantId === 'fp32'
  const hbm = isNvidiaHbm(gpu)
  if (hbm && (model?.params ?? 8) < 3) return Math.min(tflops, 120)
  if (hbm && isInt4Family) return Math.min(tflops, 330)
  if (hbm && isFp16Family) return Math.min(tflops, 440)
  // L40S：标称 BF16 362 但 llama.cpp Q4 pp 只相当于 ~250 TFLOPS（XiongjieDai 8B Q4 pp≈5908）
  if (!hbm && gpu?.tier === 'datacenter' && isInt4Family && tflops > 250) return 250
  return tflops
}

/**
 * Decode 每步实际读取的权重比例（相对存储量）
 * - Apple：仅保留轻度片上复用；旧 M4/M5 GGUF 0.44–0.52 会把 8B 估算抬到 ~2×（相对 #4167）
 * - NVIDIA BF16：小模型 kernel fusion / L2 缓存
 */
function getDecodeWeightReadRatio(gpu, quant, model, framework) {
  const quantId = quant?.id ?? 'bf16'
  const isGgufQuant = ['int2', 'int3', 'int4', 'int5', 'int6', 'mxfp4', 'nvfp4'].includes(quantId)
  const chipId = gpu?.id ?? ''

  if (gpu?.vendor === 'apple') {
    const isM4M5 = /apple_m[45]/.test(chipId)
    const useMlxLike = framework?.id === 'mlx' || framework?.id === 'llamacpp_metal'
    // 校准锚点：llama.cpp #4167 LLaMA 7B Q4_0 tg128 + arXiv:2601.19139 MLX≈+4–15%（勿用未核验的 ~160 tok/s）
    // mlx/metal 共用读比；框架差距由 decode 与 applyAppleFrameworkAdjustments 承担
    if (isM4M5 && useMlxLike) {
      if (/_(max|ultra)_/.test(chipId)) return isGgufQuant ? 0.96 : 0.97
      if (/_pro_/.test(chipId)) return isGgufQuant ? 0.94 : 0.95
      return isGgufQuant ? 0.95 : 0.96
    }
    if (isM4M5) {
      if (/_(max|ultra)_/.test(chipId)) return isGgufQuant ? 0.94 : 0.96
      if (/_pro_/.test(chipId)) return isGgufQuant ? 0.92 : 0.94
      return isGgufQuant ? 0.94 : 0.96
    }
    return isGgufQuant ? 0.96 : 0.98
  }

  if (quantId === 'bf16' || quantId === 'fp32') {
    const params = model?.params ?? 8
    // 小模型 L2/寄存器命中高，但仍会读大部分权重；过低（如 0.34）会系统性虚高 TPS
    // 15–30B 原先 0.60 偏乐观（比 <15B 更「吃缓存」不合理），与小档对齐为 0.80
    if (params < 15) return 0.80
    if (params < 30) return 0.80
    return 0.82
  }

  // FP8 权重更小，更易进 L2；用 active_params 衡量 MoE 每步实际读的矩阵
  // 锚点：vLLM H100 NVL Qwen3-30B-A3B FP8 饱和（active<8B 略低于 BF16 读比）
  if (quantId === 'fp8') {
    const p = model?.type === 'moe'
      ? (model.active_params ?? model.params ?? 8)
      : (model?.params ?? 8)
    if (p < 8) return 0.57
    if (p < 15) return 0.68
    if (p < 30) return 0.74
    return 0.80
  }

  if (isGgufQuant) return 0.96
  return 1.0
}

/**
 * Apple 代际 decode 有效带宽缩放（优先 ≤1）
 * 锚点：llama.cpp #4167 同带宽 Max 的 Q4_0 tg 比（M1 Max 61 / M2 Max 66 / M3 Max 66）
 * Ultra 双 die 惩罚已在 bwUtilization≈0.67，此处不再叠代际折扣（否则会出现 M1 Ultra > M2 Ultra）
 */
function getAppleDecodeBwScale(gpu) {
  if (gpu?.vendor !== 'apple') return 1.0
  if (gpu.decodeBwScale != null) return gpu.decodeBwScale
  const id = gpu.id ?? ''
  if (/apple_m[45]/.test(id)) return 1.0
  if (/apple_m3/.test(id)) return 1.0
  if (/apple_m2/.test(id)) return 0.99
  if (/apple_m1/.test(id)) return 0.92
  return 1.0
}

/** Continuous batching 高 batch 调度效率衰减（batch≤8 不打折，避免打残低并发） */
function getBatchSchedulingEfficiency(batch, framework, model) {
  if ((framework?.schedulingMode ?? 'continuous') !== 'continuous') return 1.0
  if (batch <= 8) return 1.0
  // Apple 高 batch 不是本次校准靶，保持原斜率，避免为 CUDA serving 改 MLX
  const appleFw = framework?.id === 'mlx' || framework?.id === 'llamacpp_metal'
  // MoE 饱和已用 0.028 对齐 arXiv:2606.11690；dense 同斜率会把 Llama 8B/70B serving 打到一半
  // dense 更缓：H100 NVL Llama 8B / A100 ShareGPT / 4×H100 70B，且不碰 MoE 锚点
  const slope = appleFw ? 0.048 : (model?.type === 'moe' ? 0.028 : 0.007)
  return Math.max(appleFw ? 0 : 0.20, 1 / (1 + (batch - 8) * slope))
}

/**
 * CUDA MoE grouped GEMM 效率：moeKernelEff 是 batch=1 的低值，随 batch 升向 dense（1.0）
 * 专家少（Mixtral 8）更快变满；128 专家更慢。锚点：SGLang H100 batch=4；vLLM 饱和 ~batch 32–64
 */
function getCudaMoeKernelEff(kSmall, batch, model) {
  const b = Math.max(1, Number(batch) || 1)
  const experts = Math.max(1, model?.experts ?? 8)
  const denom = experts >= 64 ? 6 : 4.5
  const t = Math.min(1, Math.log2(b) / denom)
  return kSmall + (1 - kSmall) * t
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

/** Apple llama.cpp metal：dense 对齐 MLX 实测比值（arXiv:2601.19139 / Sean Kim：metal ≈ 90–96% MLX）
 *  旧 0.74 把 Max Metal 相对 #4167 再压低一截；MoE 的更大差距由 overfetch/dispatch 单独处理 */
function applyAppleFrameworkAdjustments(gpu, framework, adjustedFramework) {
  if (gpu?.vendor !== 'apple' || framework?.id !== 'llamacpp_metal') return adjustedFramework
  const chipId = gpu.id ?? ''
  const vsMlx = /_(max|ultra)_/.test(chipId) ? 0.90
    : /_pro_/.test(chipId) ? 0.93
    : 0.90
  // 与当前 mlx.decode 基准对齐，避免再叠乘回虚高
  const mlxDecodeBase = 0.84
  const targetDecode = mlxDecodeBase * vsMlx
  return {
    ...adjustedFramework,
    decode: targetDecode,
    decodeMin: targetDecode * 0.90,
    decodeMax: Math.min(0.92, targetDecode * 1.08),
  }
}

// MoE expert dispatch 额外延迟，覆盖 Apple Metal 与 CUDA
// 与 modelSizeScaling 互补：modelSizeScaling 处理 dense 部分的效率，此处处理 MoE 特有的碎片化 dispatch
function getMoeExtraDecodeMs({ gpu, framework, model, batch }) {
  if (model?.type !== 'moe') return 0

  const activeExperts = model.experts_per_token ?? 1
  const totalExperts = model.experts ?? activeExperts
  if (totalExperts <= 1) return 0

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
  const moeDispatchScale = framework?.id === 'mlx' ? 0.50
    : (gpu?.vendor === 'apple' ? 0.85 : 1.0)

  // CUDA：不要用 max(1, sqrt(600/bw)) 把 H100 dispatch 钉在满额
  // Apple：保留带宽缩放，与既有 MLX/Metal 标定一致
  const bwScale = gpu?.vendor === 'apple'
    ? Math.max(1.0, Math.sqrt(600 / (gpu.bw ?? 600)))
    : 1.0

  if (activeExperts <= 1) {
    const top1FixedUsPerLayer = 450
    return ((model.layers ?? 1) * top1FixedUsPerLayer * batchScale * bwScale * moeDispatchScale) / 1000
  }

  const fanoutScale = Math.sqrt(Math.max(1, totalExperts / 128))
  const activeFragmentCount = activeExperts - 1
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
    min: 1.08 + (1.55 - 1.08) * logScale,
    mid: 1.12 + (2.00 - 1.12) * logScale,
    max: 1.18 + (2.45 - 1.18) * logScale,
  }

  // head_dim 加成只作用于「超额」部分（boost-1），避免短 prompt + hd=256 仍给 ~2.2× mid
  // 例：短上下文 base.mid=1.12、hdScale=2 → 1+(0.12)*2=1.24（旧式 1.12*2≈2.24）
  const applyHd = (v) => 1 + (v - 1) * hdScale
  return {
    min: Math.max(1, applyHd(base.min)),
    // mid 封顶 ≤2.5（既有约束）
    mid: Math.min(2.5, Math.max(1, applyHd(base.mid))),
    max: Math.max(1, applyHd(base.max)),
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
    displayNeeded,
    displayVram,
    totalNeeded,
    totalVram,
    tpEfficiency,
    epEfficiency,
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
      diff: (displayNeeded - displayVram).toFixed(1),
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

  if ((epEfficiency ?? 1) < 0.7) {
    warnings.push({ level: 'warn', key: 'ep_comm' })
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
        ramOk:         r.ramOk,
        runnable:      r.runnable,
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
  const totalFp8  = slots.reduce((s, g) => s + (g.gpu.fp8 ?? 0) * g.count, 0)
  const totalFp4  = slots.reduce((s, g) => s + (g.gpu.fp4 ?? 0) * g.count, 0)
  const totalTdp  = slots.reduce((s, g) => s + g.gpu.tdp * g.count, 0)

  return {
    // VRAM：TP 下每卡存等量权重，短板决定上限（单卡值，calcAll 会 × gpuCount）
    vram: Math.min(...slots.map(g => g.gpu.vram ?? 0)),
    // 等效单卡值 = 总值 ÷ totalCount，calcAll 内 × gpuCount 还原
    bw:   totalBw   / totalCount,
    bf16: totalBf16 / totalCount,
    int8: totalInt8 / totalCount,
    int4: totalInt4 / totalCount,
    fp8:  totalFp8  / totalCount || null,
    fp4:  totalFp4  / totalCount || null,
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

