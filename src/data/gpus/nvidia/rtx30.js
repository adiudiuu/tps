// RTX 30 系列（Ampere，2020-2022）
// 数据来源：NVIDIA 官方规格 / TechPowerUp
export default [
  // 桌面
  { id: 'rtx3090ti',        name: 'RTX 3090 Ti',        vendor: 'nvidia', tier: 'consumer', released: '2022-01', vram: 24, bw: 1008, bf16: 80,  int8: 160, int4: 320, nvlink_bw: null, tdp: 450 },
  { id: 'rtx3090',          name: 'RTX 3090',           vendor: 'nvidia', tier: 'consumer', released: '2020-09', vram: 24, bw: 936,  bf16: 71,  int8: 142, int4: 284, nvlink_bw: null, tdp: 350 },
  { id: 'rtx3080ti',        name: 'RTX 3080 Ti',        vendor: 'nvidia', tier: 'consumer', released: '2021-06', vram: 12, bw: 912,  bf16: 68,  int8: 136, int4: 272, nvlink_bw: null, tdp: 350 },
  { id: 'rtx3080_12g',      name: 'RTX 3080 12GB',      vendor: 'nvidia', tier: 'consumer', released: '2022-01', vram: 12, bw: 912,  bf16: 68,  int8: 136, int4: 272, nvlink_bw: null, tdp: 350 },
  { id: 'rtx3080',          name: 'RTX 3080',           vendor: 'nvidia', tier: 'consumer', released: '2020-09', vram: 10, bw: 760,  bf16: 60,  int8: 119, int4: 238, nvlink_bw: null, tdp: 320 },
  { id: 'rtx3070ti',        name: 'RTX 3070 Ti',        vendor: 'nvidia', tier: 'consumer', released: '2021-06', vram: 8,  bw: 608,  bf16: 43,  int8: 87,  int4: 174, nvlink_bw: null, tdp: 290 },
  { id: 'rtx3070',          name: 'RTX 3070',           vendor: 'nvidia', tier: 'consumer', released: '2020-10', vram: 8,  bw: 448,  bf16: 40,  int8: 80,  int4: 160, nvlink_bw: null, tdp: 220 },
  { id: 'rtx3060ti',        name: 'RTX 3060 Ti',        vendor: 'nvidia', tier: 'consumer', released: '2020-12', vram: 8,  bw: 448,  bf16: 32,  int8: 65,  int4: 130, nvlink_bw: null, tdp: 200 },
  { id: 'rtx3060',          name: 'RTX 3060',           vendor: 'nvidia', tier: 'consumer', released: '2021-02', vram: 12, bw: 360,  bf16: 25,  int8: 51,  int4: 102, nvlink_bw: null, tdp: 170 },
  { id: 'rtx3050',          name: 'RTX 3050',           vendor: 'nvidia', tier: 'consumer', released: '2022-01', vram: 8,  bw: 224,  bf16: 18,  int8: 36,  int4: 72,  nvlink_bw: null, tdp: 130 },
  { id: 'rtx3050_6g',       name: 'RTX 3050 6GB',       vendor: 'nvidia', tier: 'consumer', released: '2023-01', vram: 6,  bw: 168,  bf16: 14,  int8: 28,  int4: 56,  nvlink_bw: null, tdp: 70  },
  // 笔记本
  { id: 'rtx3080ti_laptop', name: 'RTX 3080 Ti Laptop', vendor: 'nvidia', tier: 'consumer', released: '2022-01', vram: 16, bw: 512,  bf16: 46,  int8: 92,  int4: 184, nvlink_bw: null, tdp: 150 },
  { id: 'rtx3080_laptop',   name: 'RTX 3080 Laptop',    vendor: 'nvidia', tier: 'consumer', released: '2021-01', vram: 16, bw: 512,  bf16: 46,  int8: 92,  int4: 184, nvlink_bw: null, tdp: 150 },
  { id: 'rtx3070ti_laptop', name: 'RTX 3070 Ti Laptop', vendor: 'nvidia', tier: 'consumer', released: '2022-01', vram: 8,  bw: 384,  bf16: 37,  int8: 74,  int4: 148, nvlink_bw: null, tdp: 125 },
  { id: 'rtx3070_laptop',   name: 'RTX 3070 Laptop',    vendor: 'nvidia', tier: 'consumer', released: '2021-01', vram: 8,  bw: 384,  bf16: 29,  int8: 58,  int4: 116, nvlink_bw: null, tdp: 125 },
  { id: 'rtx3060_laptop',   name: 'RTX 3060 Laptop',    vendor: 'nvidia', tier: 'consumer', released: '2021-01', vram: 6,  bw: 336,  bf16: 20,  int8: 40,  int4: 80,  nvlink_bw: null, tdp: 115 },
  { id: 'rtx3050ti_laptop', name: 'RTX 3050 Ti Laptop', vendor: 'nvidia', tier: 'consumer', released: '2021-06', vram: 4,  bw: 192,  bf16: 11,  int8: 22,  int4: 44,  nvlink_bw: null, tdp: 60  },
  { id: 'rtx3050_laptop',   name: 'RTX 3050 Laptop',    vendor: 'nvidia', tier: 'consumer', released: '2021-06', vram: 4,  bw: 192,  bf16: 9,   int8: 18,  int4: 36,  nvlink_bw: null, tdp: 60  },
]
