import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { calcAll } from '../src/utils/calc.js'
import { calc, gpu, model, quant, fw, ic } from './helpers.js'
import { autoInterconnect } from '../src/utils/interconnect.js'

describe('非法输入 / 默认互联 / 不支持架构', () => {
  it('缺 gpu/model 时抛明确错误', () => {
    assert.throws(() => calcAll({}), /required/)
  })

  it('batch/ctx 非正数被夹紧，结果有限', () => {
    const r = calc({ batch: 0, ctx: -1, promptLen: 0, gpuCount: 0 })
    assert.ok(Number.isFinite(r.singleToks))
    assert.ok(Number.isFinite(r.ttft))
    assert.ok(r.gpuCount >= 1)
  })

  it('无 NVLink 的 4090 默认 PCIe 而不是 NVLink 5', () => {
    const picked = autoInterconnect(gpu('rtx4090'), 8)
    assert.equal(picked.id, 'pcie4')
    const nv = autoInterconnect(gpu('h100_sxm'), 8)
    assert.equal(nv.id, 'nvlink4')
    const single = autoInterconnect(gpu('h100_sxm'), 1)
    assert.match(single.id, /^pcie/)
  })

  it('llama.cpp 串行 TTFT 随 batch 增加，vLLM 不叠乘', () => {
    const serial1 = calc({ framework: fw('llamacpp'), batch: 1, promptLen: 512 })
    const serial8 = calc({ framework: fw('llamacpp'), batch: 8, promptLen: 512 })
    const cont1 = calc({ framework: fw('vllm'), batch: 1, promptLen: 512 })
    const cont8 = calc({ framework: fw('vllm'), batch: 8, promptLen: 512 })
    assert.ok(serial8.ttft > serial1.ttft * 4)
    assert.ok(Math.abs(cont8.ttft / cont1.ttft - 1) < 0.15)
  })
})
