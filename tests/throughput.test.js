import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { calc, gpu, model, quant, fw, ic, almostEqual } from './helpers.js'

describe('aggregate / single / TPOT 口径', () => {
  it('tpot === 1000 / singleToks（含通信后）', () => {
    const r = calc({ gpuCount: 8, interconnect: ic('nvlink4'), batch: 1 })
    assert.ok(almostEqual(r.tpot, 1000 / r.singleToks, 1e-6, 1e-4))
  })

  it('effectiveToks === singleToks * batch', () => {
    const r = calc({ gpuCount: 8, interconnect: ic('nvlink4'), batch: 8 })
    assert.ok(almostEqual(r.effectiveToks, r.singleToks * 8, 1e-6, 1e-4))
  })

  it('多卡 TP 后聚合吞吐低于未计通信的 decodeToks', () => {
    const r = calc({
      gpu: gpu('h100_sxm'),
      gpuCount: 8,
      interconnect: ic('nvlink4'),
      model: model('llama3_1_70b'),
      batch: 1,
    })
    assert.ok(r.effectiveToks < r.decodeToks)
    assert.ok(r.tpEfficiency < 1)
    // 审查复现：8×H100 Llama70 BF16 不应把未计通信的 decodeToks 当「实际吞吐」
    assert.ok(r.effectiveToks < 80, `effectiveToks=${r.effectiveToks}`)
    assert.ok(r.singleToks < 80)
  })

  it('batch>1 时单请求速度会变（continuous batching 不是常数）', () => {
    const b1 = calc({ batch: 1 })
    const b8 = calc({ batch: 8 })
    assert.notEqual(b1.singleToks.toFixed(3), b8.singleToks.toFixed(3))
    assert.ok(b8.effectiveToks > b1.effectiveToks)
  })

  it('speculative 加速是 (1-α^(γ+1))/(1-α) 而非 1+αγ', () => {
    const r = calc({
      speculativeDecoding: true,
      acceptanceRate: 0.7,
      draftLen: 4,
    })
    const expected = (1 - Math.pow(0.7, 5)) / (1 - 0.7)
    assert.ok(almostEqual(r.speculativeSpeedup, expected, 1e-6))
    assert.ok(!almostEqual(r.speculativeSpeedup, 1 + 0.7 * 4, 1e-3))
  })
})

describe('Ranking/Solver 同源字段', () => {
  it('singleToks 有限且与 tpot 互为倒数，供排行/求解器使用', () => {
    const r = calc({
      gpu: gpu('rtx4090'),
      gpuCount: 1,
      model: model('qwen3_4b'),
      quant: quant('int4'),
      framework: fw('vllm'),
    })
    assert.ok(Number.isFinite(r.singleToks))
    assert.ok(almostEqual(r.singleToks, 1000 / r.tpot, 1e-4))
  })
})
