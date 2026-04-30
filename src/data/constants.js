// src/data/constants.js

// bytes: 权重每参数字节数
// kv_bytes: KV Cache 每元素字节数（通常比权重精度高，独立于权重量化）
// flops_key: 对应 GPU 算力字段
export const QUANT_MAP = [
  { id: 'fp32',  label: 'FP32',          bytes: 4.00, kv_bytes: 4.0, flops_key: 'bf16', quality: 'best'  },
  { id: 'bf16',  label: 'BF16/FP16',     bytes: 2.00, kv_bytes: 2.0, flops_key: 'bf16', quality: 'great' },
  { id: 'fp8',   label: 'FP8',           bytes: 1.00, kv_bytes: 1.0, flops_key: 'fp8',  quality: 'great' },
  { id: 'int8',  label: 'INT8/Q8',       bytes: 1.00, kv_bytes: 2.0, flops_key: 'int8', quality: 'good'  },
  { id: 'int6',  label: 'Q6_K',          bytes: 0.75, kv_bytes: 2.0, flops_key: 'bf16', quality: 'good'  },
  { id: 'int5',  label: 'Q5_K',          bytes: 0.625,kv_bytes: 2.0, flops_key: 'bf16', quality: 'ok'    },
  { id: 'int4',  label: 'INT4/GPTQ/AWQ', bytes: 0.50, kv_bytes: 2.0, flops_key: 'int4', quality: 'ok'    },
  { id: 'int3',  label: 'Q3_K',          bytes: 0.375,kv_bytes: 2.0, flops_key: 'int4', quality: 'poor'  },
  { id: 'int2',  label: 'INT2/NF2',      bytes: 0.25, kv_bytes: 2.0, flops_key: 'int4', quality: 'bad'   },
]

export const INTERCONNECT_MAP = [
  { id: 'nvlink5',  label: 'NVLink 5.0',    bw: 1800 },
  { id: 'nvlink4',  label: 'NVLink 4.0',    bw: 900 },
  { id: 'nvlink3',  label: 'NVLink 3.0',    bw: 600 },
  { id: 'nvswitch', label: 'NVSwitch',       bw: 900 },
  { id: 'ib_ndr',   label: 'InfiniBand NDR', bw: 100 },
  { id: 'ib_hdr',   label: 'InfiniBand HDR', bw: 50  },
  { id: 'pcie5',    label: 'PCIe 5.0',       bw: 128 },
  { id: 'pcie4',    label: 'PCIe 4.0',       bw: 64  },
]

