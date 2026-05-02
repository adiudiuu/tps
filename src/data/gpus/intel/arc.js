// Intel Arc 独立显卡（Alchemist 2022-2023 / Battlemage 2024-2026）
// 数据来源：Intel 官方规格 / TechPowerUp
// bf16 = FP16 half precision TFLOPS（Xe2 架构 XMX 矩阵引擎，2:1 ratio）
// int8 = INT8 TOPS（XMX 引擎，2× FP16）
// Arc B770 consumer 版已取消（2025-06 报道），改为 Arc Pro B70（AI 工作站版，2026-03 发布）
export default [
  // ── Battlemage（2024-2026）──────────────────────────────
  // 桌面 Pro
  // Arc Pro B70：BMG-G31 die，32 Xe2 cores，32GB GDDR6，256-bit，608 GB/s，FP32=22.9 TFLOPS，TDP=230W
  // 来源：Intel 官方规格页 + MSN/videocardz 报道
  { id: 'arc_pro_b70', name: 'Arc Pro B70',  vendor: 'intel', tier: 'consumer', released: '2026-03', vram: 32, bw: 608, bwUtilization: 0.80, bf16: 46, int8: 92, int4: null, nvlink_bw: null, tdp: 230 },
  // 桌面 Consumer
  // Arc B580：20 Xe2 cores，12GB GDDR6，192-bit，456 GB/s，FP16=27.3 TFLOPS，TDP=190W
  { id: 'arc_b580',  name: 'Arc B580',  vendor: 'intel', tier: 'consumer', released: '2024-12', vram: 12, bw: 456, bwUtilization: 0.80, bf16: 27, int8: 55, int4: null, nvlink_bw: null, tdp: 190 },
  // Arc B570：16 Xe2 cores，10GB GDDR6，160-bit，380 GB/s，FP16=22.4 TFLOPS，TDP=150W
  { id: 'arc_b570',  name: 'Arc B570',  vendor: 'intel', tier: 'consumer', released: '2025-01', vram: 10, bw: 380, bwUtilization: 0.80, bf16: 22, int8: 45, int4: null, nvlink_bw: null, tdp: 150 },
  // ── Alchemist（2022-2023）─────────────────────────
  // 桌面
  { id: 'arc_a770',  name: 'Arc A770',  vendor: 'intel', tier: 'consumer', released: '2022-10', vram: 16, bw: 560, bwUtilization: 0.80, bf16: 35, int8: 70, int4: null, nvlink_bw: null, tdp: 225 },
  { id: 'arc_a750',  name: 'Arc A750',  vendor: 'intel', tier: 'consumer', released: '2022-10', vram: 8,  bw: 512, bwUtilization: 0.80, bf16: 29, int8: 59, int4: null, nvlink_bw: null, tdp: 225 },
  { id: 'arc_a580',  name: 'Arc A580',  vendor: 'intel', tier: 'consumer', released: '2023-10', vram: 8,  bw: 512, bwUtilization: 0.80, bf16: 22, int8: 44, int4: null, nvlink_bw: null, tdp: 185 },
  { id: 'arc_a380',  name: 'Arc A380',  vendor: 'intel', tier: 'consumer', released: '2022-06', vram: 6,  bw: 186, bwUtilization: 0.80, bf16: 8,  int8: 16, int4: null, nvlink_bw: null, tdp: 75  },
  // 笔记本
  { id: 'arc_a770m', name: 'Arc A770M', vendor: 'intel', tier: 'consumer', released: '2022-10', vram: 16, bw: 448, bwUtilization: 0.80, bf16: 28, int8: 56, int4: null, nvlink_bw: null, tdp: 150 },
  { id: 'arc_a550m', name: 'Arc A550M', vendor: 'intel', tier: 'consumer', released: '2022-10', vram: 8,  bw: 320, bwUtilization: 0.80, bf16: 20, int8: 40, int4: null, nvlink_bw: null, tdp: 60  },
  { id: 'arc_a370m', name: 'Arc A370M', vendor: 'intel', tier: 'consumer', released: '2022-10', vram: 4,  bw: 186, bwUtilization: 0.80, bf16: 8,  int8: 16, int4: null, nvlink_bw: null, tdp: 35  },
]
