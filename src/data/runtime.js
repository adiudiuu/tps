export const KV_CACHE_MAP = [
  { id: 'auto', label: 'Auto', bytes: null },
  { id: 'fp16', label: 'FP16', bytes: 2.0 },
  { id: 'fp8', label: 'FP8', bytes: 1.0 },
  { id: 'int8', label: 'INT8', bytes: 1.0 },
  { id: 'int4', label: 'INT4', bytes: 0.5 },
]

export const PREFIX_CACHE_OPTIONS = [0, 25, 50, 75, 90]

// PCIe bandwidth presets for MoE CPU offload mode
export const PCIE_BW_OPTIONS = [
  { id: 'gen3', label: 'PCIe 3.0', bw: 16 },
  { id: 'gen4', label: 'PCIe 4.0', bw: 32 },
  { id: 'gen5', label: 'PCIe 5.0', bw: 64 },
]
