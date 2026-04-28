// src/data/constants.js

// bytes: 权重每参数字节数
// kv_bytes: KV Cache 每元素字节数（通常比权重精度高，独立于权重量化）
// flops_key: 对应 GPU 算力字段
export const QUANT_MAP = [
  { id: 'fp32',  label: 'FP32',          bytes: 4.00, kv_bytes: 4.0, flops_key: 'bf16', quality: 'best'  },
  { id: 'bf16',  label: 'BF16/FP16',     bytes: 2.00, kv_bytes: 2.0, flops_key: 'bf16', quality: 'great' },
  { id: 'fp8',   label: 'FP8',           bytes: 1.00, kv_bytes: 1.0, flops_key: 'fp8',  quality: 'great' },
  { id: 'int8',  label: 'INT8/Q8',       bytes: 1.00, kv_bytes: 2.0, flops_key: 'int8', quality: 'good'  },
  { id: 'int6',  label: 'Q6_K',          bytes: 0.75, kv_bytes: 2.0, flops_key: 'int8', quality: 'good'  },
  { id: 'int5',  label: 'Q5_K',          bytes: 0.625,kv_bytes: 2.0, flops_key: 'int4', quality: 'ok'    },
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
  { id: 'theory',   labelKey: 'framework.theory',   decode: 1.00, prefill: 1.00, decodeMin: 1.00, decodeMax: 1.00, prefillMin: 1.00, prefillMax: 1.00 },
  { id: 'trtllm',   labelKey: 'framework.trtllm',   decode: 0.65, prefill: 0.75, decodeMin: 0.75, decodeMax: 0.85, prefillMin: 0.80, prefillMax: 0.90 },
  { id: 'vllm',     labelKey: 'framework.vllm',     decode: 0.60, prefill: 0.68, decodeMin: 0.55, decodeMax: 0.75, prefillMin: 0.60, prefillMax: 0.80 },
  { id: 'tgi',      labelKey: 'framework.tgi',      decode: 0.40, prefill: 0.55, decodeMin: 0.40, decodeMax: 0.55, prefillMin: 0.50, prefillMax: 0.65 },
  { id: 'llamacpp', labelKey: 'framework.llamacpp', decode: 0.28, prefill: 0.35, decodeMin: 0.25, decodeMax: 0.35, prefillMin: 0.30, prefillMax: 0.40 },
]
