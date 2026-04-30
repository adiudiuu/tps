export const KV_CACHE_MAP = [
  { id: 'auto', label: 'Auto', bytes: null },
  { id: 'fp16', label: 'FP16', bytes: 2.0 },
  { id: 'fp8', label: 'FP8', bytes: 1.0 },
  { id: 'int8', label: 'INT8', bytes: 1.0 },
  { id: 'int4', label: 'INT4', bytes: 0.5 },
]

export const PREFIX_CACHE_OPTIONS = [0, 25, 50, 75, 90]

// PCIe bandwidth presets for MoE CPU offload mode
// bw = x16 单向理论峰值 (GB/s)：gen3=16, gen4=32, gen5=64
// calc.js 中除以 2 折算为 x8 实际单向带宽（台式机主流接口，如 RTX 4060）
export const PCIE_BW_OPTIONS = [
  { id: 'gen3', label: 'PCIe 3.0', bw: 16 },  // x16 单向峰值 16 GB/s → x8 实际 8 GB/s
  { id: 'gen4', label: 'PCIe 4.0', bw: 32 },  // x16 单向峰值 32 GB/s → x8 实际 16 GB/s
  { id: 'gen5', label: 'PCIe 5.0', bw: 64 },  // x16 单向峰值 64 GB/s → x8 实际 32 GB/s
]
