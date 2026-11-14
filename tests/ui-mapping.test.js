import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { generateMarkdown } from '../src/utils/exportMd.js'
import { buildShareStats } from '../src/utils/shareText.js'
import { calc, gpu, model, quant, fw, ic } from './helpers.js'
import zh from '../src/i18n/zh.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
function src(rel) {
  return readFileSync(join(root, rel), 'utf8')
}
function tFrom(msg) {
  return (key, params = {}) => {
    const parts = key.split('.')
    let cur = msg
    for (const p of parts) cur = cur?.[p]
    if (typeof cur !== 'string') return key
    return cur.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? `{${k}}`)
  }
}

describe('UI 模板与导出字段映射（实际显示口径）', () => {
  it('SpeedCard 实际吞吐用 effectiveToks，单请求/徽章用 singleToks', () => {
    const vue = src('src/components/result/SpeedCard.vue')
    assert.match(vue, /fmtToksRange\(result\.effectiveToksMin, result\.effectiveToksMax\)/)
    assert.match(vue, /fmtToksRange\(result\.singleToksMin, result\.singleToksMax\)/)
    assert.match(vue, /speedRatingFromResult/)
    assert.match(vue, /result\.singleToks\.toFixed/)
    assert.doesNotMatch(vue, /fmtToksRange\(result\.decodeToksMin/)
  })

  it('量化矩阵与 Ranking 都展示单请求 tok/s，显存用每卡 displayNeeded', () => {
    const vram = src('src/components/result/VramCard.vue')
    assert.match(vram, /row\.singleToks \?\? row\.effectiveToks/)
    const ranking = src('src/pages/Ranking.vue')
    assert.match(ranking, /item\.result\.singleToks/)
    assert.match(ranking, /rankingVramNeeded/)
    assert.match(ranking, /rankingVramFree/)
    assert.doesNotMatch(ranking, /fmtGB\(item\.result\.totalNeeded\)/)
    const pie = src('src/components/result/VramPieChart.vue')
    assert.match(pie, /runtimeOverheadPerCard/)
    assert.match(pie, /activationPerCard/)
    assert.match(pie, /pieWeightGB/)
  })

  it('Markdown 量化表与分享图使用 singleToks，聚合吞吐另行列出', () => {
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
    assert.match(md, /实际吞吐/)
    assert.ok(md.includes(r.singleToks.toFixed(1)) || md.includes(String(Math.floor(r.singleToks))))
    const stats = buildShareStats(r, model('llama3_1_70b'), gpu('h100_sxm'), quant('bf16'))
    assert.equal(stats.singleToksMid, r.singleToks)
  })

  it('中文文案不再把吞吐写成吸吐，矩阵列名与 Ranking 单请求一致', () => {
    assert.equal(zh.run.batch_tip.includes('吞吐'), true)
    assert.equal(zh.run.batch_tip.includes('吸吐'), false)
    assert.equal(zh.result.sweep_throughput.includes('吸吐'), false)
    assert.equal(zh.result.quant_matrix_speed.includes('单请求'), true)
    assert.equal(zh.ranking.table_speed.includes('单请求'), true)
  })
})
