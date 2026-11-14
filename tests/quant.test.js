import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { calc, gpu, model, quant, fw, almostEqual } from './helpers.js'
import { gpuHasNativeInt4, getPrefillTflops, isInt4WeightOnlyPrefill } from '../src/utils/calc.js'

describe('量化 prefill TFLOPS', () => {
  it('Hopper 无原生 INT4：vLLM INT4 prefill 走 BF16，不套 sparse INT8 峰值', () => {
    const h100 = gpu('h100_sxm')
    assert.equal(gpuHasNativeInt4(h100), false)
    assert.equal(isInt4WeightOnlyPrefill(h100, quant('int4'), fw('vllm')), true)
    const int4 = getPrefillTflops(h100, quant('int4'), fw('vllm'), model('llama3_1_70b'))
    const bf16 = getPrefillTflops(h100, quant('bf16'), fw('vllm'), model('llama3_1_70b'))
    assert.ok(almostEqual(int4, bf16, 1e-9))
    assert.ok(int4 < 2000, `Hopper INT4 tflops should be BF16-class, got ${int4}`)
  })

  it('Ada 4090 vLLM INT4 也不套 INT4 营销峰值', () => {
    const rtx = gpu('rtx4090')
    assert.equal(gpuHasNativeInt4(rtx), false)
    const int4 = getPrefillTflops(rtx, quant('int4'), fw('vllm'), model('qwen3_4b'))
    const bf16 = getPrefillTflops(rtx, quant('bf16'), fw('vllm'), model('qwen3_4b'))
    assert.ok(almostEqual(int4, bf16, 1e-9))
  })

  it('Ampere A100 保留 INT4 Tensor Core', () => {
    const a100 = gpu('a100_sxm_80g')
    assert.equal(gpuHasNativeInt4(a100), true)
    const int4 = getPrefillTflops(a100, quant('int4'), fw('vllm'), model('llama3_1_70b'))
    const bf16 = getPrefillTflops(a100, quant('bf16'), fw('vllm'), model('llama3_1_70b'))
    assert.ok(int4 > bf16)
  })

  it('H100 vLLM INT4 TTFT 不再是 BF16 的 1/4', () => {
    const bf = calc({ quant: quant('bf16'), promptLen: 1024 })
    const i4 = calc({ quant: quant('int4'), promptLen: 1024 })
    const ratio = bf.ttft / i4.ttft
    assert.ok(ratio < 2.5, `INT4 TTFT speedup vs BF16 should not be ~4×, got ${ratio}`)
  })
})
