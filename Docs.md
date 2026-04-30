# TPS Calculator 算法文档

> **本文档基于当前代码实现编写**  
> 代码优先，文档跟随真实实现，适合作为学习参考和二次开发入口。

**最后更新**: 2026-04-30  
**基于代码版本**: 最新主分支代码

---

## 📋 目录

1. [核心目标](#1-核心目标)
2. [数据来源](#2-数据来源)
3. [计算入口](#3-计算入口)
4. [模型结构参数](#4-模型结构参数)
5. [显存计算](#5-显存计算)
6. [Decode 速度](#6-decode-速度)
7. [Prefill 速度](#7-prefill-速度)
8. [Roofline 与瓶颈判断](#8-roofline-与瓶颈判断)
9. [告警规则](#9-告警规则)
10. [公式 vs 经验系数](#10-公式-vs-经验系数)
11. [建议阅读顺序](#11-建议阅读顺序)

---

## 1. 核心目标

给定以下输入，估算推理性能指标：

**输入参数**:
- GPU 型号、数量、互联方式
- 模型结构参数（参数量、层数、注意力配置等）
- 权重量化方式（FP32/BF16/INT4 等）
- 上下文长度、并发数、Prompt 长度、输出长度
- 推理框架（vLLM/TRT-LLM/llama.cpp/MLX 等）
- 高级选项（Flash Attention、KV Cache 量化、Prefix Cache、MoE CPU Offload）

**输出指标**:
- **显存需求**: 权重、KV Cache、系统开销、OOM 判断
- **Decode 速度**: 带宽上限、实际吞吐、单请求速度、效率区间
- **Prefill 速度**: 算力上限、实际吞吐、瓶颈判断
- **延迟**: TTFT（首 token 延迟）、TPOT（单 token 延迟）、总延迟
- **综合分析**: Roofline 比、TP 通信效率、功耗估算

**核心代码文件**:
- [src/utils/calc.js](./src/utils/calc.js) - 核心计算逻辑
- [src/utils/model.js](./src/utils/model.js) - 模型结构分析
- [src/data/constants.js](./src/data/constants.js) - 量化/框架/互联常量
- [src/data/runtime.js](./src/data/runtime.js) - 运行时配置选项
- [src/App.vue](./src/App.vue) - 状态管理和计算调用

---

## 2. 数据来源

### 2.1 GPU 数据

**位置**: `src/data/gpus/` 目录，按厂商分类

**关键字段**:
```javascript
{
  id: 'h100_sxm',
  label: 'H100 SXM5 80GB',
  vendor: 'nvidia',
  vram: 80,           // GB
  bw: 3350,           // GB/s (HBM3)
  bf16: 1979,         // TFLOPS (BF16)
  fp8: 3958,          // TFLOPS (FP8)
  int8: 3958,         // TFLOPS (INT8)
  int4: 7916,         // TFLOPS (INT4)
  tdp: 700,           // W
  usableRatio: 0.95,  // 可用显存比例（扣除系统保留）
}
```

**支持厂商**:
- NVIDIA: RTX 系列、Tesla 系列、H100/H200
- AMD: RX 5000/6000/7000/9000、MI 系列
- Intel: Arc 系列、Gaudi 系列
- Apple: M1/M2/M3/M4 系列
- 国产: 天数智芯、壁仞科技等

### 2.2 模型数据

**位置**: `src/data/models/` 目录，按模型系列分类

**标准 Dense 模型字段**:
```javascript
{
  id: 'llama3_1_8b',
  label: 'Llama 3.1 8B',
  type: 'dense',
  params: 8.03,        // B (总参数量)
  layers: 32,
  hidden_size: 4096,
  kv_heads: 8,         // KV 头数（GQA）
  head_dim: 128,
  ctx_default: 128000, // 默认上下文长度
}
```

**MoE 模型额外字段**:
```javascript
{
  type: 'moe',
  params: 671,         // B (总参数量)
  active_params: 37,   // B (每 token 激活参数量)
  experts: 256,
  experts_per_token: 8,
}
```

**MLA 模型额外字段** (DeepSeek V2/V3/R1):
```javascript
{
  mla_ratio: 0.18,     // KV Cache 压缩比（DeepSeek V3 示例，不同模型可能不同）
}
```

**混合注意力模型额外字段** (Gemma3):
```javascript
{
  sliding_window: 1024,      // 滑动窗口大小（Gemma 3 27B 示例）
  local_layers: 52,          // 使用滑动窗口的层数
  // global 层使用标准的 kv_heads 和 head_dim
}
```

### 2.3 量化精度常量

**位置**: `src/data/constants.js` - `QUANT_MAP`

```javascript
{
  id: 'int4',
  label: 'INT4/GPTQ/AWQ',
  bytes: 0.50,         // 权重每参数字节数
  kv_bytes: 2.0,       // KV Cache 每元素字节数（独立于权重）
  flops_key: 'int4',   // 对应 GPU 算力字段
  quality: 'ok',       // 质量标签
}
```

**重要说明**:
- `kv_bytes` 独立于权重量化，INT4 权重的 KV Cache 通常仍是 FP16 (2.0 bytes)
- `flops_key` 决定使用 GPU 的哪个算力字段（bf16/fp8/int8/int4）
- Q6_K/Q5_K 使用 `bf16` 算力（修复后），因为 llama.cpp 在这些精度下主要受带宽限制

### 2.4 框架效率系数

**位置**: `src/data/constants.js` - `FRAMEWORK_MAP`

```javascript
{
  id: 'vllm',
  labelKey: 'framework.vllm',
  decode: 0.65,        // 中位效率
  prefill: 0.68,
  decodeMin: 0.55,     // 最小效率（保守估计）
  decodeMax: 0.75,     // 最大效率（乐观估计）
  prefillMin: 0.60,
  prefillMax: 0.80,
  vendors: ['nvidia', 'amd'],  // 支持的硬件厂商
  schedulingMode: 'continuous', // 'continuous' | 'serial'
}
```

**`schedulingMode` 说明**：
- `'continuous'`：连续批处理（vLLM/SGLang/TRT-LLM/TGI/MLX/LMDeploy）。多请求并行调度，TTFT 不随 batch 线性增加。
- `'serial'`：串行排队（llama.cpp/ExLlamaV2/理论上限）。新请求需等待前一次 Prefill 完成，TTFT × batch。

**所有框架系数**（基于验证报告）：

| 框架 | decode | decodeMin | decodeMax | schedulingMode | 平台 |
|------|--------|-----------|-----------|----------------|------|
| Theory | 1.00 | 1.00 | 1.00 | serial | 全平台 |
| TRT-LLM | 0.80 | 0.75 | 0.85 | continuous | NVIDIA |
| LMDeploy | 0.76 | 0.73 | 0.80 | continuous | NVIDIA |
| **MLX** | **0.90** | **0.80** | **0.95** | continuous | Apple |
| ExLlamaV2 | 0.70 | 0.65 | 0.75 | serial | NVIDIA |
| SGLang | 0.68 | 0.65 | 0.75 | continuous | NVIDIA/AMD |
| vLLM | 0.65 | 0.55 | 0.75 | continuous | NVIDIA/AMD |
| TGI | 0.47 | 0.40 | 0.55 | continuous | NVIDIA/AMD |
| llama.cpp | 0.55\* | 0.48 | 0.65 | serial | 全平台 |
| llama.cpp metal | 0.62\* | 0.52 | 0.70 | serial | Apple |

\* llama.cpp 支持 `modelSizeScaling`，按模型规模三档动态调整（<14B/14-30B/>30B）。

### 2.5 运行时配置

**位置**: `src/data/runtime.js`

**KV Cache 量化选项**:
```javascript
KV_CACHE_MAP = [
  { id: 'auto', label: 'Auto', bytes: null },  // 使用 quant.kv_bytes
  { id: 'fp16', label: 'FP16', bytes: 2.0 },
  { id: 'fp8',  label: 'FP8',  bytes: 1.0 },
  { id: 'int8', label: 'INT8', bytes: 1.0 },
  { id: 'int4', label: 'INT4', bytes: 0.5 },
]
```

**PCIe 带宽选项** (MoE CPU Offload):
```javascript
PCIE_BW_OPTIONS = [
  { id: 'gen3', label: 'PCIe 3.0', bw: 16 },  // GB/s，单向
  { id: 'gen4', label: 'PCIe 4.0', bw: 32 },  // GB/s，单向
  { id: 'gen5', label: 'PCIe 5.0', bw: 64 },  // GB/s，单向
]
```

**注意**：calc.js 内部对 `pcieBw.bw` 再除以 2 (`pcieBwUnidirectional = pcieBw.bw / 2`) 以模拟 DMA 实际带宽损耗（PCIe 全双工共享总线、协议开销等），保守估计：
- PCIe 4.0：32 / 2 = **16 GB/s** 有效 DMA 带宽
- PCIe 5.0：64 / 2 = **32 GB/s** 有效 DMA 带宽

---

## 3. 计算入口

[src/App.vue](./src/App.vue) 负责收集状态并实时调用：

```js
calcAll({
  gpu,
  gpuCount,
  interconnect,
  model,
  quant,
  ctx,
  batch,
  promptLen,
  outputLen,
  framework,
  flashAttention,
  kvCacheQuant,
  prefixCacheHit,
  cpuOffload,
  pcieBw,
})
```

其中：

- `framework` 来自 `FRAMEWORK_MAP`
- `flashAttention` 是布尔值
- `kvCacheQuant` 决定 KV Cache 元素字节数
- `prefixCacheHit` 会缩短有效 prefill 长度
- `cpuOffload` + `pcieBw` 用于 MoE CPU 卸载模式

## 4. 模型结构参数

模型结构的几个关键字段：

- `params`: 总参数量，单位 B
- `active_params`: MoE 每 token 激活参数量，单位 B
- `layers`
- `kv_heads`
- `head_dim`
- `hidden_size`
- `mla_ratio`: DeepSeek 一类模型的 KV 压缩系数
- `sliding_window` + `local_layers`: 混合注意力模型（如 Gemma3）的滑动窗口配置
- `global_kv_heads` / `global_head_dim`: 混合注意力模型 global 层的独立头配置

辅助函数在 [src/utils/model.js](./src/utils/model.js)：

- `getTotalHeads(model)`：`hidden_size / head_dim`
- `getAttentionType(model)`：返回 `mha / gqa / mqa`
- `getAttentionSummary(model)`：用于界面展示

## 5. 显存计算

**实现位置**: `src/utils/calc.js` - `calcAll()` 函数

### 5.1 权重显存

```javascript
weightGB = model.params * quant.bytes
```

**示例**:
- Llama 3 8B + INT4: `8.0 × 0.5 = 4.0 GB`
- DeepSeek V3 + BF16: `671 × 2.0 = 1342 GB`

### 5.2 KV Cache 显存

**标准模型公式**:
```javascript
kvGB = 2 * layers * kv_heads * head_dim * ctx * batch * kvBytesPerElem / 1e9
```

**参数说明**:
- `2`: K 和 V 两个缓存
- `kvBytesPerElem`: 优先使用用户选择的 KV Cache 量化精度，否则取 `quant.kv_bytes`，默认 2.0 (FP16)

**混合注意力模型** (Gemma3):
```javascript
globalLayers = layers - local_layers
globalKvHeads = global_kv_heads ?? kv_heads  // 如果未指定，使用标准 kv_heads
globalHeadDim = global_head_dim ?? head_dim  // 如果未指定，使用标准 head_dim
kvGB = 2 * batch * kvBytesPerElem * (
  globalLayers * globalKvHeads * globalHeadDim * ctx +
  local_layers * kv_heads * head_dim * min(ctx, sliding_window)
) / 1e9
```

**MLA 压缩** (DeepSeek V2/V3/R1):
```javascript
if (model.mla_ratio) kvGB *= model.mla_ratio  // DeepSeek V3: 0.18
```

**示例**:
- Llama 3 8B, ctx=8192, batch=1, FP16:  
  `2 × 32 × 8 × 128 × 8192 × 1 × 2.0 / 1e9 = 1.07 GB`
- DeepSeek V3, ctx=8192, batch=1, FP16, MLA:  
  `标准计算 × 0.18 = 大幅压缩`

### 5.3 系统开销

```javascript
overheadGB = Math.max(1.0, Math.min(weightGB * 0.03, 5.0))
```

**动态调整逻辑**:
- 小模型 (<33B): 最少 1GB
- 大模型: 按权重 3% 计算
- 超大模型: 上限 5GB

### 5.4 激活内存（Activation Memory）

大 batch / 长 Prompt 下，反向传播（若有）和中间激活占用额外显存：

```javascript
activationGB = batch * promptLen * hidden_size * layers * 2 / 1e9
```

当 `activationGB > 2 GB` 时触发 `activation_oom` 警告。纯推理（无梯度）场景下激活内存远低于训练，此公式偏保守，用于预警极端 batch 场景。

### 5.5 总显存需求与判断

```javascript
totalNeeded = weightGB + kvGB + overheadGB
totalVram = gpu.vram * gpuCount * (gpu.usableRatio ?? 1.0)
vramOk = totalNeeded <= totalVram
```

**MoE CPU Offload 时的 weightGB**:
```javascript
weightGB = cpuOffload && model.type === 'moe'
  ? model.active_params * quant.bytes * 1.5  // 只需 GPU 存 active 专家 × 1.5（含 attention/embed）
  : model.params * quant.bytes               // 完整权重
```
×1.5 覆盖始终驻留 GPU 的非 MoE 层（attention、embedding、normalization）。

---

## 6. Decode 速度

**实现位置**: `src/utils/calc.js` - Decode 速度计算部分

Decode 阶段是**带宽密集型**，每步只生成 1 个 token，主要瓶颈是从 HBM 读取权重和 KV Cache。

### 6.1 有效权重读取

```javascript
activeWeight = model.type === 'moe'
  ? model.active_params * quant.bytes  // MoE: 只读激活的专家权重
  : weightGB                            // Dense: 读全部权重
```

### 6.2 Decode 阶段 KV 读取

```javascript
avgDecodeSeqLen = min(ctx, promptLen + outputLen / 2)  // 平均序列长度
kvReadGB = 2 * layers * kv_heads * head_dim * avgDecodeSeqLen * batch * kvBytesPerElem / 1e9
```

**混合注意力模型**同样按 global/local 分层计算。  
**MLA 模型**同步应用 `mla_ratio` 压缩。

### 6.3 带宽上限计算

**标准模式**：
```javascript
decodeBytesPerStep = activeWeight + kvReadGB
bwLimit = (totalBw / decodeBytesPerStep) * batch
```

**MoE CPU Offload 混合 IO 串行模型**：

Expert FFN 权重在 CPU RAM，通过 PCIe 读取；attention/embed 权重 + KV Cache 在 GPU HBM，两段串行：

```javascript
// 专家权重比例（MoE 特有，expert FFN 占激活参数的约 50-70%）
if (model.experts && model.experts_per_token) {
  const baseRatio = Math.min(0.5, model.experts_per_token / model.experts)
  expertIOPerStep = model.active_params * (1 - baseRatio) * quant.bytes
} else {
  expertIOPerStep = model.active_params * 0.70 * quant.bytes  // 默认 70%
}
nonExpertIOPerStep = model.active_params * quant.bytes - expertIOPerStep
gpuIOPerStep = nonExpertIOPerStep + kvReadGB

// PCIe 有效带宽（存储双向值，/2 = 单向 DMA 带宽）
pcieBwUnidirectional = pcieBw.bw / 2
tExpert = expertIOPerStep / pcieBwUnidirectional  // s/tok，PCIe 瓶颈
tGpu    = gpuIOPerStep    / totalBw               // s/tok，HBM 瓶颈
bwLimit = (1 / (tExpert + tGpu)) * batch          // tok/s
```

**关键理解**：PCIe 和 HBM 两段串行，总时间为两者之和，不是简单取较小值。

**关键理解**:
- `batch` 个请求并发，带宽被共享，但每步产出 `batch` 个 token
- TP 多卡: `totalBw = gpu.bw × gpuCount`，每卡读 1/N 权重，N 卡并行

### 6.4 框架效率修正

```javascript
decodeToks    = bwLimit * framework.decode     // 中位估算
decodeToksMin = bwLimit * framework.decodeMin  // 保守估算
decodeToksMax = bwLimit * framework.decodeMax  // 乐观估算
```

**框架效率系数** 见 §2.4 完整表格。

### 6.5 TPOT（单 Token 延迟）

```javascript
tpot = (decodeBytesPerStep / effectiveBw) * 1000 / framework.decode  // ms/tok
```

**P0 修复**: 现在正确除以 `framework.decode`，修正了之前 3~4 倍的偏差。

### 6.6 TP 通信效率

多卡 Tensor Parallel 时，每层需要 all-reduce 通信：

```javascript
commBytesPerLayer = 2 * hidden_size * batch * 2 * (gpuCount - 1) / gpuCount  // bytes
commLatencyPerLayer = commBytesPerLayer / (interconnect.bw * 1e9) * 1000     // ms
computePerLayer = tpot / model.layers                                         // ms
tpEfficiency = computePerLayer / (computePerLayer + commLatencyPerLayer)
```

**关键点**:
- `2 * (N-1) / N`: 环形 all-reduce 实际传输系数
- `interconnect.bw`: NVLink/InfiniBand/PCIe 带宽 (GB/s)
- 效率范围: `[0.01, 1.0]`

### 6.7 最终 Decode 吞吐

```javascript
effectiveToks = decodeToks * tpEfficiency  // 考虑通信损耗
singleToks = effectiveToks / batch         // 单请求速度
```

---

## 7. Prefill 速度

**实现位置**: `src/utils/calc.js` - Prefill 速度计算部分

Prefill 阶段是**计算密集型**，需要处理整个 Prompt 序列，主要瓶颈是 GPU 算力。

### 7.1 Prefix Cache 对有效 Prompt 的影响

```javascript
prefixHitRatio = min(0.99, max(0, prefixCacheHit / 100))
effectivePromptLen = round(promptLen * (1 - prefixHitRatio))
```

**示例**:
- Prompt 1000 tokens, Prefix Cache 50% → 有效 Prompt 500 tokens
- Prefix Cache 不影响 Decode 速度，只影响 Prefill 和 TTFT

### 7.2 算力上限计算

```javascript
activeParams = model.type === 'moe'
  ? (model.active_params ?? model.params)  // MoE: 激活参数
  : model.params                            // Dense: 全部参数

computeBaseLimit = (tflops * 1e12) / (2 * activeParams * 1e9)  // tok/s
```

**公式推导**:
- Prefill FLOPs = `2 × activeParams × promptLen`
- 时间 = FLOPs / (tflops × 10^12)
- 速度 = promptLen / 时间 = `tflops × 10^12 / (2 × activeParams × 10^9)`

### 7.3 Attention 结构系数

```javascript
function getPrefillAttentionFactor({ totalHeads, kvHeads, attentionType }) {
  // GQA/MQA 减少注意力 FLOPs：注意力占总 FLOPs 约 20%
  // 节省比例 = (1 - kv_heads/total_heads) × 0.20
  const attnFlopsFraction = 0.20
  if (kvHeads != null && totalHeads > 0 && kvHeads < totalHeads) {
    return 1 - (1 - kvHeads / totalHeads) * attnFlopsFraction
  }
  return 1  // MHA 或无 GQA 信息时
}
```

**示例**：
- Llama 3 70B (kv_heads=8, total=64): `1 - (1 - 8/64) × 0.20 = 0.887` (-11.3%)
- Llama 3 8B (kv_heads=8, total=32): `1 - (1 - 8/32) × 0.20 = 0.950` (-5%)
- MHA 模型 (kv_heads=total): `factor = 1.0`

### 7.4 Flash Attention 加速区间

```javascript
function getFlashAttentionBoostRange({ enabled, promptLen, headDim }) {
  if (!enabled) return { min: 1, mid: 1, max: 1 }
  // headDim 缩放：head_dim=256 比 128 约有 2× 收益；head_dim=64 仅 0.5×
  const dimScale = Math.min(2.0, Math.max(0.5, headDim / 128))
  
  if (promptLen >= 32768) return { min: 3, mid: 4, max: 5 }
  if (promptLen >= 8192)  return { min: 2, mid: 2.5, max: 3 }
  if (promptLen >= 2048)  return { min: 1.5, mid: 1.75, max: 2 }
  return { min: 1, mid: 1, max: 1.1 }  // < 2048 tokens 收益极小
  // 各档乘以 dimScale
}
```

**加速原理**:
- 减少 HBM 访问次数，序列越长收益越大
- `headDim` 越大（如 256），每次加载的有效数据量更大，FA 收益更显著
- 关闭时固定返回 1x

### 7.5 Prefill 吞吐

```javascript
flashFactor = flashRange.mid
computeLimit = computeBaseLimit * prefillAttentionFactor * flashFactor
prefillToks = computeLimit * framework.prefill
prefillToksMin = computeBaseLimit * framework.prefillMin * prefillAttentionFactor * flashRange.min
prefillToksMax = computeBaseLimit * framework.prefillMax * prefillAttentionFactor * flashRange.max
```

### 7.6 TTFT（首 Token 延迟）

```javascript
// isContinuousBatching：framework.schedulingMode === 'continuous'
ttft = (effectivePromptLen * 2 * activeParams * 1e9) / (tflops * 1e12)
       * 1000
       / (prefillAttentionFactor * flashFactor * framework.prefill)
       * (isContinuousBatching ? 1 : Math.max(1, batch))
```

**batch 系数说明**:
- **continuous batching 模式**（vLLM/SGLang/TRT-LLM/TGI/MLX/LMDeploy）：多请求并行处理，TTFT 不随 batch 增加，乘以 1
- **serial 模式**（llama.cpp/ExLlamaV2/理论）：新请求需等前一请求 Prefill 完成，TTFT 乘以 `max(1, batch)`
- 这由 `framework.schedulingMode` 控制，见 §2.4

### 7.7 总延迟

```javascript
totalLatency = ttft + outputLen * tpot  // ms
```

---

## 8. Roofline 与瓶颈判断

```javascript
roofline = computeLimit / bwLimit
bottleneck = roofline > 1 ? 'bandwidth' : 'compute'
```

**判断逻辑**:
- `roofline > 1`: 算力上限 > 带宽上限 → **先撞带宽墙** → 带宽瓶颈
- `roofline < 1`: 带宽上限 > 算力上限 → **先撞算力墙** → 算力瓶颈

**典型场景**:
- 小模型 + 高端 GPU (如 Llama 8B + H100): 算力瓶颈
- 大模型 + 中端 GPU (如 Llama 70B + RTX 4090): 带宽瓶颈
- MoE 模型: 通常带宽瓶颈（激活参数少，权重读取多）

---

## 9. 告警规则

**实现位置**: `src/utils/calc.js` - `getWarnings()` 函数

| 条件 | 级别 | key | 说明 |
|------|------|-----|------|
| `!vramOk` | error | `vram_oom` | 显存不足，无法运行 |
| `vramPct > 95%` | warn | `vram_high` | 显存利用率过高，可能 OOM |
| `activationGB > 2 GB` | warn | `activation_oom` | 激活内存过大，大 batch 可能溢出 |
| `tpEfficiency < 0.7` | warn | `tp_comm` | TP 通信开销过大，效率低 |
| `singleToks < 20` | warn | `slow_single` | 单请求速度过慢 |
| `roofline > 10` | info | `bw_bottleneck` | 严重带宽瓶颈 |
| `totalPower > 10 kW` | info | `high_power` | 功耗过高 |

---

## 10. 公式 vs 经验系数

### 10.1 结构公式（高可信度）

这些基于硬件规格和模型结构，误差主要来自数据准确性：

- ✅ 权重显存: `params × bytes`
- ✅ KV Cache 显存（含混合注意力分层）
- ✅ Decode 阶段 KV 读取
- ✅ TP 通信效率（`2*(N-1)/N` all-reduce 系数）
- ✅ Roofline 带宽/算力上限

### 10.2 经验系数（需实测校准）

这些基于有限样本，不同场景可能有较大偏差：

- ⚠️ **框架效率区间** (`decode/prefill` 系数)
  - 受模型规模、batch size、序列长度、硬件架构影响
  - 当前值基于验证报告更新，但仍需更多数据
  
- ⚠️ **Flash Attention 加速区间**
  - 基于实测，非理论上限
  - 受具体实现、硬件、序列长度影响
  
- ⚠️ **系统开销** (`1~5GB` 动态范围)
  - 受框架、驱动、并发模式影响
  
- ⚠️ **TTFT batch 系数** (`* batch` 最坏情况)
  - 实际调度可能更优（continuous batching）

### 10.3 已知局限

- ❌ **超大规模跨节点 MoE** (如 DeepSeek R1 671B)
  - 当前公式不适用，需专项建模
  
- ❌ **特殊硬件架构** (如 DGX Spark)
  - 需要专门的效率系数
  
- ❌ **极端 batch size** (>100)
  - 框架调度开销未建模

### 10.4 UI 行为说明

**VramCard 量化矩阵状态列**（三态）：
- ✓ X%：显存充足，显示利用率
- ⚡ X.X GB：显存不足，但 MoE 模型可通过 CPU 卸载运行，显示卸载后 GPU 显存占用（琥珀色）
- ✗ OOM：显存不足且无法卸载（红色）

**SpeedCard OOM 处理**：
- 当 `!result.vramOk` 时，隐藏速度评级徽章，显示红色 OOM banner，注明速度值为理论值不可实际运行

**exportMd.js 报告**：
- 推测解码（Speculative Decoding）参数单独成行输出
- VRAM 表增加 `activationGB` 行（当 >0 时）
- 速度区块 OOM 时添加 `⚠️ VRAM insufficient` 注释行
- 量化矩阵 MoE OOM 行显示 `⚡ X.X GB (offloadable)` 或 `❌ OOM`

---

## 11. 建议阅读顺序

### 新手入门

1. **[README.md](./README.md)** - 了解项目定位和功能
2. **本文档 1-4 节** - 理解输入输出和数据结构
3. **[src/App.vue](./src/App.vue)** - 看状态如何汇总进 `calcAll()`
4. **在线工具** - 实际操作，观察结果变化

### 深入理解

5. **[src/utils/calc.js](./src/utils/calc.js)** - 核心计算逻辑（300+ 行，含详细注释）
6. **本文档 5-8 节** - 详细公式推导
7. **[src/utils/model.js](./src/utils/model.js)** - Attention 类型推断
8. **[src/components/result/](./src/components/result/)** - 结果展示组件

### 二次开发

9. **[src/data/gpus/](./src/data/gpus/)** - GPU 数据结构
10. **[src/data/models/](./src/data/models/)** - 模型数据结构
11. **[scripts/](./scripts/)** - 数据验证脚本
12. **[src/utils/exportMd.js](./src/utils/exportMd.js)** - Markdown 报告生成

---

## 12. 学习声明

这是一个**学习参考项目**，不是生产基准测试系统。

### ✅ 适合用于

- 学习推理性能建模原理
- 理解 Roofline 模型在 LLM 推理中的应用
- 快速对比不同配置的理论性能
- 作为二次开发的起点

### ⚠️ 使用注意

- 结果用于**趋势分析**，不是精确承诺
- 框架效率系数基于有限样本，需实测校准
- 真正上线前，**务必用实际压测验证**
- 不同场景（batch size、序列长度、并发模式）可能有较大偏差

### 🚫 禁止事项

**傻逼公司禁止学习。**

---
