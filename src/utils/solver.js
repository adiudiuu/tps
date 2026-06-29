// src/utils/solver.js
// Solver 枚举引擎 + Pareto 过滤
// 给定模型，枚举 GPU × TP × PP × EP × quant × framework

import { GPU_LIST } from '../data/gpus/index.js'
import { QUANT_MAP, FRAMEWORK_MAP, INTERCONNECT_MAP } from '../data/constants.js'
import { calcAll, getQuantBytes } from './calc.js'

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
 * 计算 MoE 模型的 non-expert 参数量（与 calc.js 保持一致）
 * @param {object} model - 模型对象
 * @returns {number|null} - non-expert 参数量（B），非 MoE 返回 null
 */
function calcNonExpertParams(model) {
  if (model.type !== 'moe' || !model.experts || !model.active_params) return null
  const denom = (model.experts_per_token ?? 1) - model.experts
  if (denom === 0) return model.active_params
  const ne = (model.params * (model.experts_per_token ?? 1) - model.experts * model.active_params) / denom
  return Math.max(0, ne)
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
 * @param {boolean} opts.excludeDatacenterGpu - 是否排除数据中心卡（默认 false）
 * @param {string} opts.quantFloor      - 量化质量下限 id
 * @param {number|null} opts.minDecodeSpeed - 最低 decode 速度（tok/s）
 * @param {number|null} opts.maxTtft    - 最大 TTFT（ms）
 * @param {number} opts.ctx             - 上下文长度
 * @param {number} opts.batch           - 并发数
 * @param {number} opts.promptLen       - Prompt 长度
 * @param {number} opts.outputLen       - 输出长度
 * @param {boolean} opts.disableYield   - 是否禁用分批让出主线程（默认 false）
 * @param {function} opts.onProgress    - 进度回调 (done, total)
 * @param {function} opts.shouldCancel  - 取消检查函数
 * @returns {Promise<{ results: SolverResult[], cancelled: boolean }>}
 */
export async function solveForModel(opts) {
  const {
    model, maxGpuCount = 4, vendorFilter = null, excludeDatacenterGpu = false,
    quantFloor = 'none', minDecodeSpeed = null, maxTtft = null,
    ctx = 4096, batch = 1, promptLen = 512, outputLen = 256,
    disableYield = false,
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
    if (vendorFilter && vendorFilter !== 'all') {
      if (g.vendor !== vendorFilter) return false
    }
    if (excludeDatacenterGpu && g.tier === 'datacenter') return false
    return true
  })

  // 过滤框架（跳过 theory，只保留实际框架）
  const frameworks = FRAMEWORK_MAP.filter(f => f.id !== 'theory')

  // 预计算 MoE 模型的 non-expert 参数量
  const nonExpertParams = calcNonExpertParams(model)
  const totalExpertParams = nonExpertParams != null ? model.params - nonExpertParams : null

  // 预估最低显存需求（EP+TP 最大分片下的 INT4 每卡需求），用于第一层剪枝
  const maxPossibleEp = (model.type === 'moe' && model.experts)
    ? Math.min(model.experts, maxGpuCount)
    : 1
  const minWeightPerCardGB = (nonExpertParams != null)
    ? ((nonExpertParams + (model.params - nonExpertParams) / maxPossibleEp) * (QUANT_MAP.find(q => q.id === 'int4')?.gguf_bytes ?? 0.615)) / maxGpuCount
    : (model.params * (QUANT_MAP.find(q => q.id === 'int4')?.gguf_bytes ?? 0.615)) / maxGpuCount

  // 构建任务列表（提前剪枝）
  const tasks = []
  for (const gpu of gpus) {
    // 第一层剪枝：单卡显存连 EP+TP 最大分片下的 INT4 都装不下，跳过该 GPU
    const usableVram = gpu.vram * (gpu.usableRatio ?? 1.0)
    if (usableVram < minWeightPerCardGB * 0.8) continue

    for (const totalGpuCount of totalGpuCounts) {
      // 提前剪枝：极小模型（< 1B）跳过多卡配置（1 卡足够，多卡无意义）
      if (model.params < 1 && totalGpuCount > 1) continue

      for (const ppCount of getPpOptions(model, totalGpuCount)) {
        const gpuCount = totalGpuCount / ppCount
        const interconnect = autoInterconnect(gpu, gpuCount)
        const epOptions = getEpOptions(model, gpuCount)

        for (const quant of quants) {
          // EP 循环提前到 quant 同层，让剪枝能感知 EP 分片
          for (const epCount of epOptions) {
            // 第二层剪枝：计算 EP 感知的每卡权重
            let perCardWeightGB
            const quantBytes = getQuantBytes(quant, gpu, framework)
            if (epCount > 1 && totalExpertParams != null) {
              // MoE + EP: 每卡存完整 non-expert + 1/epCount 的 expert，再除以 TP 分片数
              perCardWeightGB = ((nonExpertParams + totalExpertParams / epCount) * quantBytes) / gpuCount
            } else {
              // Dense 或 EP=1: 总参数 / TP 分片数
              perCardWeightGB = (model.params * quantBytes) / gpuCount
            }

            // 与单卡可用显存比较（而非总显存）
            if (perCardWeightGB > usableVram * 1.1) continue

            for (const framework of frameworks) {
              if (!frameworkSupportsGpu(framework, gpu)) continue

              // 提前剪枝：极小模型（< 1B）只保留高效框架
              if (model.params < 1 && !['vllm', 'sglang', 'llamacpp', 'mlx', 'llamacpp_metal'].includes(framework.id)) continue

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

        const row = {
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
          tpEfficiency: r.tpEfficiency,
          bottleneck: r.bottleneck,
        }
        row.insight = generateInsight(row)
        results.push(row)
      } catch {
        // 忽略计算错误
      }
    }

    onProgress?.(Math.min(i + BATCH_SIZE, total), total)
    // 让出主线程（某些环境 requestIdleCallback 可能导致卡住，可按需禁用）
    if (!disableYield) {
      await yieldToMain()
    }
  }

  return { results: computePareto(pruneEquivalentResults(results)), cancelled: false }
}

/**
 * 为每条结果生成洞察建议
 * @param {object} row - 单条 solver 结果
 * @returns {string|null} - 洞察文本，多条用分号分隔
 */
function generateInsight(row) {
  const lines = []

  // 显存余量检查
  if (row.vramPct > 85) {
    lines.push('显存余量不足 15%，不建议增加上下文')
  }
  if (row.vramPct < 30) {
    lines.push('显存充裕，可大幅增加上下文或 batch')
  }

  // 多卡效率检查
  if (row.gpuCount > 1 && row.tpEfficiency != null) {
    if (row.tpEfficiency < 0.75) {
      lines.push('多卡通信效率偏低，带宽是瓶颈')
    } else if (row.tpEfficiency > 0.95) {
      lines.push('多卡扩展效率优秀')
    }
  }

  // 量化质量检查
  if (row.quant?.quality === 'ok' || row.quant?.quality === 'poor') {
    lines.push('当前量化对质量有明显影响')
  }

  // 瓶颈检查
  if (row.bottleneck === 'compute') {
    lines.push('算力瓶颈，增加 GPU 数量收益有限')
  }

  return lines.length > 0 ? lines.join('；') : null
}

/**
 * 计算 Pareto 前沿
 * 目标：速度越大越好，显存越小越好，GPU 数量越少越好
 *
 * @param {object[]} results
 */
function computePareto(results) {
  if (results.length === 0) return []

  // 大结果集时跳过全量 O(n^2) Pareto，避免长时间卡在 100% 进度。
  // 保留按速度排序，并将前若干条标记为 Pareto 候选，确保界面可快速返回可用结果。
  if (results.length > 2000) {
    const sorted = [...results].sort((a, b) => b.decodeSpeed - a.decodeSpeed)
    const paretoCap = Math.min(200, sorted.length)
    return sorted.map((r, i) => ({ ...r, isPareto: i < paretoCap }))
  }

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
    let done = false
    const finish = () => {
      if (done) return
      done = true
      resolve()
    }

    if (typeof requestIdleCallback !== 'undefined') {
      // Some environments may throttle/skip idle callbacks; timer ensures progress.
      requestIdleCallback(finish, { timeout: 50 })
      setTimeout(finish, 60)
    } else {
      setTimeout(finish, 0)
    }
  })
}

/**
 * 升级路径求解器：给定当前配置，枚举最小改动方案以达到目标速度
 *
 * @param {object} opts
 * @param {object} opts.currentGpu      - 当前 GPU 对象
 * @param {number} opts.currentGpuCount - 当前 GPU 数量
 * @param {object} opts.currentQuant    - 当前量化精度
 * @param {object} opts.model           - 模型对象
 * @param {number} opts.targetSpeed     - 目标速度（tok/s）
 * @param {number} opts.ctx             - 上下文长度
 * @param {number} opts.batch           - 并发数
 * @param {number} opts.promptLen       - Prompt 长度
 * @param {number} opts.outputLen       - 输出长度
 * @param {function} opts.onProgress    - 进度回调
 * @param {function} opts.shouldCancel  - 取消检查函数
 * @returns {Promise<{ results: Array, cancelled: boolean }>}
 */
export async function solveUpgrade(opts) {
  const {
    currentGpu, currentGpuCount, currentQuant, model,
    targetSpeed, ctx = 4096, batch = 1, promptLen = 512, outputLen = 256,
    onProgress, shouldCancel,
  } = opts

  const upgradePaths = []
  const frameworks = FRAMEWORK_MAP.filter(f => f.id !== 'theory')

  // 策略 1: 增加同型号 GPU（2x, 4x, 8x）
  for (const newCount of [currentGpuCount * 2, currentGpuCount * 4, currentGpuCount * 8]) {
    if (newCount > 8) continue
    const interconnect = autoInterconnect(currentGpu, newCount)

    for (const framework of frameworks) {
      if (!frameworkSupportsGpu(framework, currentGpu)) continue

      try {
        const r = calcAll({
          gpu: currentGpu,
          gpuCount: newCount,
          ppCount: 1,
          epCount: 1,
          interconnect,
          model,
          quant: currentQuant,
          ctx,
          batch,
          promptLen,
          outputLen,
          framework,
          flashAttention: true,
        })

        if (r.vramOk && r.singleToks >= targetSpeed) {
          upgradePaths.push({
            type: 'add_gpu',
            gpu: currentGpu,
            gpuCount: newCount,
            ppCount: 1,
            epCount: 1,
            totalGpuCount: newCount,
            interconnect,
            quant: currentQuant,
            framework,
            vramNeeded: r.totalNeeded,
            decodeSpeed: r.singleToks,
            ttft: r.ttft,
            totalVram: r.totalVram,
            vramPct: r.vramPct,
            tpEfficiency: r.tpEfficiency,
            bottleneck: r.bottleneck,
            changeDesc: `增加到 ${newCount} 张 ${currentGpu.name}`,
            costMultiplier: newCount / currentGpuCount,
          })
        }
      } catch {
        // 忽略计算错误
      }
    }
  }

  // 策略 2: 升级量化精度（保持 GPU 数量不变）
  const betterQuants = QUANT_MAP.filter(q => q.bytes > currentQuant.bytes)
  for (const quant of betterQuants) {
    const interconnect = autoInterconnect(currentGpu, currentGpuCount)

    for (const framework of frameworks) {
      if (!frameworkSupportsGpu(framework, currentGpu)) continue

      try {
        const r = calcAll({
          gpu: currentGpu,
          gpuCount: currentGpuCount,
          ppCount: 1,
          epCount: 1,
          interconnect,
          model,
          quant,
          ctx,
          batch,
          promptLen,
          outputLen,
          framework,
          flashAttention: true,
        })

        if (r.vramOk && r.singleToks >= targetSpeed) {
          upgradePaths.push({
            type: 'upgrade_quant',
            gpu: currentGpu,
            gpuCount: currentGpuCount,
            ppCount: 1,
            epCount: 1,
            totalGpuCount: currentGpuCount,
            interconnect,
            quant,
            framework,
            vramNeeded: r.totalNeeded,
            decodeSpeed: r.singleToks,
            ttft: r.ttft,
            totalVram: r.totalVram,
            vramPct: r.vramPct,
            tpEfficiency: r.tpEfficiency,
            bottleneck: r.bottleneck,
            changeDesc: `升级量化到 ${quant.label}`,
            costMultiplier: 1,
          })
        }
      } catch {
        // 忽略计算错误
      }
    }
  }

  // 策略 3: 换更大显存的同厂商 GPU（单卡）
  const sameVendorGpus = GPU_LIST.filter(g =>
    g.vendor === currentGpu.vendor &&
    g.vram > currentGpu.vram &&
    g.id !== currentGpu.id
  ).sort((a, b) => a.vram - b.vram) // 按显存从小到大排序

  for (const newGpu of sameVendorGpus) {
    const interconnect = autoInterconnect(newGpu, 1)

    for (const framework of frameworks) {
      if (!frameworkSupportsGpu(framework, newGpu)) continue

      try {
        const r = calcAll({
          gpu: newGpu,
          gpuCount: 1,
          ppCount: 1,
          epCount: 1,
          interconnect,
          model,
          quant: currentQuant,
          ctx,
          batch,
          promptLen,
          outputLen,
          framework,
          flashAttention: true,
        })

        if (r.vramOk && r.singleToks >= targetSpeed) {
          upgradePaths.push({
            type: 'upgrade_gpu',
            gpu: newGpu,
            gpuCount: 1,
            ppCount: 1,
            epCount: 1,
            totalGpuCount: 1,
            interconnect,
            quant: currentQuant,
            framework,
            vramNeeded: r.totalNeeded,
            decodeSpeed: r.singleToks,
            ttft: r.ttft,
            totalVram: r.totalVram,
            vramPct: r.vramPct,
            tpEfficiency: r.tpEfficiency,
            bottleneck: r.bottleneck,
            changeDesc: `换成 ${newGpu.name}`,
            costMultiplier: newGpu.vram / currentGpu.vram, // 粗略估算成本比例
          })
        }
      } catch {
        // 忽略计算错误
      }
    }
  }

  onProgress?.(upgradePaths.length, upgradePaths.length)
  await yieldToMain()

  // 按成本倍数排序（优先推荐成本低的方案）
  upgradePaths.sort((a, b) => {
    if (a.costMultiplier !== b.costMultiplier) {
      return a.costMultiplier - b.costMultiplier
    }
    // 成本相同时，优先推荐速度更快的
    return b.decodeSpeed - a.decodeSpeed
  })

  // 为每个方案生成 insight
  for (const path of upgradePaths) {
    path.insight = generateInsight(path)
  }

  return { results: upgradePaths, cancelled: isCancelled(shouldCancel) }
}
