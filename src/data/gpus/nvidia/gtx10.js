// GTX 10 系列（Pascal，2016-2018）
// 无 BF16/INT8 硬件支持，bf16/int8 为 FP32 等效估算
export default [
  { id: 'gtx1080ti',  name: 'GTX 1080 Ti',  vendor: 'nvidia', tier: 'consumer', released: '2017-03', vram: 11, bw: 484, bf16: 11, int8: 11, int4: null, nvlink_bw: null, tdp: 250 },
  { id: 'gtx1080',    name: 'GTX 1080',     vendor: 'nvidia', tier: 'consumer', released: '2016-05', vram: 8,  bw: 320, bf16: 9,  int8: 9,  int4: null, nvlink_bw: null, tdp: 180 },
  { id: 'gtx1070ti',  name: 'GTX 1070 Ti',  vendor: 'nvidia', tier: 'consumer', released: '2017-11', vram: 8,  bw: 256, bf16: 8,  int8: 8,  int4: null, nvlink_bw: null, tdp: 180 },
  { id: 'gtx1070',    name: 'GTX 1070',     vendor: 'nvidia', tier: 'consumer', released: '2016-06', vram: 8,  bw: 256, bf16: 7,  int8: 7,  int4: null, nvlink_bw: null, tdp: 150 },
  { id: 'gtx1060_6g', name: 'GTX 1060 6GB', vendor: 'nvidia', tier: 'consumer', released: '2016-07', vram: 6,  bw: 192, bf16: 4,  int8: 4,  int4: null, nvlink_bw: null, tdp: 120 },
  { id: 'gtx1060_3g', name: 'GTX 1060 3GB', vendor: 'nvidia', tier: 'consumer', released: '2016-08', vram: 3,  bw: 192, bf16: 4,  int8: 4,  int4: null, nvlink_bw: null, tdp: 120 },
  { id: 'gtx1050ti',  name: 'GTX 1050 Ti',  vendor: 'nvidia', tier: 'consumer', released: '2016-10', vram: 4,  bw: 112, bf16: 2,  int8: 2,  int4: null, nvlink_bw: null, tdp: 75  },
  { id: 'gtx1050',    name: 'GTX 1050',     vendor: 'nvidia', tier: 'consumer', released: '2016-10', vram: 2,  bw: 112, bf16: 2,  int8: 2,  int4: null, nvlink_bw: null, tdp: 75  },
]
