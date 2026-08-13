/**
 * Roofline 之上的独立校准层。
 *
 * 校准后 tok/s = roofline_toks × Π(相关因子)。
 * 因子默认 1；只对「该框架下真实测过的家族」写入非 1 系数。
 * 拟合靶是当前常见部署版本（llama.cpp 新核、现行 vLLM/SGLang/MLX），不是 2024 旧核。
 *
 * 为什么不是 180 元（15×12）格子回归：
 * 格子模型会给没测过的「卡×模型」编造一个系数，邻格外推会胡来。
 * 这里按框架 / 卡类 / 结构档 / 阶段 / 可选 batch·TP 分层残差，
 * 未出现过的键保持 1.0，vLLM 的残差不会乘到 llama.cpp 上。
 */
import { CALIBRATION_FACTORS } from '../data/calibrationFactors.js'

export const CALIBRATION_ENABLED = true

const HBM_ID = /^(a100|a800|h100|h200|h800|b200|b300|gb200|gb300|v100|a30)/
const PRO_ID = /^(rtx_a|rtx_pro|rtx\d{4}_ada|rtx\d{4}_sff_ada|rtx6000|rtx5880|l40|l4$|a40|a10|t4)/

export function gpuClassOf(gpu) {
  if (!gpu) return 'unknown'
  if (gpu.vendor === 'apple') return 'apple'
  const id = String(gpu.id || '')
  if (gpu.vendor === 'nvidia') {
    if (HBM_ID.test(id) || (gpu.tier === 'datacenter' && (gpu.bw || 0) >= 1500)) return 'hbm'
    if (gpu.tier === 'datacenter' || PRO_ID.test(id)) return 'gddr_pro'
    return 'gddr_consumer'
  }
  if (gpu.vendor === 'amd' && (gpu.tier === 'datacenter' || (gpu.bw || 0) >= 1500)) return 'hbm'
  return 'gddr_consumer'
}

export function archBinOf(model) {
  if (!model) return 'dense_small'
  if (model.mla_ratio) return 'mla'
  if (model.type === 'moe') return 'moe'
  const p = Number(model.params) || 0
  if (p >= 40) return 'dense_70b'
  if (p >= 20) return 'dense_mid'
  return 'dense_small'
}

export function batchBinOf(batch) {
  const b = Number(batch) || 1
  if (b <= 1) return '1'
  if (b <= 16) return 'mid'
  return 'high'
}

function factorAt(table, key, phase) {
  const row = table?.[key]
  if (!row) return 1
  const v = row[phase]
  return Number.isFinite(v) && v > 0 ? v : 1
}

function clampProduct(x) {
  if (!Number.isFinite(x) || x <= 0) return 1
  // 2025 llama.cpp FA prefill 相对 2024 核可到 ~2×；仍封顶避免没测过的组合炸
  return Math.min(2.5, Math.max(0.45, x))
}

/**
 * @param {object} ctx
 * @param {object} ctx.gpu
 * @param {object} ctx.model
 * @param {object} ctx.framework
 * @param {number} [ctx.batch]
 * @param {number} [ctx.tpCount]
 */
export function getCalibrationScales(ctx) {
  if (!CALIBRATION_ENABLED) return { decode: 1, prefill: 1 }
  const fw = ctx?.framework?.id
  if (!fw || fw === 'theory') return { decode: 1, prefill: 1 }

  const gc = gpuClassOf(ctx.gpu)
  const arch = archBinOf(ctx.model)
  const bb = batchBinOf(ctx.batch)
  const F = CALIBRATION_FACTORS
  const gpuKey = `${fw}|${gc}`
  const archKey = `${fw}|${arch}`
  const batchKey = `${fw}|${bb}`
  const tpDecode = (
    fw === 'llamacpp'
    && (ctx.tpCount || 1) > 1
    && arch === 'dense_70b'
  ) ? (Number(F.llamacppTp) > 0 ? F.llamacppTp : 1) : 1

  const decode = clampProduct(
    factorAt(F.framework, fw, 'decode')
    * factorAt(F.gpuClass, gpuKey, 'decode')
    * factorAt(F.arch, archKey, 'decode')
    * factorAt(F.batchBin, batchKey, 'decode')
    * tpDecode,
  )
  const prefill = clampProduct(
    factorAt(F.framework, fw, 'prefill')
    * factorAt(F.gpuClass, gpuKey, 'prefill')
    * factorAt(F.arch, archKey, 'prefill'),
  )
  return { decode, prefill }
}

function scaleField(obj, key, scale) {
  if (!Number.isFinite(obj[key])) return
  obj[key] *= scale
}

/**
 * 乘在 decode/prefill tok/s 上，并让 tpot / ttft / totalLatency 与吞吐同源。
 * 不改 bwLimit / computeLimit / roofline 比（那是物理上限）。
 */
export function applySpeedCalibration(result, ctx) {
  const { decode, prefill } = getCalibrationScales(ctx)
  result.calibrationScale = { decode, prefill }
  if (decode === 1 && prefill === 1) return result

  if (decode !== 1) {
    for (const k of [
      'decodeToks', 'decodeToksMin', 'decodeToksMax',
      'effectiveToks', 'effectiveToksMin', 'effectiveToksMax',
      'singleToks', 'singleToksMin', 'singleToksMax',
    ]) scaleField(result, k, decode)
    if (Number.isFinite(result.tpot)) result.tpot /= decode
    if (Number.isFinite(result.tokPerJoule)) result.tokPerJoule *= decode
  }
  if (prefill !== 1) {
    for (const k of ['prefillToks', 'prefillToksMin', 'prefillToksMax']) {
      scaleField(result, k, prefill)
    }
    if (Number.isFinite(result.ttft)) result.ttft /= prefill
  }
  const outputLen = ctx?.outputLen
  if (Number.isFinite(result.ttft) && Number.isFinite(result.tpot) && Number.isFinite(outputLen)) {
    result.totalLatency = result.ttft + outputLen * result.tpot
  }
  return result
}
