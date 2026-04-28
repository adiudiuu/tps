// RTX 40 系列（Ada Lovelace，2022-2024）
// 数据来源：NVIDIA 官方规格 / TechPowerUp
export default [
  // 桌面
  { id: 'rtx4090',          name: 'RTX 4090',           vendor: 'nvidia', tier: 'consumer', released: '2022-10', vram: 24, bw: 1008, bf16: 165, int8: 330, int4: 661, nvlink_bw: null, tdp: 450 },
  { id: 'rtx4080s',         name: 'RTX 4080 SUPER',     vendor: 'nvidia', tier: 'consumer', released: '2024-01', vram: 16, bw: 736,  bf16: 104, int8: 208, int4: 416, nvlink_bw: null, tdp: 320 },
  { id: 'rtx4080',          name: 'RTX 4080',           vendor: 'nvidia', tier: 'consumer', released: '2022-11', vram: 16, bw: 717,  bf16: 97,  int8: 194, int4: 388, nvlink_bw: null, tdp: 320 },
  { id: 'rtx4070tis',       name: 'RTX 4070 Ti SUPER',  vendor: 'nvidia', tier: 'consumer', released: '2024-01', vram: 16, bw: 672,  bf16: 88,  int8: 176, int4: 352, nvlink_bw: null, tdp: 285 },
  { id: 'rtx4070ti',        name: 'RTX 4070 Ti',        vendor: 'nvidia', tier: 'consumer', released: '2023-01', vram: 12, bw: 672,  bf16: 80,  int8: 160, int4: 320, nvlink_bw: null, tdp: 285 },
  { id: 'rtx4070s',         name: 'RTX 4070 SUPER',     vendor: 'nvidia', tier: 'consumer', released: '2024-01', vram: 12, bw: 504,  bf16: 71,  int8: 142, int4: 284, nvlink_bw: null, tdp: 220 },
  { id: 'rtx4070',          name: 'RTX 4070',           vendor: 'nvidia', tier: 'consumer', released: '2023-04', vram: 12, bw: 504,  bf16: 58,  int8: 116, int4: 233, nvlink_bw: null, tdp: 200 },
  { id: 'rtx4060ti_16g',    name: 'RTX 4060 Ti 16GB',   vendor: 'nvidia', tier: 'consumer', released: '2023-07', vram: 16, bw: 288,  bf16: 45,  int8: 90,  int4: 181, nvlink_bw: null, tdp: 165 },
  { id: 'rtx4060ti',        name: 'RTX 4060 Ti',        vendor: 'nvidia', tier: 'consumer', released: '2023-05', vram: 8,  bw: 288,  bf16: 45,  int8: 90,  int4: 181, nvlink_bw: null, tdp: 160 },
  { id: 'rtx4060',          name: 'RTX 4060',           vendor: 'nvidia', tier: 'consumer', released: '2023-06', vram: 8,  bw: 272,  bf16: 30,  int8: 60,  int4: 121, nvlink_bw: null, tdp: 115 },
  // 笔记本
  { id: 'rtx4090_laptop',   name: 'RTX 4090 Laptop',    vendor: 'nvidia', tier: 'consumer', released: '2023-01', vram: 16, bw: 576,  bf16: 82,  int8: 165, int4: 330, nvlink_bw: null, tdp: 150 },
  { id: 'rtx4080_laptop',   name: 'RTX 4080 Laptop',    vendor: 'nvidia', tier: 'consumer', released: '2023-01', vram: 12, bw: 432,  bf16: 58,  int8: 116, int4: 233, nvlink_bw: null, tdp: 150 },
  { id: 'rtx4070_laptop',   name: 'RTX 4070 Laptop',    vendor: 'nvidia', tier: 'consumer', released: '2023-01', vram: 8,  bw: 336,  bf16: 40,  int8: 80,  int4: 161, nvlink_bw: null, tdp: 115 },
  { id: 'rtx4060_laptop',   name: 'RTX 4060 Laptop',    vendor: 'nvidia', tier: 'consumer', released: '2023-01', vram: 8,  bw: 272,  bf16: 30,  int8: 60,  int4: 121, nvlink_bw: null, tdp: 115 },
  { id: 'rtx4050_laptop',   name: 'RTX 4050 Laptop',    vendor: 'nvidia', tier: 'consumer', released: '2023-01', vram: 6,  bw: 192,  bf16: 19,  int8: 38,  int4: 76,  nvlink_bw: null, tdp: 60  },
]
