// Intel 集成显卡
// vram=0 表示共享系统内存，bw 为估算内存带宽
export default [
  { id: 'iris_xe',    name: 'Iris Xe',          vendor: 'intel', tier: 'consumer', released: '2020-09', vram: 0, bw: 68, bwUtilization: 0.80, bf16: 2, int8: null, int4: null, nvlink_bw: null, tdp: 28, sharedMemory: true },
  { id: 'iris_plus',  name: 'Iris Plus',        vendor: 'intel', tier: 'consumer', released: '2019-08', vram: 0, bw: 34, bwUtilization: 0.80, bf16: 1, int8: null, int4: null, nvlink_bw: null, tdp: 15, sharedMemory: true },
  { id: 'uhd_770',    name: 'UHD 770',          vendor: 'intel', tier: 'consumer', released: '2021-11', vram: 0, bw: 51, bwUtilization: 0.80, bf16: 1, int8: null, int4: null, nvlink_bw: null, tdp: 15, sharedMemory: true },
  { id: 'uhd_730',    name: 'UHD 730',          vendor: 'intel', tier: 'consumer', released: '2021-11', vram: 0, bw: 51, bwUtilization: 0.80, bf16: 1, int8: null, int4: null, nvlink_bw: null, tdp: 15, sharedMemory: true },
  { id: 'uhd_630',    name: 'UHD Graphics 630', vendor: 'intel', tier: 'consumer', released: '2017-01', vram: 0, bw: 34, bwUtilization: 0.80, bf16: 1, int8: null, int4: null, nvlink_bw: null, tdp: 15, sharedMemory: true },
  { id: 'uhd_620',    name: 'UHD Graphics 620', vendor: 'intel', tier: 'consumer', released: '2018-01', vram: 0, bw: 34, bwUtilization: 0.80, bf16: 1, int8: null, int4: null, nvlink_bw: null, tdp: 15, sharedMemory: true },
]
