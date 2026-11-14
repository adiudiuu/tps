import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ALL_MODELS } from '../src/data/models/index.js'
import { GPU_LIST } from '../src/data/gpus/index.js'
import { QUANT_MAP, FRAMEWORK_MAP } from '../src/data/constants.js'
import { calcAll } from '../src/utils/calc.js'
import { autoInterconnect } from '../src/utils/interconnect.js'
import { gpu, quant, fw } from './helpers.js'

const h100 = gpu('h100_sxm')
const vllm = fw('vllm')
const bf16 = quant('bf16')

describe('全模型数值健全性', () => {
  it('H100 ×1 vLLM BF16 下全部模型 calcAll 有限', () => {
    const bad = []
    for (const model of ALL_MODELS) {
      try {
        const r = calcAll({
          gpu: h100,
          gpuCount: 1,
          interconnect: autoInterconnect(h100, 1),
          model,
          quant: bf16,
          ctx: 4096,
          batch: 1,
          promptLen: 512,
          outputLen: 128,
          framework: vllm,
          flashAttention: true,
        })
        const keys = ['singleToks', 'effectiveToks', 'ttft', 'tpot', 'perCardNeeded', 'prefillToks', 'kvGB']
        for (const k of keys) {
          if (!Number.isFinite(r[k])) bad.push(`${model.id}.${k}=${r[k]}`)
        }
      } catch (e) {
        bad.push(`${model.id} threw ${e.message}`)
      }
    }
    assert.equal(bad.length, 0, bad.slice(0, 20).join('\n'))
  })

  it('GPU 列表非空且含 Hopper/Ada/Apple', () => {
    assert.ok(GPU_LIST.some(g => g.id === 'h100_sxm'))
    assert.ok(GPU_LIST.some(g => g.id === 'rtx4090'))
    assert.ok(GPU_LIST.some(g => g.vendor === 'apple'))
    assert.ok(QUANT_MAP.some(q => q.id === 'int4'))
    assert.ok(FRAMEWORK_MAP.some(f => f.id === 'vllm'))
  })

  it('单/多卡 × Dense/MoE × 主要量化/框架结果有限', () => {
    const cases = [
      { g: 'h100_sxm', n: 1, m: 'llama3_1_70b', q: 'bf16', f: 'vllm' },
      { g: 'h100_sxm', n: 8, m: 'llama3_1_70b', q: 'int4', f: 'sglang' },
      { g: 'rtx4090', n: 8, m: 'mixtral_8x7b', q: 'int4', f: 'vllm' },
      { g: 'a100_sxm_80g', n: 4, m: 'glm5_3', q: 'bf16', f: 'vllm' },
      { g: 'rtx4090', n: 1, m: 'codestral_mamba_7b', q: 'int4', f: 'llamacpp' },
    ]
    const apple = GPU_LIST.find(x => x.vendor === 'apple')
    if (apple) cases.push({ gpu: apple, n: 1, m: 'qwen3_4b', q: 'int4', f: 'mlx' })
    const bad = []
    for (const c of cases) {
      const g = c.gpu ?? gpu(c.g)
      try {
        const r = calcAll({
          gpu: g,
          gpuCount: c.n,
          interconnect: autoInterconnect(g, c.n),
          model: ALL_MODELS.find(x => x.id === c.m),
          quant: QUANT_MAP.find(x => x.id === c.q),
          ctx: 4096,
          batch: 1,
          promptLen: 512,
          outputLen: 128,
          framework: FRAMEWORK_MAP.find(x => x.id === c.f),
          flashAttention: true,
        })
        for (const k of ['singleToks', 'effectiveToks', 'ttft', 'tpot', 'perCardNeeded']) {
          if (!Number.isFinite(r[k])) bad.push(`${c.m}/${c.f}/${k}=${r[k]}`)
        }
      } catch (e) {
        bad.push(`${c.m}/${c.f} threw ${e.message}`)
      }
    }
    assert.equal(bad.length, 0, bad.join('\n'))
  })
})
