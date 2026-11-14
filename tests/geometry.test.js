import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ALL_MODELS } from '../src/data/models/index.js'
import { getAttentionType, getAttentionSummary, getTotalHeads, gqaDivisible, isSsmModel } from '../src/utils/model.js'
import { getMoeNonExpertParams } from '../src/utils/calc.js'
import { calc, gpu, model } from './helpers.js'

describe('query_heads / MLA / SSM / MoE NE', () => {
  it('Gemma 3 27B 官方 32Q/16KV，不是 hidden/head_dim=42', () => {
    const m = model('gemma3_27b')
    assert.equal(getTotalHeads(m), 32)
    assert.equal(getAttentionType(m), 'gqa')
    assert.equal(gqaDivisible(m), true)
  })

  it('GLM-5.3 有 mla_ratio 时标 MLA 而非 MHA', () => {
    const m = model('glm5_3')
    assert.equal(getTotalHeads(m), 64)
    assert.equal(getAttentionType(m), 'mla')
  })

  it('DeepSeek V3 query_heads=128（不能从 7168/128 推 56）', () => {
    assert.equal(getTotalHeads(model('deepseek_v3')), 128)
    assert.equal(getAttentionType(model('deepseek_v3')), 'mla')
  })

  it('DeepSeek R1 / V2.5 与 Kimi K2/K3 官方 Q 头数', () => {
    assert.equal(getTotalHeads(model('deepseek_r1')), 128)
    assert.equal(getTotalHeads(model('deepseek_r1_0528')), 128)
    assert.equal(getTotalHeads(model('deepseek_v2_5')), 128)
    assert.equal(getTotalHeads(model('kimi_k2')), 64)
    assert.equal(getTotalHeads(model('kimi_k3')), 96)
    assert.equal(getAttentionSummary(model('deepseek_r1')), 'MLA (128/128)')
    assert.equal(getAttentionSummary(model('kimi_k2')), 'MLA (64/1)')
  })

  it('GPT-OSS 120B 官方 64Q/8KV', () => {
    assert.equal(getTotalHeads(model('gpt_oss_120b')), 64)
    assert.equal(getAttentionType(model('gpt_oss_120b')), 'gqa')
  })

  it('纯 Mamba 不是坏几何', () => {
    const m = model('codestral_mamba_7b')
    assert.equal(isSsmModel(m), true)
    assert.equal(getAttentionType(m), 'ssm')
    const r = calc({ gpu: gpu('rtx4090'), model: m, gpuCount: 1 })
    assert.ok(Number.isFinite(r.singleToks))
    assert.ok(Number.isFinite(r.ttft))
    assert.ok(r.kvGB === 0 || r.pieKvGB === 0)
    assert.equal(r.ssmModel, true)
  })

  it('混合架构不因 GQA 整除失败而告警', () => {
    const m = model('gemma4_12b_unified')
    assert.equal(gqaDivisible(m), true)
  })

  it('官方 config 修复后 GLM-4.7 / LFM2 / Granite NE 为正', () => {
    for (const id of ['glm4_7', 'glm4_7_flash', 'liquidai_lfm2_8b', 'granite_moe_3b']) {
      const ne = getMoeNonExpertParams(model(id))
      assert.ok(ne != null && ne > 0, `${id} NE=${ne}`)
    }
  })

  it('无核验资料的 MoE NE 为负则保持 invalid，不钳 0', () => {
    assert.equal(getMoeNonExpertParams(model('kimi_k1')), null)
    assert.equal(getMoeNonExpertParams(model('mistral_large_3')), null)
    const r = calc({ model: model('kimi_k1') })
    assert.equal(r.moeNonExpertInvalid, true)
  })

  it('Yuan2-51B 按官方 config 为 dense', () => {
    assert.equal(model('yuan2_51b').type, 'dense')
    assert.equal(getTotalHeads(model('yuan2_51b')), 64)
  })
})

describe('全库 MoE NE 扫描', () => {
  it('NE 为负的条目都被标 invalid，没有静默钳 0', () => {
    const invalid = []
    for (const m of ALL_MODELS) {
      if (m.type !== 'moe') continue
      const ne = getMoeNonExpertParams(m)
      if (m.experts && m.experts_per_token && m.experts_per_token !== m.experts && ne == null) {
        invalid.push(m.id)
      }
    }
    assert.ok(invalid.includes('kimi_k1'))
    assert.ok(!invalid.includes('mixtral_8x7b'))
    assert.ok(!invalid.includes('glm4_7'))
  })
})
