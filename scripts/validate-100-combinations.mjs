// scripts/validate-100-combinations.mjs
// 基于真实数据的100个组合，对比系统计算结果

import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// 导入真实基准测试数据（100个组合）
const benchmarksModule = await import(pathToFileURL(path.join(__dirname, 'find-real-benchmarks.mjs')).href)

// 从 find-real-benchmarks.mjs 提取 KNOWN_BENCHMARKS
// 由于该文件是一个脚本，我们需要直接读取并解析
import { readFileSync } from 'node:fs'

const benchmarksContent = readFileSync(path.join(__dirname, 'find-real-benchmarks.mjs'), 'utf8')
const benchmarksMatch = benchmarksContent.match(/const KNOWN_BENCHMARKS = \[([\s\S]*?)\n\]/m)

if (!benchmarksMatch) {
  throw new Error('无法从 find-real-benchmarks.mjs 中提取 KNOWN_BENCHMARKS')
}

// 使用 eval 来解析数组（注意：这只在受信任的代码中使用）
const KNOWN_BENCHMARKS = eval(`[${benchmarksMatch[1]}]`)

console.log(`✅ 加载了 ${KNOWN_BENCHMARKS.length} 条真实基准测试数据\n`)

// 量化配置映射
const QUANT_MAP = {
  'int4': { bytes: 0.5, label: 'INT4', flops_key: 'int4', kv_bytes: 2.0 },
  'fp16': { bytes: 2.0, label: 'FP16', flops_key: 'bf16', kv_bytes: 2.0 },
  'bf16': { bytes: 2.0, label: 'BF16', flops_key: 'bf16', kv_bytes: 2.0 },
}

// 框架配置
const FRAMEWORK_MAP = {
  'llamacpp': { label: 'llama.cpp', decode: 0.85, prefill: 0.75, decodeMin: 0.75, decodeMax: 0.95 },
  'vllm': { label: 'vLLM', decode: 0.95, prefill: 0.90, decodeMin: 0.85, decodeMax: 1.0 },
  'transformers': { label: 'Transformers', decode: 0.70, prefill: 0.65, decodeMin: 0.60, decodeMax: 0.80 },
}

// 简化的计算函数（基于 calc.js 逻辑）
function calculateSpeed({ gpu, model, quant, ctx, batch = 1, framework }) {
  const activeWeight = model.type === 'moe'
    ? (model.active_params ?? model.params) * quant.bytes
    : model.params * quant.bytes
  
  const kvBytesPerElem = quant.kv_bytes ?? 2.0
  const avgDecodeSeqLen = Math.max(1, Math.min(ctx, ctx / 2))
  
  let kvReadGB
  if (model.sliding_window != null && model.local_layers != null) {
    const globalLayers = model.layers - model.local_layers
    const globalKvHeads = model.global_kv_heads ?? model.kv_heads
    const globalHeadDim = model.global_head_dim ?? model.head_dim
    kvReadGB = 2 * batch * kvBytesPerElem * (
      globalLayers * globalKvHeads * globalHeadDim * avgDecodeSeqLen +
      model.local_layers * model.kv_heads * model.head_dim * Math.min(avgDecodeSeqLen, model.sliding_window)
    ) / 1e9
  } else {
    kvReadGB = 2 * model.layers * model.kv_heads * model.head_dim * avgDecodeSeqLen * batch * kvBytesPerElem / 1e9
  }
  
  if (model.mla_ratio) kvReadGB *= model.mla_ratio
  
  const decodeBytesPerStep = activeWeight + kvReadGB
  const effectiveBw = gpu.bw
  const bwLimit = (effectiveBw / decodeBytesPerStep) * batch
  const decodeToks = bwLimit * framework.decode
  
  return {
    calculated: decodeToks,
    bwLimit,
    decodeBytesPerStep,
    kvReadGB,
    activeWeight,
  }
}

async function loadModels() {
  const modelsDir = path.join(rootDir, 'src', 'data', 'models')
  const models = {}
  
  // 从真实数据中提取所有唯一的模型ID
  const uniqueModels = [...new Set(KNOWN_BENCHMARKS.map(b => b.model))]
  
  for (const modelId of uniqueModels) {
    try {
      const filePath = path.join(modelsDir, modelId, 'index.js')
      const mod = await import(pathToFileURL(filePath).href)
      models[modelId] = mod.default
    } catch (err) {
      console.warn(`⚠️  无法加载模型 ${modelId}: ${err.message}`)
    }
  }
  
  return models
}

