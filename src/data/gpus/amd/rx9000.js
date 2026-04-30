// AMD RX 9000 系列（RDNA 4，2025）
// bf16 = AI FP16 TOPS（无稀疏）/ 2，与文件中 9070 系列保持一致口径
// int8/int4 AMD 消费卡通常无官方 TOPS 数据，填 null
export default [
  { id: 'rx9070xt',            name: 'RX 9070 XT',          vendor: 'amd', tier: 'consumer', released: '2025-03', vram: 16, bw: 717, bwUtilization: 0.80, bf16: 82, int8: null, int4: null, nvlink_bw: null, tdp: 304 },
  { id: 'rx9070',              name: 'RX 9070',             vendor: 'amd', tier: 'consumer', released: '2025-03', vram: 16, bw: 640, bwUtilization: 0.80, bf16: 73, int8: null, int4: null, nvlink_bw: null, tdp: 220 },
  { id: 'radeon_ai_pro_r9700', name: 'Radeon AI PRO R9700', vendor: 'amd', tier: 'consumer', released: '2025-05', vram: 32, bw: 640, bwUtilization: 0.80, bf16: 73, int8: null, int4: null, nvlink_bw: null, tdp: 250 },
  // 国行版（Navi 48，48 CU，192-bit 432 GB/s）
  { id: 'rx9070gre_16g',       name: 'RX 9070 GRE 16GB',   vendor: 'amd', tier: 'consumer', released: '2025-05', vram: 16, bw: 432, bwUtilization: 0.80, bf16: 69, int8: null, int4: null, nvlink_bw: null, tdp: 200 },
  { id: 'rx9070gre_12g',       name: 'RX 9070 GRE 12GB',   vendor: 'amd', tier: 'consumer', released: '2025-05', vram: 12, bw: 432, bwUtilization: 0.80, bf16: 69, int8: null, int4: null, nvlink_bw: null, tdp: 200 },
  // Navi 44，128-bit 320 GB/s
  { id: 'rx9060xt_16g',        name: 'RX 9060 XT 16GB',    vendor: 'amd', tier: 'consumer', released: '2025-06', vram: 16, bw: 320, bwUtilization: 0.80, bf16: 52, int8: null, int4: null, nvlink_bw: null, tdp: 160 },
  { id: 'rx9060xt',            name: 'RX 9060 XT',         vendor: 'amd', tier: 'consumer', released: '2025-06', vram: 8,  bw: 320, bwUtilization: 0.80, bf16: 52, int8: null, int4: null, nvlink_bw: null, tdp: 150 },
  { id: 'rx9060',              name: 'RX 9060',             vendor: 'amd', tier: 'consumer', released: '2025-08', vram: 8,  bw: 288, bwUtilization: 0.80, bf16: 43, int8: null, int4: null, nvlink_bw: null, tdp: 132 },
]
