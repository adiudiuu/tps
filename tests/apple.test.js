import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { GPU_LIST } from '../src/data/gpus/index.js'
import { calc, model, quant, fw } from './helpers.js'

function appleMax() {
  return GPU_LIST.find(g => /apple_m4/.test(g.id) && /max/.test(g.id)) ?? GPU_LIST.find(g => g.vendor === 'apple')
}

describe('Apple TTFT 组成', () => {
  it('TTFT 含 launch 开销，不与 Prefill tok/s 互为倒数', () => {
    const gpu = appleMax()
    assert.ok(gpu, 'need an Apple GPU')
    const r = calc({
      gpu,
      gpuCount: 1,
      model: model('qwen3_4b'),
      quant: quant('int4'),
      framework: fw('mlx'),
      promptLen: 1024,
    })
    assert.ok(r.appleTtftScale > 1)
    const impliedPrefill = 1000 * r.effectivePromptLen / r.ttft
    const ratio = r.prefillToks / impliedPrefill
    assert.ok(Math.abs(ratio - r.appleTtftScale) < 0.15 || ratio > 1.05,
      `prefillToks=${r.prefillToks} implied=${impliedPrefill} scale=${r.appleTtftScale}`)
  })
})