async function loadGPUs() {
  const gpusIndexPath = path.join(rootDir, 'src', 'data', 'gpus', 'index.js')
  const mod = await import(pathToFileURL(gpusIndexPath).href)
  const allGPUs = mod.GPU_LIST || []
  
  const gpus = {}
  for (const gpu of allGPUs) {
    gpus[gpu.id] = gpu
  }
  
  return gpus
}

function analyzeError(real, calculated) {
  const error = ((calculated - real) / real) * 100
  const absError = Math.abs(error)
  
  let level = 'good'
  if (absError > 50) level = 'bad'
  else if (absError > 30) level = 'poor'
  else if (absError > 15) level = 'fair'
  
  return { error, absError, level }
}

async function main() {
  console.log('🔬 基于真实数据的100个组合，对比系统计算结果\n')
  
  const models = await loadModels()
  const gpus = await loadGPUs()
  
  console.log(`✅ 加载了 ${Object.keys(models).length} 个模型`)
  console.log(`✅ 加载了 ${Object.keys(gpus).length} 个 GPU\n`)
  
  console.log(`📊 总组合数: ${KNOWN_BENCHMARKS.length}\n`)
  
  const comparisons = []
  const errors = []
  let hasSpeedCount = 0
  let noSpeedCount = 0
  let oomCount = 0
  
  for (const bench of KNOWN_BENCHMARKS) {
    const model = models[bench.model]
    const gpu = gpus[bench.gpu]
    
    if (!model || !gpu) {
      console.warn(`⚠️  跳过: ${bench.model} + ${bench.gpu} (模型或GPU不存在)`)
      continue
    }
    
    const quant = QUANT_MAP[bench.quant] || QUANT_MAP['int4']
    const framework = FRAMEWORK_MAP[bench.framework] || FRAMEWORK_MAP['llamacpp']
    
    const result = calculateSpeed({
      gpu,
      model,
      quant,
      ctx: bench.ctx,
      batch: 1,
      framework,
    })
    
    const isOOM = bench.notes && bench.notes.includes('OOM')
    const isUntested = bench.notes && (bench.notes.includes('未测试') || bench.notes === 'Q3_K_M 可以完全装入 24GB VRAM')
    
    if (bench.speed !== null && bench.speed !== undefined) {
      // 有真实速度数据
      hasSpeedCount++
      const analysis = analyzeError(bench.speed, result.calculated)
      
      comparisons.push({
        model: bench.model,
        gpu: bench.gpu,
        quant: bench.quant,
        ctx: bench.ctx,
        framework: bench.framework,
        real: bench.speed,
        calculated: result.calculated,
        error: analysis.error,
        absError: analysis.absError,
        level: analysis.level,
        source: bench.source,
        hasSpeed: true,
        isOOM: false,
        isUntested: false,
        notes: bench.notes,
        details: result,
      })
      
      errors.push(analysis.absError)
    } else if (isOOM) {
      // OOM 情况
      oomCount++
      comparisons.push({
        model: bench.model,
        gpu: bench.gpu,
        quant: bench.quant,
        ctx: bench.ctx,
        framework: bench.framework,
        real: null,
        calculated: result.calculated,
        error: null,
        absError: null,
        level: 'oom',
        source: bench.source,
        hasSpeed: false,
        isOOM: true,
        isUntested: false,
        notes: bench.notes,
        details: result,
      })
    } else {
      // 未测试情况
      noSpeedCount++
      comparisons.push({
        model: bench.model,
        gpu: bench.gpu,
        quant: bench.quant,
        ctx: bench.ctx,
        framework: bench.framework,
        real: null,
        calculated: result.calculated,
        error: null,
        absError: null,
        level: 'untested',
        source: bench.source,
        hasSpeed: false,
        isOOM: false,
        isUntested: true,
        notes: bench.notes,
        details: result,
      })
    }
  }
  
  console.log(`✅ 有真实速度数据: ${hasSpeedCount} 个组合`)
  console.log(`🔴 OOM (显存不足): ${oomCount} 个组合`)
  console.log(`⚪ 未测试: ${noSpeedCount} 个组合\n`)
  
  // 排序：有真实数据的按误差排序
  const withSpeed = comparisons.filter(c => c.hasSpeed).sort((a, b) => b.absError - a.absError)
  const withOOM = comparisons.filter(c => c.isOOM)
  const withUntested = comparisons.filter(c => c.isUntested)
  
  console.log('📊 对比结果（有真实速度数据的组合，按误差排序）:\n')
  console.log('模型'.padEnd(18) + 'GPU'.padEnd(18) + '量化'.padEnd(8) + '真实'.padEnd(12) + '计算'.padEnd(12) + '误差'.padEnd(14) + '等级')
  console.log('─'.repeat(100))
  
  for (const comp of withSpeed) {
    const errorStr = `${comp.error > 0 ? '+' : ''}${comp.error.toFixed(1)}%`
    const levelEmoji = {
      'good': '✅',
      'fair': '⚠️',
      'poor': '❌',
      'bad': '🔴',
    }[comp.level]
    
    console.log(
      comp.model.padEnd(18) +
      comp.gpu.padEnd(18) +
      comp.quant.padEnd(8) +
      comp.real.toFixed(1).padEnd(12) +
      comp.calculated.toFixed(1).padEnd(12) +
      errorStr.padEnd(14) +
      levelEmoji
    )
  }
  
  console.log('\n🔴 OOM 组合（显存不足，前20个）:\n')
  console.log('模型'.padEnd(18) + 'GPU'.padEnd(18) + '量化'.padEnd(8) + '计算速度'.padEnd(15) + '状态')
  console.log('─'.repeat(75))
  
  for (const comp of withOOM.slice(0, 20)) {
    console.log(
      comp.model.padEnd(18) +
      comp.gpu.padEnd(18) +
      comp.quant.padEnd(8) +
      `${comp.calculated.toFixed(1)} tok/s`.padEnd(15) +
      '🔴 OOM'
    )
  }
  
  if (withOOM.length > 20) {
    console.log(`... 还有 ${withOOM.length - 20} 个 OOM 组合`)
  }
  
  console.log('\n⚪ 未测试组合（前20个）:\n')
  console.log('模型'.padEnd(18) + 'GPU'.padEnd(18) + '量化'.padEnd(8) + '计算速度'.padEnd(15) + '状态')
  console.log('─'.repeat(75))
  
  for (const comp of withUntested.slice(0, 20)) {
    console.log(
      comp.model.padEnd(18) +
      comp.gpu.padEnd(18) +
      comp.quant.padEnd(8) +
      `${comp.calculated.toFixed(1)} tok/s`.padEnd(15) +
      '⚪ 未测试'
    )
  }
  
  if (withUntested.length > 20) {
    console.log(`... 还有 ${withUntested.length - 20} 个未测试组合`)
  }
  
  console.log('\n📈 统计分析:\n')
  
  if (errors.length > 0) {
    const avgError = errors.reduce((a, b) => a + b, 0) / errors.length
    const maxError = Math.max(...errors)
    const minError = Math.min(...errors)
    const goodCount = withSpeed.filter(c => c.level === 'good').length
    const fairCount = withSpeed.filter(c => c.level === 'fair').length
    const poorCount = withSpeed.filter(c => c.level === 'poor').length
    const badCount = withSpeed.filter(c => c.level === 'bad').length
    
    console.log(`   总组合数: ${KNOWN_BENCHMARKS.length}`)
    console.log(`   有真实速度: ${hasSpeedCount} (${(hasSpeedCount/KNOWN_BENCHMARKS.length*100).toFixed(1)}%)`)
    console.log(`   OOM: ${oomCount} (${(oomCount/KNOWN_BENCHMARKS.length*100).toFixed(1)}%)`)
    console.log(`   未测试: ${noSpeedCount} (${(noSpeedCount/KNOWN_BENCHMARKS.length*100).toFixed(1)}%)`)
    console.log(`   平均误差: ${avgError.toFixed(1)}%`)
    console.log(`   最大误差: ${maxError.toFixed(1)}%`)
    console.log(`   最小误差: ${minError.toFixed(1)}%`)
    console.log(`   ✅ 优秀 (<15%): ${goodCount} (${(goodCount/hasSpeedCount*100).toFixed(1)}%)`)
    console.log(`   ⚠️  良好 (15-30%): ${fairCount} (${(fairCount/hasSpeedCount*100).toFixed(1)}%)`)
    console.log(`   ❌ 较差 (30-50%): ${poorCount} (${(poorCount/hasSpeedCount*100).toFixed(1)}%)`)
    console.log(`   🔴 很差 (>50%): ${badCount} (${(badCount/hasSpeedCount*100).toFixed(1)}%)`)
    
    console.log('\n🔍 误差分析:\n')
    
    // 按框架分组
    const byFramework = {}
    for (const comp of withSpeed) {
      if (!byFramework[comp.framework]) byFramework[comp.framework] = []
      byFramework[comp.framework].push(comp.absError)
    }
    
    console.log('按框架分组:')
    for (const [fw, errs] of Object.entries(byFramework)) {
      const avg = errs.reduce((a, b) => a + b, 0) / errs.length
      console.log(`   ${fw}: 平均误差 ${avg.toFixed(1)}% (${errs.length} 个样本)`)
    }
    
    // 按量化分组
    const byQuant = {}
    for (const comp of withSpeed) {
      if (!byQuant[comp.quant]) byQuant[comp.quant] = []
      byQuant[comp.quant].push(comp.absError)
    }
    
    console.log('\n按量化分组:')
    for (const [q, errs] of Object.entries(byQuant)) {
      const avg = errs.reduce((a, b) => a + b, 0) / errs.length
      console.log(`   ${q}: 平均误差 ${avg.toFixed(1)}% (${errs.length} 个样本)`)
    }
    
    // 按GPU分组
    const byGPU = {}
    for (const comp of withSpeed) {
      if (!byGPU[comp.gpu]) byGPU[comp.gpu] = []
      byGPU[comp.gpu].push(comp.absError)
    }
    
    console.log('\n按GPU分组:')
    const gpuErrors = Object.entries(byGPU).map(([gpu, errs]) => ({
      gpu,
      avg: errs.reduce((a, b) => a + b, 0) / errs.length,
      count: errs.length,
    })).sort((a, b) => b.avg - a.avg)
    
    for (const { gpu, avg, count } of gpuErrors) {
      console.log(`   ${gpu}: 平均误差 ${avg.toFixed(1)}% (${count} 个样本)`)
    }
    
    // 按模型分组
    const byModel = {}
    for (const comp of withSpeed) {
      if (!byModel[comp.model]) byModel[comp.model] = []
      byModel[comp.model].push(comp.absError)
    }
    
    console.log('\n按模型分组:')
    const modelErrors = Object.entries(byModel).map(([model, errs]) => ({
      model,
      avg: errs.reduce((a, b) => a + b, 0) / errs.length,
      count: errs.length,
    })).sort((a, b) => b.avg - a.avg)
    
    for (const { model, avg, count } of modelErrors) {
      console.log(`   ${model}: 平均误差 ${avg.toFixed(1)}% (${count} 个样本)`)
    }
    
    console.log('\n💡 优化建议:\n')
    
    if (avgError > 30) {
      console.log('   🔴 整体误差较大，建议：')
      console.log('      1. 检查框架效率系数（decode/prefill factor）')
      console.log('      2. 验证 KV Cache 计算公式')
      console.log('      3. 考虑添加 GPU 特定的性能修正系数')
      console.log('      4. vLLM 框架的误差特别大，需要单独优化')
      console.log('      5. 数据中心GPU（H100/A100）误差很大，可能需要考虑batch size和上下文长度的影响')
    } else if (avgError > 15) {
      console.log('   ⚠️  整体误差中等，建议：')
      console.log('      1. 针对高误差 GPU 添加校准系数')
      console.log('      2. 优化不同上下文长度的性能模型')
      console.log('      3. 考虑添加模型架构特定的修正')
    } else {
      console.log('   ✅ 整体误差较小，系统计算较准确')
      console.log('      可以针对个别高误差情况进行微调')
    }
    
    // 找出最大误差的案例
    const worstCases = withSpeed.slice(0, 5)
    console.log('\n🔴 最大误差案例（前5个）:\n')
    for (const comp of worstCases) {
      console.log(`   ${comp.model} + ${comp.gpu} (${comp.quant}, ${comp.framework}):`)
      console.log(`      真实: ${comp.real.toFixed(1)} tok/s`)
      console.log(`      计算: ${comp.calculated.toFixed(1)} tok/s`)
      console.log(`      误差: ${comp.error.toFixed(1)}%`)
      console.log(`      来源: ${comp.source}`)
      console.log(`      带宽限制: ${comp.details.bwLimit.toFixed(1)} tok/s`)
      console.log(`      每步读取: ${comp.details.decodeBytesPerStep.toFixed(2)} GB`)
      if (comp.notes) console.log(`      备注: ${comp.notes}`)
      console.log()
    }
  }
  
  console.log('✅ 分析完成！\n')
  
  return { comparisons, errors, hasSpeedCount, oomCount, noSpeedCount }
}

main().catch(err => {
  console.error('❌ 错误:', err)
  console.error(err.stack)
  process.exit(1)
})
