import { GPU_LIST } from '../src/data/gpus/index.js'
import { ALL_MODELS } from '../src/data/models/index.js'
import { QUANT_MAP, FRAMEWORK_MAP, INTERCONNECT_MAP } from '../src/data/constants.js'
import { calcAll } from '../src/utils/calc.js'
import { autoInterconnect } from '../src/utils/interconnect.js'

export function gpu(id) {
  const g = GPU_LIST.find(x => x.id === id)
  if (!g) throw new Error(`gpu not found: ${id}`)
  return g
}

export function model(id) {
  const m = ALL_MODELS.find(x => x.id === id)
  if (!m) throw new Error(`model not found: ${id}`)
  return m
}

export function quant(id) {
  const q = QUANT_MAP.find(x => x.id === id)
  if (!q) throw new Error(`quant not found: ${id}`)
  return q
}

export function fw(id) {
  const f = FRAMEWORK_MAP.find(x => x.id === id)
  if (!f) throw new Error(`framework not found: ${id}`)
  return f
}

export function ic(id) {
  const i = INTERCONNECT_MAP.find(x => x.id === id)
  if (!i) throw new Error(`interconnect not found: ${id}`)
  return i
}

export function calc(overrides = {}) {
  const g = overrides.gpu ?? gpu('h100_sxm')
  const n = overrides.gpuCount ?? 1
  return calcAll({
    gpu: g,
    gpuCount: n,
    interconnect: overrides.interconnect ?? autoInterconnect(g, n),
    model: overrides.model ?? model('llama3_1_70b'),
    quant: overrides.quant ?? quant('bf16'),
    ctx: overrides.ctx ?? 8192,
    batch: overrides.batch ?? 1,
    promptLen: overrides.promptLen ?? 1024,
    outputLen: overrides.outputLen ?? 1024,
    framework: overrides.framework ?? fw('vllm'),
    flashAttention: overrides.flashAttention ?? true,
    ...overrides,
  })
}

export function finite(n) {
  return Number.isFinite(n)
}

export function almostEqual(a, b, rel = 1e-4, abs = 1e-6) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false
  const diff = Math.abs(a - b)
  return diff <= abs || diff <= rel * Math.max(Math.abs(a), Math.abs(b), 1)
}
