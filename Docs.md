# TPS Calculator 算法文档

> 这份文档只讲当前仓库里已经实现的算法和数据流。  
> 代码优先，文档跟着真实实现走，适合作为学习参考和二次修改入口。

项目入口：
- [src/App.vue](./src/App.vue)
- [src/utils/calc.js](./src/utils/calc.js)
- [src/utils/model.js](./src/utils/model.js)
- [src/data/constants.js](./src/data/constants.js)
- [src/data/runtime.js](./src/data/runtime.js)

## 1. 目标

给定以下输入，估算一组偏保守的推理结果：

- GPU 型号、数量、互联方式
- 模型结构参数
- 权重量化方式
- 上下文长度、并发数、Prompt 长度、输出长度
- 推理框架效率区间
- Flash Attention、KV Cache 量化、Prefix Cache 命中率

当前工具输出的核心指标：

- 显存需求：权重、KV Cache、系统开销、是否 OOM
- Decode 速度：带宽上限、实际吞吐、单请求速度
- Prefill 速度：算力上限、实际吞吐、瓶颈判断
- 延迟：TTFT、TPOT、总时延
- Roofline 比和 TP 通信效率

## 2. 数据来源

实现里主要有 4 类数据：

1. GPU 数据  
   文件：[src/data/gpus.js](./src/data/gpus.js)

2. 模型数据  
   文件：[src/data/models/index.js](./src/data/models/index.js) 及各模型目录

3. 框架效率常量  
   文件：[src/data/constants.js](./src/data/constants.js)

4. 运行时附加参数  
   文件：[src/data/runtime.js](./src/data/runtime.js)

这些数据最终都会进入 [calcAll()](./src/utils/calc.js)。

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

实现位置：[src/utils/calc.js](./src/utils/calc.js)

### 5.1 权重显存

```js
weightGB = model.params * quant.bytes
```

### 5.2 KV Cache 显存

标准模型：

```js
kvGB = 2 * layers * kv_heads * head_dim * ctx * batch * kvBytesPerElem / 1e9
```

混合注意力模型（有 `sliding_window` + `local_layers`）：

```js
kvGB = 2 * batch * kvBytesPerElem * (
  globalLayers * globalKvHeads * globalHeadDim * ctx +
  local_layers * kv_heads * head_dim * min(ctx, sliding_window)
) / 1e9
```

- `kvBytesPerElem` 优先取用户选择的 KV Cache 量化精度，否则取量化项的 `kv_bytes`，默认 2.0（FP16）
- 如果模型带 `mla_ratio`，继续乘上压缩系数

### 5.3 系统开销

```js
overheadGB = weightGB * 0.05
```

固定 5% 经验项，覆盖 CUDA context、临时 buffer、激活等。

### 5.4 总显存需求

```js
totalNeeded = weightGB + kvGB + overheadGB
totalVram   = gpu.vram * gpuCount
```

## 6. Decode 速度

### 6.1 有效权重读取

```js
activeWeight = model.type === 'moe'
  ? model.active_params * quant.bytes
  : weightGB
```

### 6.2 Decode 阶段 KV 读取

```js
avgDecodeSeqLen = min(ctx, promptLen + outputLen / 2)
kvReadGB = 2 * layers * kv_heads * head_dim * avgDecodeSeqLen * batch * kvBytesPerElem / 1e9
```

混合注意力模型同样按 global/local 分层计算。`mla_ratio` 同步压缩。

### 6.3 带宽上限

```js
decodeBytesPerStep = activeWeight + kvReadGB
bwLimit = (effectiveBw / decodeBytesPerStep) * batch
```

`effectiveBw` 在 MoE CPU Offload 模式下取 PCIe 带宽，否则取 `gpu.bw * gpuCount`。

### 6.4 框架效率区间

`FRAMEWORK_MAP` 为每个框架提供 `decode / decodeMin / decodeMax`：

```js
decodeToks    = bwLimit * framework.decode
decodeToksMin = bwLimit * decodeFactorMin
decodeToksMax = bwLimit * decodeFactorMax
```

### 6.5 TP 通信效率

多卡时计算 all-reduce 开销，系数修正为 `2*(N-1)/N`（环形 all-reduce 实际传输量）：

```js
commBytesPerLayer   = 2 * hidden_size * batch * 2 * (gpuCount - 1) / gpuCount
commLatencyPerLayer = commBytesPerLayer / (interconnect.bw * 1e9) * 1000  // ms
computePerLayer     = tpot / model.layers
tpEfficiency        = computePerLayer / (computePerLayer + commLatencyPerLayer)
```

