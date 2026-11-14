import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { calc, gpu, model, quant, almostEqual } from './helpers.js'

describe('VRAM 每卡 / 饼图 / 集群同一套切片', () => {
  it('perCardNeeded = pieWeight+pieKv+runtime+activation', () => {
    const r = calc({ gpu: gpu('h100_sxm'), gpuCount: 8 })
    const sum = r.pieWeightGB + r.pieKvGB + r.runtimeOverheadPerCard + r.activationPerCard
    assert.ok(almostEqual(sum, r.perCardNeeded, 1e-6, 1e-6))
    assert.ok(almostEqual(r.displayNeeded, r.perCardNeeded))
    assert.ok(almostEqual(r.clusterNeeded, r.perCardNeeded * 8, 1e-6, 1e-4))
    assert.ok(almostEqual(r.totalNeeded, r.clusterNeeded, 1e-6, 1e-4))
  })

  it('运行时开销每卡固定，不随卡数整除消失', () => {
    const one = calc({ gpu: gpu('h100_sxm'), gpuCount: 1 })
    const eight = calc({ gpu: gpu('h100_sxm'), gpuCount: 8 })
    assert.ok(almostEqual(one.runtimeOverheadPerCard, eight.runtimeOverheadPerCard, 0.05, 0.05))
    assert.ok(eight.runtimeOverheadPerCard >= 1)
  })

  it('8×4090 70B BF16 不把全部 overhead 除以 8', () => {
    const r = calc({
      gpu: gpu('rtx4090'),
      gpuCount: 8,
      model: model('llama3_1_70b'),
      quant: quant('bf16'),
      ctx: 8192,
      promptLen: 8192,
    })
    assert.ok(r.runtimeOverheadPerCard >= 1)
    const naive = (r.weightGB + r.kvGB) / 8 + r.overheadGB / 8
    // 若把运行时也除以卡数会系统性偏低
    assert.ok(r.perCardNeeded > naive)
  })

  it('显存结论是理论估算：高占用不声称实测可跑', () => {
    const r = calc({
      gpu: gpu('rtx4090'),
      gpuCount: 8,
      model: model('llama3_1_70b'),
      quant: quant('bf16'),
    })
    assert.ok(r.vramScope === 'per_card')
    assert.ok(Number.isFinite(r.vramPct))
  })

  it('Ranking/Estimator 每卡需求与集群合计同维：cluster = perCard × n', () => {
    const r = calc({
      gpu: gpu('h100_sxm'),
      gpuCount: 8,
      model: model('llama3_1_70b'),
      quant: quant('bf16'),
    })
    const uiNeeded = r.displayNeeded ?? r.perCardNeeded
    const uiCap = r.displayVram ?? r.perCardVram
    assert.ok(almostEqual(uiNeeded, r.perCardNeeded))
    assert.ok(almostEqual(uiCap, r.perCardVram))
    assert.ok(almostEqual(r.clusterNeeded, uiNeeded * 8, 1e-6, 1e-4))
    // 余量必须跟条形图同一套每卡容量，不能用集群 totalVram 减每卡
    const freeUi = uiCap - uiNeeded
    const mixed = r.totalVram - uiNeeded
    assert.ok(Math.abs(mixed - freeUi) > 10, 'cluster VRAM minus per-card needed is the old Ranking mix-up')
  })
})
