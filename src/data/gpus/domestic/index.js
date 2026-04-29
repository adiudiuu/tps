// 国产 AI 加速卡（华为昇腾、寒武纪、壁仞、摩尔线程）
export default [
  { id: 'ascend910d', name: '华为昇腾 910D', vendor: 'domestic', tier: 'datacenter', released: '2025-05', vram: 64, bw: 2400, bwUtilization: 0.85, bf16: 600, int8: 1200, int4: null, nvlink_bw: null, tdp: 600 },
  { id: 'ascend910c', name: '华为昇腾 910C', vendor: 'domestic', tier: 'datacenter', released: '2024-02', vram: 64, bw: 2400, bwUtilization: 0.85, bf16: 480, int8: 960,  int4: null, nvlink_bw: null, tdp: 450 },
  { id: 'ascend910b', name: '华为昇腾 910B', vendor: 'domestic', tier: 'datacenter', released: '2023-08', vram: 64, bw: 2000, bwUtilization: 0.85, bf16: 320, int8: 640,  int4: null, nvlink_bw: null, tdp: 400 },
  { id: 'mlu370',     name: '寒武纪 MLU370', vendor: 'domestic', tier: 'datacenter', released: '2022-03', vram: 48, bw: 1228, bwUtilization: 0.85, bf16: 256, int8: 512,  int4: null, nvlink_bw: null, tdp: 300 },
  { id: 'br100',      name: '壁仞 BR100',    vendor: 'domestic', tier: 'datacenter', released: '2022-08', vram: 64, bw: 2000, bwUtilization: 0.85, bf16: 256, int8: 512,  int4: null, nvlink_bw: null, tdp: 550 },
  { id: 'mts4000',    name: '摩尔线程 S4000', vendor: 'domestic', tier: 'datacenter', released: '2022-11', vram: 48, bw: 576,  bwUtilization: 0.85, bf16: 80,  int8: 160,  int4: null, nvlink_bw: null, tdp: 250 },
]
