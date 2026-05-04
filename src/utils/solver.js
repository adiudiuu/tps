// src/utils/solver.js
// Solver 枚举引擎 + Pareto 过滤
// 给定模型，枚举 GPU × TP × PP × EP × quant × framework

import { GPU_LIST } from '../data/gpus/index.js'
import { QUANT_MAP, FRAMEWORK_MAP, INTERCONNECT_MAP } from '../data/constants.js'
import { calcAll } from './calc.js'

// Solver 使用的量化列表（跳过 fp32，保留 bf16/fp8/int8/int6/int5/int4）
export const SOLVER_QUANTS = QUANT_MAP.filter(q => q.id !== 'fp32' && q.id !== 'int3' && q.id !== 'int2')

// 量化质量下限选项
export const QUANT_FLOOR_OPTIONS = [
  { id: 'none',  label_zh: '不限',       label_en: 'Any',      minQuality: null },
  { id: 'int4',  label_zh: '≥ INT4',     label_en: '≥ INT4',   minQuality: 'ok'    },
  { id: 'int8',  label_zh: '≥ INT8/FP8', label_en: '≥ INT8',   minQuality: 'good'  },
  { id: 'bf16',  label_zh: '仅 BF16',    label_en: 'BF16 only', minQuality: 'great' },
]

// 质量等级排序（越高越好）
const QUALITY_ORDER = { bad: 0, poor: 1, ok: 2, good: 3, great: 4, best: 5 }

const SOLVER_GPU_COUNTS = [1, 2, 4, 8]

function getDefaultPcieInterconnect(gpu) {
  return INTERCONNECT_MAP.find(i => i.id === (gpu.pcie_gen === 5 ? 'pcie5' : 'pcie4'))
}

function getPpOptions(model, totalGpuCount) {
  if (totalGpuCount < 2 || (model?.params ?? 0) < 30) return [1]
  return SOLVER_GPU_COUNTS.filter(n => n <= totalGpuCount && totalGpuCount % n === 0)
}

function getEpOptions(model, tpCount) {
  if (model?.type !== 'moe' || model?.experts == null || tpCount < 2) return [1]
  const maxEp = Math.min(model.experts, tpCount)
  const options = [1]
  for (const n of SOLVER_GPU_COUNTS) {
    if (n <= maxEp && model.experts % n === 0) options.push(n)
  }
  return options
}

function makeResultKey(result) {
  return [
    result.gpu.id,
    result.gpuCount,
    result.ppCount,
    result.epCount,
    result.quant.id,
  ].join('|')
}

function pickPreferredResult(current, next) {
  if (!current) return next
  if (next.decodeSpeed !== current.decodeSpeed) return next.decodeSpeed > current.decodeSpeed ? next : current
  if (next.ttft !== current.ttft) return next.ttft < current.ttft ? next : current
  if (next.vramNeeded !== current.vramNeeded) return next.vramNeeded < current.vramNeeded ? next : current
  return next.framework.id < current.framework.id ? next : current
}

function pruneEquivalentResults(results) {
  const bestByKey = new Map()
  for (const result of results) {
    const key = makeResultKey(result)
    bestByKey.set(key, pickPreferredResult(bestByKey.get(key), result))
  }
  return [...bestByKey.values()]
}

function isCancelled(shouldCancel) {
  return shouldCancel?.() === true
}

/**
 * 根据 gpuCount 和 GPU 的 nvlink_bw 自动选择互联方式
 */
export function autoInterconnect(gpu, gpuCount) {
  if (gpuCount === 1) return getDefaultPcieInterconnect(gpu)
  const bw = gpu.nvlink_bw ?? 0
  if (bw >= 1800) return INTERCONNECT_MAP.find(i => i.id === 'nvlink5')
  if (bw >= 900)  return INTERCONNECT_MAP.find(i => i.id === 'nvlink4')
  if (bw >= 600)  return INTERCONNECT_MAP.find(i => i.id === 'nvlink3')
  return getDefaultPcieInterconnect(gpu)
}

/**
 * 判断框架是否支持该 GPU 厂商
 */
function frameworkSupportsGpu(framework, gpu) {
  if (!framework.vendors) return true
  return framework.vendors.includes(gpu.vendor)
}

/**
 * 模式 A：给定模型，枚举所有 GPU × gpuCount × quant × framework 组合
 *
 * @param {object} opts
 * @param {object} opts.model           - 模型对象
 * @param {number} opts.maxGpuCount     - 最大 GPU 数量（1/2/4/8）
 * @param {string|null} opts.vendorFilter - GPU 厂商过滤（null = 全部）
 * @param {string} opts.quantFloor      - 量化质量下限 id
 * @param {number|null} opts.minDecodeSpeed - 最低 decode 速度（tok/s）
 * @param {number|null} opts.maxTtft    - 最大 TTFT（ms）
 * @param {number} opts.ctx             - 上下文长度
 * @param {number} opts.batch           - 并发数
 * @param {number} opts.promptLen       - Prompt 长度
 * @param {number} opts.outputLen       - 输出长度
 * @param {function} opts.onProgress    - 进度回调 (done, total)
 * @param {function} opts.shouldCancel  - 取消检查函数
 * @returns {Promise<{ results: SolverResult[], cancelled: boolean }>}
 */
