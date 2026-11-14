import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { generateMarkdown } from '../src/utils/exportMd.js'
import { buildShareStats } from '../src/utils/shareText.js'
import { getWarnings } from '../src/utils/calc.js'
import { speedRating } from '../src/utils/speedRating.js'
import zh from '../src/i18n/zh.js'
import en from '../src/i18n/en.js'
import es from '../src/i18n/es.js'
import ja from '../src/i18n/ja.js'
import ko from '../src/i18n/ko.js'
import ru from '../src/i18n/ru.js'
import zhTW from '../src/i18n/zh-TW.js'
import { calc, gpu, model, quant, fw, ic } from './helpers.js'

function tFrom(msg) {
  return (key, params = {}) => {
    const parts = key.split('.')
    let cur = msg
    for (const p of parts) cur = cur?.[p]
    if (typeof cur !== 'string') return key
    return cur.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`)
  }
}

describe('导出 / 分享 / 文案口径', () => {
  it('Markdown 聚合吞吐用 effectiveToks，不用未计通信的 decodeToks', () => {
    const r = calc({
      gpu: gpu('h100_sxm'),
      gpuCount: 8,
      interconnect: ic('nvlink4'),
      model: model('llama3_1_70b'),
      batch: 1,
    })
    const md = generateMarkdown({
      gpu: gpu('h100_sxm'),
      gpuCount: 8,
      interconnect: ic('nvlink4'),
      model: model('llama3_1_70b'),
      quant: quant('bf16'),
      framework: fw('vllm'),
      ctx: 8192,
      batch: 1,
      promptLen: 1024,
      outputLen: 1024,
      flashAttention: true,
      kvCacheQuant: null,
      prefixCacheHit: 0,
      cpuOffload: false,
      pcieBw: null,
      result: r,
      t: tFrom(zh),
      locale: 'zh',
    })
    assert.ok(md.includes('实际吞吐'))
    const agg = r.effectiveToks.toFixed(0)
    assert.ok(md.includes(String(Math.floor(r.effectiveToks))) || md.includes(agg)
      || md.includes(r.effectiveToksMin.toFixed(1)))
    assert.notEqual(r.effectiveToks.toFixed(1), r.decodeToks.toFixed(1))
    // 量化对比表与徽章/Ranking 一样用单请求 tok/s，不再写未计通信的 decodeToks
    assert.ok(!md.includes(r.decodeToks.toFixed(1) + ' tok/s')
      || r.decodeToks.toFixed(1) === r.singleToks.toFixed(1))
  })

  it('分享图用 singleToks 中位而不是 Max 评徽章', () => {
    const r = calc({ gpuCount: 1, model: model('qwen3_4b') })
    const stats = buildShareStats(r, model('qwen3_4b'), gpu('h100_sxm'), quant('bf16'))
    assert.equal(stats.singleToksMid, r.singleToks)
    const mid = speedRating(r.singleToks)
    const max = speedRating(r.singleToksMax)
    assert.equal(typeof mid.grade, 'string')
    assert.ok(r.singleToks <= r.singleToksMax)
    if (r.singleToks < 60 && r.singleToksMax >= 60) {
      assert.notEqual(mid.grade, max.grade)
    }
  })

  it('7 份 i18n 都有吞吐/TTFT/Roofline/警告 key', () => {
    const langs = [zh, en, es, ja, ko, ru, zhTW]
    const keys = [
      ['result', 'actual_tip'],
      ['result', 'single_tip'],
      ['result', 'tpot_tip'],
      ['result', 'ttft_tip'],
      ['result', 'speculative_speedup_tip'],
      ['result', 'roofline_x_axis'],
      ['result', 'runtime_overhead'],
      ['warning', 'moe_non_expert_invalid'],
      ['warning', 'ssm_no_standard_kv'],
      ['warning', 'int4_weight_only_prefill'],
      ['warning', 'apple_ttft_launch'],
    ]
    for (const pack of langs) {
      for (const [a, b] of keys) {
        assert.equal(typeof pack[a][b], 'string', `missing ${a}.${b}`)
      }
      assert.ok(!pack.result.roofline_x_axis.includes('FLOP/byte') || pack.result.roofline_x_axis.includes('非')
        || pack.result.roofline_x_axis.includes('not') || pack.result.roofline_x_axis.includes('не')
        || pack.result.roofline_x_axis.includes('아님') || pack.result.roofline_x_axis.includes('ではない')
        || pack.result.roofline_x_axis.includes('no FLOP'))
    }
  })

  it('getWarnings 对无效 NE 与 SSM 给出明确警告而非把模型当坏数据', () => {
    const t = tFrom(zh)
    const moe = calc({ model: model('kimi_k1') })
    const w = getWarnings(moe, t)
    assert.ok(w.some(x => x.key === 'moe_non_expert_invalid'))
    const ssm = calc({ gpu: gpu('rtx4090'), model: model('codestral_mamba_7b') })
    const ws = getWarnings(ssm, t)
    assert.ok(ws.some(x => x.key === 'ssm_no_standard_kv'))
    assert.ok(!ws.some(x => x.key === 'gqa_heads_mismatch'))
  })
})
