/**
 * 回归基准：对比计算器输出与公开 benchmark 参考值
 * 运行：node scripts/benchmark-regression.mjs
 */
import { calcAll } from '../src/utils/calc.js'
import { GPU_LIST } from '../src/data/gpus/index.js'
import { ALL_MODELS } from '../src/data/models/index.js'
import { QUANT_MAP, FRAMEWORK_MAP, INTERCONNECT_MAP } from '../src/data/constants.js'

const model8b = ALL_MODELS.find(m => m.id === 'llama3_8b')
const model70b = ALL_MODELS.find(m => m.id === 'llama3_3_70b')
const int4 = QUANT_MAP.find(q => q.id === 'int4')
const bf16 = QUANT_MAP.find(q => q.id === 'bf16')
const mlx = FRAMEWORK_MAP.find(f => f.id === 'mlx')
const vllm = FRAMEWORK_MAP.find(f => f.id === 'vllm')
const ic = INTERCONNECT_MAP[0]

const CASES = [
  { label: 'M4 16G MLX 8B', gpu: 'apple_m4_16g', model: model8b, quant: int4, fw: mlx, batch: 1, real: 28 },
  { label: 'M4 Pro 48G MLX 8B', gpu: 'apple_m4_pro_48g', model: model8b, quant: int4, fw: mlx, batch: 1, real: 93 },
  { label: 'M4 Max 48G MLX 8B', gpu: 'apple_m4_max_48g', model: model8b, quant: int4, fw: mlx, batch: 1, real: 160 },
  { label: 'M3 Max 64G MLX 8B', gpu: 'apple_m3_max_64g', model: model8b, quant: int4, fw: mlx, batch: 1, real: 50 },
  { label: 'M3 Pro 36G MLX 8B', gpu: 'apple_m3_pro_36g', model: model8b, quant: int4, fw: mlx, batch: 1, real: 35 },
  { label: 'M1 Max 32G MLX 8B', gpu: 'apple_m1_max_32g', model: model8b, quant: int4, fw: mlx, batch: 1, real: 38 },
  { label: 'M4 Max 36G MLX 8B', gpu: 'apple_m4_max_36g', model: model8b, quant: int4, fw: mlx, batch: 1, real: 138 },
  { label: 'M2 Max 32G MLX 8B', gpu: 'apple_m2_max_32g', model: model8b, quant: int4, fw: mlx, batch: 1, real: 45 },
  { label: '4090 INT4 vLLM b1', gpu: 'rtx4090', model: model8b, quant: int4, fw: vllm, batch: 1, real: 125 },
  { label: '4090 BF16 vLLM b1', gpu: 'rtx4090', model: model8b, quant: bf16, fw: vllm, batch: 1, real: 95 },
  { label: '4090 INT4 vLLM b32', gpu: 'rtx4090', model: model8b, quant: int4, fw: vllm, batch: 32, real: 1100, metric: 'decodeToks' },
  { label: '8xH100 70B INT4 per-card VRAM', gpu: 'h100_sxm', model: model70b, quant: int4, fw: vllm, batch: 1, gpuCount: 8, metric: 'perCardNeeded', real: 5.8, tolerance: 0.15 },
]

function runCase(c) {
  const gpu = GPU_LIST.find(g => g.id === c.gpu)
  const r = calcAll({
    gpu, gpuCount: c.gpuCount ?? 1, interconnect: ic,
    model: c.model, quant: c.quant, ctx: 8192, batch: c.batch,
    promptLen: 512, outputLen: 128, framework: c.fw, flashAttention: true,
  })
  const metric = c.metric ?? 'singleToks'
  const got = r[metric]
  const err = Math.abs(got / c.real - 1)
  const tol = c.tolerance ?? 0.18
  const ok = err <= tol
  return { ...c, got: +got.toFixed(1), errPct: +(err * 100).toFixed(1), ok, tol: +(tol * 100).toFixed(0) }
}

const results = CASES.map(runCase)
const failed = results.filter(r => !r.ok)

console.log('TPS Calculator benchmark regression\n')
for (const r of results) {
  const mark = r.ok ? 'OK' : 'FAIL'
  console.log(`[${mark}] ${r.label}: ${r.got} vs ${r.real} (${r.errPct}% err, tol ${r.tol}%)`)
}

console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length) {
  process.exitCode = 1
}
