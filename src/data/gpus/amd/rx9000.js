// AMD RX 9000 系列（RDNA 4，2025）
// 数据来源：AMD 官方规格页 / TechPowerUp
// bf16 = FP16 half precision TFLOPS（AMD 官方 FP32 × 2，与 RDNA 4 Matrix Cores 一致）
// int8/int4：AMD 消费卡无官方 TOPS 数据，填 null
export default [
  // Navi 48（256-bit，717 GB/s）
  { id: 'rx9070xt',            name: 'RX 9070 XT',          vendor: 'amd', tier: 'consumer', released: '2025-03', vram: 16, bw: 717, bwUtilization: 0.80, bf16: 82,  int8: null, int4: null, nvlink_bw: null, tdp: 304 },
  { id: 'rx9070',              name: 'RX 9070',             vendor: 'amd', tier: 'consumer', released: '2025-03', vram: 16, bw: 640, bwUtilization: 0.80, bf16: 73,  int8: null, int4: null, nvlink_bw: null, tdp: 220 },
  // Radeon AI PRO R9700：Navi 48 die，32GB GDDR6，专业 AI 推理卡
  { id: 'radeon_ai_pro_r9700', name: 'Radeon AI PRO R9700', vendor: 'amd', tier: 'consumer', released: '2025-05', vram: 32, bw: 640, bwUtilization: 0.80, bf16: 73,  int8: null, int4: null, nvlink_bw: null, tdp: 250 },
  // Navi 48 国行版（48 CU，192-bit，432 GB/s）
  { id: 'rx9070gre_16g',       name: 'RX 9070 GRE 16GB',   vendor: 'amd', tier: 'consumer', released: '2025-05', vram: 16, bw: 432, bwUtilization: 0.80, bf16: 69,  int8: null, int4: null, nvlink_bw: null, tdp: 200 },
  { id: 'rx9070gre_12g',       name: 'RX 9070 GRE 12GB',   vendor: 'amd', tier: 'consumer', released: '2025-05', vram: 12, bw: 432, bwUtilization: 0.80, bf16: 69,  int8: null, int4: null, nvlink_bw: null, tdp: 200 },
  // Navi 44（32 CU，128-bit，322 GB/s）
  // RX 9060 XT：FP32 = 25.6 TFLOPs（官方），FP16 = 51.2 TFLOPS，bw = 322 GB/s
  { id: 'rx9060xt_16g',        name: 'RX 9060 XT 16GB',    vendor: 'amd', tier: 'consumer', released: '2025-06', vram: 16, bw: 322, bwUtilization: 0.80, bf16: 51,  int8: null, int4: null, nvlink_bw: null, tdp: 160 },
  { id: 'rx9060xt',            name: 'RX 9060 XT',         vendor: 'amd', tier: 'consumer', released: '2025-06', vram: 8,  bw: 322, bwUtilization: 0.80, bf16: 51,  int8: null, int4: null, nvlink_bw: null, tdp: 150 },
  // RX 9060：FP32 = 21.4 TFLOPs（官方），FP16 = 42.8 TFLOPS，bw = 288 GB/s（20.1 Gbps × 128-bit / 8）
  { id: 'rx9060',              name: 'RX 9060',             vendor: 'amd', tier: 'consumer', released: '2025-08', vram: 8,  bw: 288, bwUtilization: 0.80, bf16: 43,  int8: null, int4: null, nvlink_bw: null, tdp: 132 },
]
