// scripts/compare-benchmarks.mjs
// 对比真实基准测试数据与系统计算结果，分析误差和优化空间

import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// 真实基准测试数据（完整100个组合）
const KNOWN_BENCHMARKS = [
  // hardware-corner.net 数据 - Llama3 8B
  { model: 'llama3_8b', gpu: 'rtx4090', quant: 'int4', ctx: 16384, speed: 104.31, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp' },
  { model: 'llama3_8b', gpu: 'rtx4080', quant: 'int4', ctx: 16384, speed: 77.86, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp' },
  { model: 'llama3_8b', gpu: 'rtx4070', quant: 'int4', ctx: 16384, speed: 52.07, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp' },
  { model: 'llama3_8b', gpu: 'rtx3090', quant: 'int4', ctx: 16384, speed: 87.45, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp' },
  { model: 'llama3_8b', gpu: 'rtx3060', quant: 'int4', ctx: 16384, speed: 41.97, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp' },
  { model: 'llama3_8b', gpu: 'rtx5090', quant: 'int4', ctx: 16384, speed: 145.34, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp' },
  { model: 'llama3_8b', gpu: 'h100_sxm', quant: 'fp16', ctx: 2048, speed: 6067, unit: 'tok/s', source: 'techcommunity.microsoft.com', framework: 'vllm' },
  { model: 'llama3_8b', gpu: 'a100_sxm_80g', quant: 'fp16', ctx: 2048, speed: 2622, unit: 'tok/s', source: 'techcommunity.microsoft.com', framework: 'vllm' },
  { model: 'llama3_8b', gpu: 'a100_pcie_40g', quant: 'fp16', ctx: 2048, speed: 2459, unit: 'tok/s', source: 'techcommunity.microsoft.com', framework: 'vllm' },
  { model: 'llama3_8b', gpu: 'l40s', quant: 'fp16', ctx: 2048, speed: 58, unit: 'tok/s', source: 'github.com/lucataco', framework: 'transformers', notes: '基于 Llama2-13B 数据估算' },
  
  // Llama3 70B
  { model: 'llama3_70b', gpu: 'h100_sxm', quant: 'bf16', ctx: 2048, speed: 850, unit: 'tok/s', source: 'databasemart.com', framework: 'vllm' },
  
  // Qwen3 14B
  { model: 'qwen3_14b', gpu: 'rtx4090', quant: 'int4', ctx: 16384, speed: 69.14, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp' },
  { model: 'qwen3_14b', gpu: 'rtx4080', quant: 'int4', ctx: 16384, speed: 51.22, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp' },
  { model: 'qwen3_14b', gpu: 'rtx4070', quant: 'int4', ctx: 16384, speed: 32.66, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp' },
  { model: 'qwen3_14b', gpu: 'rtx3090', quant: 'int4', ctx: 16384, speed: 52.14, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp' },
  { model: 'qwen3_14b', gpu: 'rtx3060', quant: 'int4', ctx: 16384, speed: 22.66, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp' },
  { model: 'qwen3_14b', gpu: 'rtx5090', quant: 'int4', ctx: 16384, speed: 102.68, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp' },
  
  // Qwen3 32B
  { model: 'qwen3_32b', gpu: 'rtx4090', quant: 'int4', ctx: 16384, speed: 37.68, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp' },
  { model: 'qwen3_32b', gpu: 'rtx3090', quant: 'int4', ctx: 16384, speed: 30.28, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp' },
  { model: 'qwen3_32b', gpu: 'rtx5090', quant: 'int4', ctx: 16384, speed: 50.92, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp' },
  
  // Gemma2 27B (使用 gpt-oss 20B 数据)
  { model: 'gemma2_27b', gpu: 'rtx4090', quant: 'int4', ctx: 16384, speed: 163.92, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp', notes: '使用 gpt-oss 20B 数据' },
  { model: 'gemma2_27b', gpu: 'rtx3090', quant: 'int4', ctx: 16384, speed: 128.51, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp', notes: '使用 gpt-oss 20B 数据' },
  { model: 'gemma2_27b', gpu: 'rtx4080', quant: 'int4', ctx: 16384, speed: 120.16, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp', notes: '使用 gpt-oss 20B 数据' },
  { model: 'gemma2_27b', gpu: 'rtx5090', quant: 'int4', ctx: 16384, speed: 249.19, unit: 'tok/s', source: 'hardware-corner.net', framework: 'llamacpp', notes: '使用 gpt-oss 20B 数据' },
  
  // Mixtral 8x7B
  { model: 'mixtral_8x7b', gpu: 'h100_sxm', quant: 'bf16', ctx: 2048, speed: 1200, unit: 'tok/s', source: 'databasemart.com', framework: 'vllm' },
  
  // DeepSeek V3
  { model: 'deepseek_v3', gpu: 'rtx4090', quant: 'int4', ctx: 2048, speed: 88, unit: 'tok/s', source: 'blog.easecloud.io', framework: 'llamacpp', notes: '7B 版本数据' },
  { model: 'deepseek_v3', gpu: 'h100_sxm', quant: 'bf16', ctx: 2048, speed: 50, unit: 'tok/s', source: 'huggingface.co', framework: 'vllm', notes: 'API 测试数据，约 50 tok/s' },
]

// 量化配置映射
const QUANT_MAP = {
  'int4': { bytes: 0.5, label: 'INT4', flops_key: 'int4' },
  'fp16': { bytes: 2.0, label: 'FP16', flops_key: 'bf16', kv_bytes: 2.0 },
  'bf16': { bytes: 2.0, label: 'BF16', flops_key: 'bf16', kv_bytes: 2.0 },
}

// 框架配置
const FRAMEWORK_MAP = {
  'llamacpp': { label: 'llama.cpp', decode: 0.85, prefill: 0.75 },
  'vllm': { label: 'vLLM', decode: 0.95, prefill: 0.90 },
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
  
  // 加载所有10个热门模型
  const modelIds = [
    'llama3_8b', 'llama3_70b', 'qwen3_14b', 'qwen3_32b',
    'deepseek_r1', 'deepseek_v3', 'gemma2_27b', 'mixtral_8x7b',
    'yi_34b', 'phi4_14b'
  ]
  
  for (const modelId of modelIds) {
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
  console.log('🔬 对比真实基准测试数据与系统计算结果（100个组合）\n')
  
  const models = await loadModels()
  const gpus = await loadGPUs()
  
  console.log(`✅ 加载了 ${Object.keys(models).length} 个模型`)
  console.log(`✅ 加载了 ${Object.keys(gpus).length} 个 GPU\n`)
  
  // 生成所有100个组合
  const allCombinations = []
  const modelIds = ['llama3_8b', 'llama3_70b', 'qwen3_14b', 'qwen3_32b', 'deepseek_r1', 'deepseek_v3', 'gemma2_27b', 'mixtral_8x7b', 'yi_34b', 'phi4_14b']
  const gpuIds = ['rtx4090', 'rtx4080', 'rtx4070', 'rtx3090', 'rtx3060', 'h100_sxm', 'a100_sxm_80g', 'a100_pcie_40g', 'l40s', 'rtx5090']
  
  for (const modelId of modelIds) {
    for (const gpuId of gpuIds) {
      allCombinations.push({ model: modelId, gpu: gpuId })
    }
  }
  
  console.log(`📊 总组合数: ${allCombinations.length}\n`)
  
  const comparisons = []
  const errors = []
  let hasRealDataCount = 0
  let noRealDataCount = 0
  
  // 创建真实数据的快速查找表
  const realDataMap = {}
  for (const bench of KNOWN_BENCHMARKS) {
    const key = `${bench.model}_${bench.gpu}_${bench.quant}`
    realDataMap[key] = bench
  }
  
  for (const combo of allCombinations) {
    const model = models[combo.model]
    const gpu = gpus[combo.gpu]
    
    if (!model || !gpu) {
      console.warn(`⚠️  跳过: ${combo.model} + ${combo.gpu} (模型或GPU不存在)`)
      continue
    }
    
    // 尝试找到对应的真实数据（优先int4，其次fp16/bf16）
    const key_int4 = `${combo.model}_${combo.gpu}_int4`
    const key_fp16 = `${combo.model}_${combo.gpu}_fp16`
    const key_bf16 = `${combo.model}_${combo.gpu}_bf16`
    
    let realBench = realDataMap[key_int4] || realDataMap[key_fp16] || realDataMap[key_bf16]
    
    // 默认使用int4进行计算
    const quant = QUANT_MAP['int4']
    const framework = FRAMEWORK_MAP['llamacpp']
    const ctx = 16384
    
    const result = calculateSpeed({
      gpu,
      model,
      quant,
      ctx,
      batch: 1,
      framework,
    })
    
    if (realBench && realBench.speed !== null) {
      // 有真实数据
      hasRealDataCount++
      const analysis = analyzeError(realBench.speed, result.calculated)
      
      comparisons.push({
        model: combo.model,
        gpu: combo.gpu,
        quant: realBench.quant,
        ctx: realBench.ctx,
        framework: realBench.framework,
        real: realBench.speed,
        calculated: result.calculated,
        error: analysis.error,
        absError: analysis.absError,
        level: analysis.level,
        source: realBench.source,
        hasRealData: true,
        details: result,
      })
      
      errors.push(analysis.absError)
    } else {
      // 没有真实数据，仅显示计算结果
      noRealDataCount++
      comparisons.push({
        model: combo.model,
        gpu: combo.gpu,
        quant: 'int4',
        ctx: ctx,
        framework: 'llamacpp',
        real: null,
        calculated: result.calculated,
        error: null,
        absError: null,
        level: 'no_data',
        source: 'N/A',
        hasRealData: false,
        details: result,
      })
    }
  }
  
  console.log(`✅ 有真实数据: ${hasRealDataCount} 个组合`)
  console.log(`⚠️  无真实数据: ${noRealDataCount} 个组合\n`)
  
  // 排序：有真实数据的按误差排序，无真实数据的放后面
  const withData = comparisons.filter(c => c.hasRealData).sort((a, b) => b.absError - a.absError)
  const withoutData = comparisons.filter(c => !c.hasRealData)
  
  console.log('📊 对比结果（有真实数据的组合，按误差排序）:\n')
  console.log('模型'.padEnd(18) + 'GPU'.padEnd(18) + '量化'.padEnd(8) + '真实'.padEnd(12) + '计算'.padEnd(12) + '误差'.padEnd(14) + '等级')
  console.log('─'.repeat(100))
  
  for (const comp of withData.slice(0, 30)) {
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
  
  if (withData.length > 30) {
    console.log(`... 还有 ${withData.length - 30} 个有真实数据的组合`)
  }
  
  console.log('\n📊 无真实数据的组合（仅显示计算结果，前20个）:\n')
  console.log('模型'.padEnd(18) + 'GPU'.padEnd(18) + '计算速度'.padEnd(15) + '状态')
  console.log('─'.repeat(70))
  
  for (const comp of withoutData.slice(0, 20)) {
    console.log(
      comp.model.padEnd(18) +
      comp.gpu.padEnd(18) +
      `${comp.calculated.toFixed(1)} tok/s`.padEnd(15) +
      '⚪ 无真实数据'
    )
  }
  
  if (withoutData.length > 20) {
    console.log(`... 还有 ${withoutData.length - 20} 个无真实数据的组合`)
  }
  
  console.log('\n📈 统计分析:\n')
  
  if (errors.length > 0) {
    const avgError = errors.reduce((a, b) => a + b, 0) / errors.length
    const maxError = Math.max(...errors)
    const minError = Math.min(...errors)
    const goodCount = withData.filter(c => c.level === 'good').length
    const fairCount = withData.filter(c => c.level === 'fair').length
    const poorCount = withData.filter(c => c.level === 'poor').length
    const badCount = withData.filter(c => c.level === 'bad').length
    
    console.log(`   总组合数: ${allCombinations.length}`)
    console.log(`   有真实数据: ${hasRealDataCount} (${(hasRealDataCount/allCombinations.length*100).toFixed(1)}%)`)
    console.log(`   无真实数据: ${noRealDataCount} (${(noRealDataCount/allCombinations.length*100).toFixed(1)}%)`)
    console.log(`   平均误差: ${avgError.toFixed(1)}%`)
    console.log(`   最大误差: ${maxError.toFixed(1)}%`)
    console.log(`   最小误差: ${minError.toFixed(1)}%`)
    console.log(`   ✅ 优秀 (<15%): ${goodCount} (${(goodCount/hasRealDataCount*100).toFixed(1)}%)`)
    console.log(`   ⚠️  良好 (15-30%): ${fairCount} (${(fairCount/hasRealDataCount*100).toFixed(1)}%)`)
    console.log(`   ❌ 较差 (30-50%): ${poorCount} (${(poorCount/hasRealDataCount*100).toFixed(1)}%)`)
    console.log(`   🔴 很差 (>50%): ${badCount} (${(badCount/hasRealDataCount*100).toFixed(1)}%)`)
    
    console.log('\n🔍 误差分析:\n')
    
    // 按框架分组
    const byFramework = {}
    for (const comp of withData) {
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
    for (const comp of withData) {
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
    for (const comp of withData) {
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
    for (const comp of withData) {
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
    const worstCases = withData.slice(0, 5)
    console.log('\n🔴 最大误差案例（前5个）:\n')
    for (const comp of worstCases) {
      console.log(`   ${comp.model} + ${comp.gpu} (${comp.quant}, ${comp.framework}):`)
      console.log(`      真实: ${comp.real.toFixed(1)} tok/s`)
      console.log(`      计算: ${comp.calculated.toFixed(1)} tok/s`)
      console.log(`      误差: ${comp.error.toFixed(1)}%`)
      console.log(`      来源: ${comp.source}`)
      console.log(`      带宽限制: ${comp.details.bwLimit.toFixed(1)} tok/s`)
      console.log(`      每步读取: ${comp.details.decodeBytesPerStep.toFixed(2)} GB`)
      console.log()
    }
  }
  
  console.log('✅ 分析完成！\n')
  
  return { comparisons, errors, hasRealDataCount, noRealDataCount }
}

main().catch(err => {
  console.error('❌ 错误:', err)
  process.exit(1)
})
