// GTX 16 系列（Turing，无 RT/Tensor，2019）
// bf16 近似为 FP16 峰值，int8 为估算值
export default [
  { id: 'gtx1660ti',   name: 'GTX 1660 Ti',    vendor: 'nvidia', tier: 'consumer', released: '2019-02', vram: 6, bw: 288, bwUtilization: 0.80, bf16: 11, int8: 11, int4: null, nvlink_bw: null, tdp: 120 },
  { id: 'gtx1660s',    name: 'GTX 1660 SUPER', vendor: 'nvidia', tier: 'consumer', released: '2019-10', vram: 6, bw: 336, bwUtilization: 0.80, bf16: 10, int8: 10, int4: null, nvlink_bw: null, tdp: 125 },
  { id: 'gtx1660',     name: 'GTX 1660',       vendor: 'nvidia', tier: 'consumer', released: '2019-03', vram: 6, bw: 192, bwUtilization: 0.80, bf16: 10, int8: 10, int4: null, nvlink_bw: null, tdp: 120 },
  { id: 'gtx1650s',    name: 'GTX 1650 SUPER', vendor: 'nvidia', tier: 'consumer', released: '2019-11', vram: 4, bw: 192, bwUtilization: 0.80, bf16: 6,  int8: 6,  int4: null, nvlink_bw: null, tdp: 100 },
  { id: 'gtx1650ti',   name: 'GTX 1650 Ti',    vendor: 'nvidia', tier: 'consumer', released: '2020-04', vram: 4, bw: 192, bwUtilization: 0.80, bf16: 5,  int8: 5,  int4: null, nvlink_bw: null, tdp: 55  },
  { id: 'gtx1650',     name: 'GTX 1650',       vendor: 'nvidia', tier: 'consumer', released: '2019-04', vram: 4, bw: 128, bwUtilization: 0.80, bf16: 5,  int8: 5,  int4: null, nvlink_bw: null, tdp: 75  },
  { id: 'gtx1630',     name: 'GTX 1630',       vendor: 'nvidia', tier: 'consumer', released: '2022-06', vram: 4, bw: 96,  bwUtilization: 0.80, bf16: 3,  int8: 3,  int4: null, nvlink_bw: null, tdp: 75  },
]
