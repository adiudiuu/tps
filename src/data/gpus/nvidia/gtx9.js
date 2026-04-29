// GTX 9 系列（Maxwell，2014-2015）
// 无 BF16/INT8 硬件支持，bf16/int8 为 FP32 等效估算
export default [
  { id: 'gtx980ti', name: 'GTX 980 Ti', vendor: 'nvidia', tier: 'consumer', released: '2015-06', vram: 6, bw: 336, bwUtilization: 0.80, bf16: 6, int8: 6, int4: null, nvlink_bw: null, tdp: 250 },
  { id: 'gtx980',   name: 'GTX 980',   vendor: 'nvidia', tier: 'consumer', released: '2014-09', vram: 4, bw: 224, bwUtilization: 0.80, bf16: 4, int8: 4, int4: null, nvlink_bw: null, tdp: 165 },
  { id: 'gtx970',   name: 'GTX 970',   vendor: 'nvidia', tier: 'consumer', released: '2014-09', vram: 4, bw: 196, bwUtilization: 0.80, bf16: 4, int8: 4, int4: null, nvlink_bw: null, tdp: 145 },
  { id: 'gtx960',   name: 'GTX 960',   vendor: 'nvidia', tier: 'consumer', released: '2015-01', vram: 2, bw: 112, bwUtilization: 0.80, bf16: 2, int8: 2, int4: null, nvlink_bw: null, tdp: 120 },
  { id: 'gtx950',   name: 'GTX 950',   vendor: 'nvidia', tier: 'consumer', released: '2015-08', vram: 2, bw: 105, bwUtilization: 0.80, bf16: 2, int8: 2, int4: null, nvlink_bw: null, tdp: 90  },
]