export async function solveForModel(opts) {
  const {
    model, maxGpuCount = 4, vendorFilter = null,
    quantFloor = 'none', minDecodeSpeed = null, maxTtft = null,
    ctx = 4096, batch = 1, promptLen = 512, outputLen = 256,
    onProgress,
    shouldCancel,
  } = opts

  const totalGpuCounts = SOLVER_GPU_COUNTS.filter(n => n <= maxGpuCount)
  const floorQuality = QUANT_FLOOR_OPTIONS.find(q => q.id === quantFloor)?.minQuality ?? null

  // 过滤量化列表
  const quants = SOLVER_QUANTS.filter(q => {
    if (!floorQuality) return true
    return (QUALITY_ORDER[q.quality] ?? 0) >= (QUALITY_ORDER[floorQuality] ?? 0)
  })

  // 过滤 GPU 列表
  const gpus = GPU_LIST.filter(g => {
    if (vendorFilter && vendorFilter !== 'all') return g.vendor === vendorFilter
    return true
  })

  // 过滤框架（跳过 theory，只保留实际框架）
  const frameworks = FRAMEWORK_MAP.filter(f => f.id !== 'theory')

  // 预估最低显存需求（仅权重，bf16），用于提前剪枝整个 GPU
  const minWeightGB = model.params * 0.5 // INT4 最低

  // 构建任务列表（提前剪枝）
  const tasks = []
  for (const gpu of gpus) {
    for (const totalGpuCount of totalGpuCounts) {
      const totalVram = gpu.vram * totalGpuCount * (gpu.usableRatio ?? 1.0)
      // 提前 OOM 剪枝：显存连 INT4 权重都装不下，跳过整个总卡数配置
      if (totalVram < minWeightGB * 0.8) continue

      for (const ppCount of getPpOptions(model, totalGpuCount)) {
        const gpuCount = totalGpuCount / ppCount
        const interconnect = autoInterconnect(gpu, gpuCount)
        const epOptions = getEpOptions(model, gpuCount)

        for (const quant of quants) {
          const roughWeightGB = model.params * quant.bytes
          if (roughWeightGB > totalVram * 1.1) continue

          for (const epCount of epOptions) {
            for (const framework of frameworks) {
              if (!frameworkSupportsGpu(framework, gpu)) continue
              tasks.push({ gpu, gpuCount, ppCount, epCount, interconnect, quant, framework })
            }
          }
        }
      }
    }
  }

  const total = tasks.length
  const results = []
  const BATCH_SIZE = 50

  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    if (isCancelled(shouldCancel)) return { results: [], cancelled: true }
    const chunk = tasks.slice(i, i + BATCH_SIZE)
    for (const task of chunk) {
      if (isCancelled(shouldCancel)) return { results: [], cancelled: true }
      try {
        const r = calcAll({
          gpu: task.gpu,
          gpuCount: task.gpuCount,
          ppCount: task.ppCount,
          epCount: task.epCount,
          interconnect: task.interconnect,
          model,
          quant: task.quant,
          ctx,
          batch,
          promptLen,
          outputLen,
          framework: task.framework,
          flashAttention: true,
        })

        if (!r.vramOk) continue
        if (minDecodeSpeed != null && r.singleToks < minDecodeSpeed) continue
        if (maxTtft != null && r.ttft > maxTtft) continue

        results.push({
          gpu: task.gpu,
          gpuCount: task.gpuCount,
          ppCount: task.ppCount,
          epCount: task.epCount,
          totalGpuCount: task.gpuCount * task.ppCount,
          interconnect: task.interconnect,
          quant: task.quant,
          framework: task.framework,
          vramNeeded: r.totalNeeded,
          decodeSpeed: r.singleToks,
          ttft: r.ttft,
          totalVram: r.totalVram,
          vramPct: r.vramPct,
        })
      } catch {
        // 忽略计算错误
      }
    }

    onProgress?.(Math.min(i + BATCH_SIZE, total), total)
    // 让出主线程
    await yieldToMain()
  }

  return { results: computePareto(pruneEquivalentResults(results)), cancelled: false }
}

/**
 * 计算 Pareto 前沿
 * 目标：速度越大越好，显存越小越好，GPU 数量越少越好
 *
 * @param {object[]} results
 */
function computePareto(results) {
  if (results.length === 0) return []

  // 标记每个方案是否被支配
  const dominated = new Array(results.length).fill(false)

  for (let i = 0; i < results.length; i++) {
    if (dominated[i]) continue
    const a = results[i]
    for (let j = 0; j < results.length; j++) {
      if (i === j || dominated[j]) continue
      const b = results[j]
      // b 支配 a：b 在所有维度上不差于 a，且至少一个维度更好
      const bDominatesA =
        b.decodeSpeed >= a.decodeSpeed &&
        b.vramNeeded  <= a.vramNeeded  &&
        (b.totalGpuCount ?? b.gpuCount) <= (a.totalGpuCount ?? a.gpuCount) &&
        (b.decodeSpeed > a.decodeSpeed || b.vramNeeded < a.vramNeeded || (b.totalGpuCount ?? b.gpuCount) < (a.totalGpuCount ?? a.gpuCount))
      if (bDominatesA) {
        dominated[i] = true
        break
      }
    }
  }

  return results.map((r, i) => ({ ...r, isPareto: !dominated[i] }))
    .sort((a, b) => b.decodeSpeed - a.decodeSpeed)
}

/**
 * 让出主线程，避免阻塞 UI
 */
function yieldToMain() {
  return new Promise(resolve => {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(resolve, { timeout: 50 })
    } else {
      setTimeout(resolve, 0)
    }
  })
}
