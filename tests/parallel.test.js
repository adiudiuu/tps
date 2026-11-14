import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { calc, gpu, model, ic } from './helpers.js'
import { effectiveEpCount, moeAllowsEp, resolveParallelLayout } from '../src/utils/calc.js'

describe('TP / PP / EP', () => {
  it('PP 不缩短单请求 TTFT（各 stage 串行）', () => {
    const base = calc({
      gpu: gpu('h100_sxm'),
      gpuCount: 1,
      model: model('llama3_1_70b'),
      promptLen: 1024,
    })
    const pp4 = calc({
      gpu: gpu('h100_sxm'),
      gpuCount: 4,
      ppCount: 4,
      interconnect: ic('nvlink4'),
      model: model('llama3_1_70b'),
      promptLen: 1024,
    })
    // 修复前 PP=4 会把 TTFT 除以 4；修复后应与单卡同量级
    assert.ok(pp4.ttft > base.ttft * 0.7, `pp4.ttft=${pp4.ttft} base=${base.ttft}`)
    assert.ok(pp4.ttft < base.ttft * 1.5)
    assert.equal(pp4.ppCount, 4)
  })

  it('PP batch=1 时流水线气泡使单请求吞吐接近单卡而非 ×pp', () => {
    const one = calc({ gpu: gpu('h100_sxm'), gpuCount: 1, batch: 1 })
    const pp = calc({
      gpu: gpu('h100_sxm'),
      gpuCount: 4,
      ppCount: 4,
      interconnect: ic('nvlink4'),
      batch: 1,
    })
    assert.ok(pp.ppBubbleEff < 0.5)
    assert.ok(pp.singleToks < one.singleToks * 1.5)
  })

  it('Mixtral EP 在 NE 有效时启用，非专家权重在各 EP rank 复制', () => {
    const tp = calc({
      gpu: gpu('h100_sxm'),
      gpuCount: 8,
      epCount: 1,
      model: model('mixtral_8x7b'),
      interconnect: ic('nvlink4'),
    })
    const ep = calc({
      gpu: gpu('h100_sxm'),
      gpuCount: 8,
      epCount: 8,
      model: model('mixtral_8x7b'),
      interconnect: ic('nvlink4'),
    })
    assert.equal(tp.moeNonExpertInvalid, false)
    assert.ok(ep.moeNonExpertParams > 0)
    assert.equal(ep.isEP, true)
    assert.equal(ep.epCount, 8)
    // EP 每卡 = 完整 non-expert + 1/ep expert，通常高于纯 TP 的 W/8
    assert.ok(ep.pieWeightGB > tp.pieWeightGB)
  })

  it('NE 无效的 MoE 即使用户要 EP 也不会按专家分片节省', () => {
    const r = calc({
      gpu: gpu('h100_sxm'),
      gpuCount: 8,
      epCount: 8,
      model: model('kimi_k1'),
      interconnect: ic('nvlink4'),
    })
    assert.equal(r.moeNonExpertInvalid, true)
    assert.equal(r.epCount, 1)
    assert.equal(r.isEP, false)
    assert.equal(moeAllowsEp(model('kimi_k1')), false)
    assert.equal(effectiveEpCount(model('kimi_k1'), 8), 1)
    const layout = resolveParallelLayout({
      gpuCount: 8,
      ppCount: 1,
      epCount: effectiveEpCount(model('kimi_k1'), 8),
    })
    assert.equal(layout.epCount, 1)
    assert.equal(layout.tpCount, 8)
  })

  it('batch>1 时 decode 算力按整步 token 预算，不把 1-token 倒数当 TPOT', () => {
    const b1 = calc({ gpu: gpu('h100_sxm'), gpuCount: 1, model: model('qwen3_4b'), batch: 1 })
    const b8 = calc({ gpu: gpu('h100_sxm'), gpuCount: 1, model: model('qwen3_4b'), batch: 8 })
    if (b8.decodeComputeLimited) {
      assert.ok(b8.effectiveToks <= b8.decodeComputeLimit * 1.05)
      assert.ok(b8.tpot > b1.tpot * 4)
    }
  })

  it('纯 CPU 路径不受 GPU decode 算力上限约束', () => {
    const gpuPath = calc({ gpu: gpu('h100_sxm'), gpuCount: 1, model: model('qwen3_4b'), batch: 8 })
    const cpuPath = calc({
      gpu: gpu('h100_sxm'),
      gpuCount: 1,
      model: model('qwen3_4b'),
      batch: 8,
      pureCpu: true,
      cpuMemBw: { id: 'ddr5', bw: 90, label: 'DDR5' },
    })
    assert.equal(cpuPath.decodeComputeLimited, false)
    assert.ok(Number.isFinite(cpuPath.singleToks))
    assert.ok(gpuPath.decodeComputeLimit > 0)
  })
})