最终：

```js
effectiveToks = decodeToks * tpEfficiency
singleToks    = effectiveToks / batch
```

## 7. Prefill 速度

### 7.1 Prefix Cache 对有效 Prompt 的影响

```js
effectivePromptLen = round(promptLen * (1 - prefixHitRatio))
```

Prefix Cache 不影响 decode tok/s，只影响 prefill 和 TTFT。

### 7.2 参数主干算力上限

```js
activeParams     = model.type === 'moe' ? model.active_params : model.params
computeBaseLimit = (tflops * 1e12) / (2 * activeParams * 1e9 * effectivePromptLen)
```

### 7.3 prefillAttentionFactor

当前固定为 `1`。

GQA/MQA 的 Q/KV head 比例已经体现在 `2 * activeParams * promptLen` 的主干 FLOPs 里，不再额外放大，避免 MQA 模型（如 Llama 3 70B，kvHeads=1）被错误放大 64x。

### 7.4 Flash Attention 加速区间

```js
getFlashAttentionBoostRange({ enabled, promptLen })
```

当前阈值（基于实测，非理论上限）：

| prompt 长度     | min | mid | max |
|----------------|-----|-----|-----|
| ≥ 32768        | 2x  | 3x  | 4x  |
| ≥ 8192         | 3x  | 4x  | 5x  |
| ≥ 2048         | 2x  | 2.5x| 3x  |
| 其他            | 1.5x| 1.75x| 2x |

关闭 Flash Attention 时固定返回 `1x`。

### 7.5 Prefill 吞吐

```js
computeLimit  = computeBaseLimit * prefillAttentionFactor * flashFactor  // flashFactor = mid
prefillToks   = computeLimit * framework.prefill
prefillToksMin = computeBaseLimit * prefillFactorMin * prefillAttentionFactor * flashRange.min
prefillToksMax = computeBaseLimit * prefillFactorMax * prefillAttentionFactor * flashRange.max
```

### 7.6 TTFT

```js
ttft = (effectivePromptLen * 2 * activeParams * 1e9) / (tflops * 1e12)
       * 1000
       / (prefillAttentionFactor * flashFactor)
       * Math.max(1, batch)
```

`* batch` 项反映多并发时新请求需要排队等待前面 prefill 完成的最坏情况延迟。

## 8. Roofline 与瓶颈判断

```js
roofline   = computeLimit / bwLimit
bottleneck = roofline > 1 ? 'bandwidth' : 'compute'
```

- `roofline > 1`：先撞带宽墙 → 带宽瓶颈
- `roofline < 1`：先撞算力墙 → 算力瓶颈

## 9. 告警规则

实现位置：`getWarnings()` in [src/utils/calc.js](./src/utils/calc.js)

| 条件 | 级别 | key |
|------|------|-----|
| 显存不足 | error | `vram_oom` |
| 显存利用率 > 95% | warn | `vram_high` |
| TP 通信效率 < 70% | warn | `tp_comm` |
| 单请求速度 < 20 tok/s | warn | `slow_single` |
| roofline > 10 | info | `bw_bottleneck` |
| 总功耗 > 10 kW | info | `high_power` |

## 10. 哪些是硬公式，哪些是经验系数

更接近结构公式的部分：

- 权重显存
- KV Cache 显存（含混合注意力分层）
- Decode 阶段 KV 读取
- TP 通信效率（`2*(N-1)/N` all-reduce 系数）

明显带经验性的部分：

- 框架效率区间
- Flash Attention 的区间增益
- 5% 系统开销
- TTFT 排队系数（`* batch` 为最坏情况近似）

## 11. 建议阅读顺序

1. [src/App.vue](./src/App.vue) — 状态如何汇总进 `calcAll()`
2. [src/utils/calc.js](./src/utils/calc.js) — 所有结果字段从哪里来
3. [src/utils/model.js](./src/utils/model.js) — attention 类型如何推断
4. [src/components/result/SpeedCard.vue](./src/components/result/SpeedCard.vue) — 结果展示了哪些中间量
5. [src/data/models/](./src/data/models) — 模型元数据结构

## 12. 学习声明

这是一个学习参考项目，不是生产基准测试系统。

- 欢迎学习、讨论、改公式、改数据
- 欢迎把它当成推理性能建模练手项目
- 真正上线前，结果请用实际压测校验

傻逼公司禁止学习。
