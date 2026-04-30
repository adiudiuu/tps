// AMD 集成显卡（APU / Ryzen AI）
// 集成显卡共享系统内存，vram=0 表示无独立显存，bw 为内存带宽
export default [
  { id: 'ryzen_ai_max_395',     name: 'Ryzen AI MAX+ 395 (Linux)',   vendor: 'amd', tier: 'consumer', released: '2025-01', vram: 128, bw: 212, bwUtilization: 0.83, bf16: 36.9, int8: null, int4: null, nvlink_bw: null, tdp: 120 },
  { id: 'ryzen_ai_max_395_win', name: 'Ryzen AI MAX+ 395 (Windows)', vendor: 'amd', tier: 'consumer', released: '2025-01', vram: 96,  bw: 212, bwUtilization: 0.83, bf16: 36.9, int8: null, int4: null, nvlink_bw: null, tdp: 120 },
  { id: 'radeon_890m',      name: 'Radeon 890M',       vendor: 'amd', tier: 'consumer', released: '2024-07', vram: 0,  bw: 102, bwUtilization: 0.80, bf16: 5,  int8: null, int4: null, nvlink_bw: null, tdp: 28,  sharedMemory: true },
  { id: 'radeon_880m',      name: 'Radeon 880M',       vendor: 'amd', tier: 'consumer', released: '2024-07', vram: 0,  bw: 89,  bwUtilization: 0.80, bf16: 4,  int8: null, int4: null, nvlink_bw: null, tdp: 28,  sharedMemory: true },
  { id: 'radeon_780m',      name: 'Radeon 780M',       vendor: 'amd', tier: 'consumer', released: '2023-02', vram: 0,  bw: 89,  bwUtilization: 0.80, bf16: 4,  int8: null, int4: null, nvlink_bw: null, tdp: 28,  sharedMemory: true },
  { id: 'radeon_760m',      name: 'Radeon 760M',       vendor: 'amd', tier: 'consumer', released: '2023-02', vram: 0,  bw: 64,  bwUtilization: 0.80, bf16: 3,  int8: null, int4: null, nvlink_bw: null, tdp: 28,  sharedMemory: true },
  { id: 'radeon_680m',      name: 'Radeon 680M',       vendor: 'amd', tier: 'consumer', released: '2022-01', vram: 0,  bw: 51,  bwUtilization: 0.80, bf16: 2,  int8: null, int4: null, nvlink_bw: null, tdp: 28,  sharedMemory: true },
  { id: 'radeon_660m',      name: 'Radeon 660M',       vendor: 'amd', tier: 'consumer', released: '2022-01', vram: 0,  bw: 38,  bwUtilization: 0.80, bf16: 2,  int8: null, int4: null, nvlink_bw: null, tdp: 15,  sharedMemory: true },
  { id: 'vega8',            name: 'Vega 8',            vendor: 'amd', tier: 'consumer', released: '2018-02', vram: 0,  bw: 38,  bwUtilization: 0.80, bf16: 1,  int8: null, int4: null, nvlink_bw: null, tdp: 15,  sharedMemory: true },
  { id: 'vega7',            name: 'Vega 7',            vendor: 'amd', tier: 'consumer', released: '2020-01', vram: 0,  bw: 38,  bwUtilization: 0.80, bf16: 1,  int8: null, int4: null, nvlink_bw: null, tdp: 15,  sharedMemory: true },
]
