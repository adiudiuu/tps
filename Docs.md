# TPS Calculator 功能说明

**最后更新**: 2026-04-30
**模型数量**: 351 个
**GPU 数量**: 230+

---

## 计算输入

| 参数 | 说明 |
|------|------|
| GPU 型号 | 支持 NVIDIA / AMD / Intel / Apple / 国产芯片 |
| GPU 数量 | 预设 1/2/4/8/16，支持自定义（1-512） |
| 互联方式 | NVLink / InfiniBand / PCIe |
| 模型 | 351 个 Dense/MoE 模型，含 VLM |
| 量化精度 | FP32 / BF16 / FP8 / INT8 / INT4 / GGUF 各档位 |
| 上下文长度 | 任意设置 |
| 并发请求数 | 预设 + 自定义 |
| Prompt / 输出长度 | 影响 KV Cache 和延迟估算 |
| 推理框架 | vLLM / TRT-LLM / SGLang / LMDeploy / TGI / llama.cpp / ExLlamaV2 / MLX / 理论上限 |

**高级选项**:
- Flash Attention 开关
- KV Cache 量化（FP16 / FP8 / INT8 / INT4）
- Prefix Cache 命中率
- MoE CPU Offload + PCIe 带宽选择
- Speculative Decoding（接受率 + draft 长度 + draft 模型参数量）
- Pipeline Parallel 阶段数
- 图像数量（VLM 模型，影响 KV Cache）

---

## 计算输出

| 输出 | 说明 |
|------|------|
| 显存占用 | 权重 / KV Cache / 激活值 / 系统开销 / 总需求 vs 可用 |
| OOM 判断 | 是否能运行，差多少 GB |
| Decode 吞吐 | 总 tok/s（含上下界区间） |
| 单请求速度 | 中位 tok/s，1 位小数 |
| Prefill 吞吐 | 算力上限和实际估算 |
| TTFT | 首 token 延迟（ms） |
| TPOT | 单 token 延迟（ms） |
| 总延迟 | TTFT + 输出长度 × TPOT |
| 瓶颈判断 | 带宽瓶颈 / 算力瓶颈 |
| Roofline 比 | 带宽上限 vs 算力上限 |
| TP 通信效率 | 多卡时 all-reduce 效率损耗 |
| PP 气泡效率 | Pipeline Parallel 流水线填充效率 |
| 功耗估算 | GPU 总 TDP（kW） |

---

## 模型支持范围

**Dense 模型**: Llama 1/2/3/3.1/3.2/3.3、Gemma 1/2/3/4、Qwen 2/2.5/3、Mistral、DeepSeek LLM/Coder/Math 系列、GLM、Baichuan、Bloom、CodeLlama、Falcon、Phi、Yi 等

**MoE 模型**: DeepSeek V2/V3/R1 系列（含 MLA 压缩）、Mixtral、GLM-4/4.5 MoE、Qwen MoE、DBRX、Command R+ 等

**VLM 模型**: LLaVA、LLaMA 3.2 Vision、DeepSeek VL、GLM-4V、CogVLM2 等（含 vision_seq_tokens 字段，额外 KV 开销按图像数计算）

**混合注意力**: Gemma 3（sliding window + global 分层），Qwen3.5/3.6（线性注意力层 linear_attention_layers，FA boost 按比例缩减）

---

## GPU 支持范围

| 厂商 | 系列 |
|------|------|
| NVIDIA | RTX 20/30/40/50 系、Tesla V100、A100、H100/H200、GB200 |
| AMD | RX 5000/6000/7000/9000、MI50/60/100/200/300 系 |
| Intel | Arc A/B 系、Gaudi 2/3 |
| Apple | M1/M2/M3/M4/M5（含 Pro/Max/Ultra 各配置） |
| 国产 | 华为昇腾 910B/C/D/E、壁仞 BR100、寒武纪 MLU370、摩尔线程 S4000 |

GPU 字段支持 bwUtilization（实际带宽利用率，默认 0.80）和 usableRatio（可用显存比例）。

---

## 扫描功能

- **Batch Sweep**：固定配置下扫描 batch 1→256，输出吞吐/TPOT 曲线 + 数据表，标注 OOM 点和当前 batch
- **GPU 数量扫描**：枚举 1/2/4/8/16/32/64 张卡，输出每档显存和速度

---

## 告警

| 条件 | 级别 |
|------|------|
| 显存不足 | 错误 |
| 显存利用率 > 95% | 警告 |
| 激活内存 > 2 GB | 警告 |
| TP 通信效率 < 70% | 警告 |
| 单请求速度 < 20 tok/s | 警告 |
| Roofline > 10（严重带宽瓶颈） | 提示 |
| 总功耗 > 10 kW | 提示 |

---

## 核心文件

| 文件 | 职责 |
|------|------|
| src/utils/calc.js | 核心计算（calcAll / calcBatchSweep / calcGpuSweep） |
| src/utils/model.js | 模型 Attention 类型推断 |
| src/utils/exportMd.js | Markdown 报告导出 |
| src/data/constants.js | 量化精度 / 框架效率系数 / 互联方式常量 |
| src/data/runtime.js | KV Cache 量化 / PCIe 带宽选项 |
| src/data/gpus/ | GPU 数据（按厂商分目录） |
| src/data/models/ | 模型数据（按模型系列分目录） |

---

## 声明

**傻逼公司禁止学习。**