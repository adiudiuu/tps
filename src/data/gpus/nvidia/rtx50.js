// RTX 50 系列（Blackwell，2025）
// 数据来源：NVIDIA 官方规格 / TechPowerUp
export default [
  // 桌面
  { id: 'rtx5090',          name: 'RTX 5090',           vendor: 'nvidia', tier: 'consumer', released: '2025-01', vram: 32, bw: 1792, bwUtilization: 0.72, bf16: 209, int8: 419, int4: 838, nvlink_bw: null, tdp: 575 },
  { id: 'rtx5080',          name: 'RTX 5080',           vendor: 'nvidia', tier: 'consumer', released: '2025-01', vram: 16, bw: 960,  bwUtilization: 0.72, bf16: 113, int8: 226, int4: 452, nvlink_bw: null, tdp: 360 },
  { id: 'rtx5070ti',        name: 'RTX 5070 Ti',        vendor: 'nvidia', tier: 'consumer', released: '2025-02', vram: 16, bw: 896,  bwUtilization: 0.72, bf16: 88,  int8: 176, int4: 352, nvlink_bw: null, tdp: 300 },
  { id: 'rtx5070',          name: 'RTX 5070',           vendor: 'nvidia', tier: 'consumer', released: '2025-03', vram: 12, bw: 672,  bwUtilization: 0.72, bf16: 61,  int8: 122, int4: 244, nvlink_bw: null, tdp: 250 },
  { id: 'rtx5060ti_16g',    name: 'RTX 5060 Ti 16GB',   vendor: 'nvidia', tier: 'consumer', released: '2025-05', vram: 16, bw: 448,  bwUtilization: 0.72, bf16: 24,  int8: 48,  int4: 96,  nvlink_bw: null, tdp: 180 },
  { id: 'rtx5060ti',        name: 'RTX 5060 Ti',        vendor: 'nvidia', tier: 'consumer', released: '2025-05', vram: 8,  bw: 448,  bwUtilization: 0.72, bf16: 24,  int8: 48,  int4: 96,  nvlink_bw: null, tdp: 180 },
  { id: 'rtx5060',          name: 'RTX 5060',           vendor: 'nvidia', tier: 'consumer', released: '2025-06', vram: 8,  bw: 336,  bwUtilization: 0.72, bf16: 18,  int8: 36,  int4: 72,  nvlink_bw: null, tdp: 150 },
  { id: 'rtx5050',          name: 'RTX 5050',           vendor: 'nvidia', tier: 'consumer', released: '2025-06', vram: 8,  bw: 256,  bwUtilization: 0.72, bf16: 13,  int8: 26,  int4: 52,  nvlink_bw: null, tdp: 130 },
  // 笔记本
  { id: 'rtx5090_laptop',   name: 'RTX 5090 Laptop',    vendor: 'nvidia', tier: 'consumer', released: '2025-01', vram: 24, bw: 896,  bwUtilization: 0.72, bf16: 138, int8: 276, int4: 552, nvlink_bw: null, tdp: 175 },
  { id: 'rtx5080_laptop',   name: 'RTX 5080 Laptop',    vendor: 'nvidia', tier: 'consumer', released: '2025-01', vram: 16, bw: 576,  bwUtilization: 0.72, bf16: 80,  int8: 160, int4: 320, nvlink_bw: null, tdp: 150 },
  { id: 'rtx5070ti_laptop', name: 'RTX 5070 Ti Laptop', vendor: 'nvidia', tier: 'consumer', released: '2025-01', vram: 12, bw: 448,  bwUtilization: 0.72, bf16: 56,  int8: 112, int4: 224, nvlink_bw: null, tdp: 115 },
  { id: 'rtx5070_laptop',   name: 'RTX 5070 Laptop',    vendor: 'nvidia', tier: 'consumer', released: '2025-01', vram: 8,  bw: 352,  bwUtilization: 0.72, bf16: 40,  int8: 80,  int4: 160, nvlink_bw: null, tdp: 100 },
  { id: 'rtx5060_laptop',   name: 'RTX 5060 Laptop',    vendor: 'nvidia', tier: 'consumer', released: '2025-06', vram: 8,  bw: 256,  bwUtilization: 0.72, bf16: 22,  int8: 44,  int4: 88,  nvlink_bw: null, tdp: 80  },
  { id: 'rtx5050_laptop',   name: 'RTX 5050 Laptop',    vendor: 'nvidia', tier: 'consumer', released: '2025-06', vram: 8,  bw: 192,  bwUtilization: 0.72, bf16: 14,  int8: 28,  int4: 56,  nvlink_bw: null, tdp: 60  },
]