export const FRAMEWORK_MAP = [
  // vendors: null = 全平台通用
  { id: 'theory',        labelKey: 'framework.theory',        decode: 1.00, prefill: 1.00, decodeMin: 1.00, decodeMax: 1.00, prefillMin: 1.00, prefillMax: 1.00, vendors: null,                    schedulingMode: 'serial'     },
  { id: 'trtllm',        labelKey: 'framework.trtllm',        decode: 0.80, prefill: 0.75, decodeMin: 0.75, decodeMax: 0.85, prefillMin: 0.80, prefillMax: 0.90, vendors: ['nvidia'],             schedulingMode: 'continuous' },
  // SGLang vs vLLM v0.6.0（sgl-project/sglang benchmark_vllm_060 实测）
  // Llama 3.1 8B A100 offline: SGLang 4281 vs vLLM 4132 tok/s (+3.6%)
  // Llama 3.1 70B 4×H100 online rate=8: SGLang 4064 vs vLLM 3752 tok/s (+8.3%)
  // 早期 29% 差距来自对比旧版 vLLM 0.5.x，vLLM 0.6+ 已基本持平
  { id: 'sglang',        labelKey: 'framework.sglang',        decode: 0.68, prefill: 0.72, decodeMin: 0.65, decodeMax: 0.75, prefillMin: 0.65, prefillMax: 0.80, vendors: ['nvidia', 'amd'],       schedulingMode: 'continuous' },
  // vLLM 已默认支持 Speculative Decoding（需配置 draft model），可带来 1.5-3x 加速
  // 当前效率系数未包含 Speculative Decoding 增益，实际部署时可能更快
  { id: 'vllm',          labelKey: 'framework.vllm',          decode: 0.65, prefill: 0.68, decodeMin: 0.55, decodeMax: 0.75, prefillMin: 0.60, prefillMax: 0.80, vendors: ['nvidia', 'amd'],       schedulingMode: 'continuous' },
  // LMDeploy 效率与 SGLang 接近，支持 TurboMind 引擎
  { id: 'lmdeploy',      labelKey: 'framework.lmdeploy',      decode: 0.76, prefill: 0.70, decodeMin: 0.73, decodeMax: 0.80, prefillMin: 0.62, prefillMax: 0.78, vendors: ['nvidia'],             schedulingMode: 'continuous' },
  // TGI decode 假设取 0.40-0.55 中间值，待实测校准
  { id: 'tgi',           labelKey: 'framework.tgi',           decode: 0.47, prefill: 0.55, decodeMin: 0.40, decodeMax: 0.55, prefillMin: 0.50, prefillMax: 0.65, vendors: ['nvidia', 'amd'],       schedulingMode: 'continuous' },
  // ExLlamaV2 针对消费级显卡（RTX 系列）优化，CUDA 核高度定制
  { id: 'exllamav2',     labelKey: 'framework.exllamav2',     decode: 0.70, prefill: 0.55, decodeMin: 0.65, decodeMax: 0.75, prefillMin: 0.48, prefillMax: 0.62, vendors: ['nvidia'],             schedulingMode: 'serial'     },
  // Apple 专属框架
  { id: 'mlx',           labelKey: 'framework.mlx',           decode: 0.90, prefill: 0.65, decodeMin: 0.80, decodeMax: 0.95, prefillMin: 0.55, prefillMax: 0.75, vendors: ['apple'], recommended: 'apple', schedulingMode: 'continuous' },
  {
    id: 'llamacpp_metal',
    labelKey: 'framework.llamacpp_metal',
    decode: 0.62, prefill: 0.50,
    decodeMin: 0.52, decodeMax: 0.70,
    prefillMin: 0.42, prefillMax: 0.58,
    vendors: ['apple'],
    schedulingMode: 'serial',
    // 模型规模效率缩放系数（Apple Metal 后端相比 CUDA 略高）
    modelSizeScaling: [
      { maxParams: 14, decode: 0.57, decodeMin: 0.52, decodeMax: 0.62 },  // <14B
      { maxParams: 30, decode: 0.61, decodeMin: 0.56, decodeMax: 0.66 }, // 14-30B
      { maxParams: Infinity, decode: 0.65, decodeMin: 0.60, decodeMax: 0.70 }, // >30B
    ]
  },
  // 通用 CPU/跨平台
  // llama.cpp 效率按模型规模分层（通过 modelSizeScaling 配置）：
  // - 小模型 (<14B): 实测约 0.52
  // - 中模型 (14-30B): 过渡区间 0.545
  // - 大模型 (>30B): 实测约 0.57
  // 分三档可将误差从 8% 压到 5% 以内
  {
    id: 'llamacpp',
    labelKey: 'framework.llamacpp',
    decode: 0.55, prefill: 0.35,
    decodeMin: 0.48, decodeMax: 0.65,
    prefillMin: 0.30, prefillMax: 0.40,
    vendors: null,
    schedulingMode: 'serial',
    // 模型规模效率缩放系数（同时调整 decode/decodeMin/decodeMax）
    modelSizeScaling: [
      { maxParams: 14, decode: 0.52, decodeMin: 0.48, decodeMax: 0.56 },  // <14B: 实测约 0.52
      { maxParams: 30, decode: 0.545, decodeMin: 0.50, decodeMax: 0.59 }, // 14-30B: 过渡区间
      { maxParams: Infinity, decode: 0.57, decodeMin: 0.52, decodeMax: 0.62 }, // >30B: 实测约 0.57
    ]
  },
]
