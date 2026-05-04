/**
 * cmdGen.js — 推理框架 CLI 启动命令生成器
 * 纯函数模块，无副作用，无 Vue 依赖。
 */

/**
 * 从 HuggingFace URL 提取模型 ID
 * e.g. 'https://huggingface.co/Qwen/Qwen3-8B' → 'Qwen/Qwen3-8B'
 */
function extractHfModel(model) {
  return model.links?.hf?.replace('https://huggingface.co/', '') ?? model.id
}

/**
 * 将参数数组格式化为命令字符串
 * ≤3 个参数时单行，超过 3 个用 \ + 换行分隔
 * notes 数组中的注释行单独追加在命令末尾，不混入参数列表
 */
function formatCmd(parts, notes = []) {
  const cmd = parts.length <= 3
    ? parts.join(' ')
    : parts.join(' \\\n  ')
  return notes.length ? cmd + '\n' + notes.join('\n') : cmd
}

/**
 * 计算 llama.cpp 的 --n-gpu-layers 值
 */
function calcNgl(model, cpuOffload, pureCpu) {
  if (pureCpu) return null
  if (cpuOffload && model.type === 'moe') {
    const gpuLayers = model.local_layers != null
      ? model.local_layers
      : Math.round((model.layers ?? 32) * 0.25)
    return gpuLayers
  }
  return 999
}

/**
 * 生成 vLLM 启动命令
 */
function genVllm(hfModel, config) {
  const { gpuCount, ppCount, epCount, ctx, batch, quant, kvCacheQuant, prefixCacheHit, speculativeDecoding, draftLen } = config
  const parts = [`vllm serve ${hfModel}`]
  const notes = []

  if (gpuCount > 1) parts.push(`--tensor-parallel-size ${gpuCount}`)
  if (ppCount > 1)  parts.push(`--pipeline-parallel-size ${ppCount}`)
  if (epCount > 1)  parts.push(`--expert-parallel-size ${epCount}`)
  parts.push(`--max-model-len ${ctx}`)
  parts.push(`--max-num-seqs ${batch}`)
  parts.push(`--gpu-memory-utilization 0.90`)

  // 量化
  if (quant.id === 'fp8') {
    parts.push(`--quantization fp8`)
  } else if (quant.id === 'int8') {
    parts.push(`--quantization compressed-tensors`)
    notes.push(`# Note: use --quantization bitsandbytes --load-in-8bit for older vLLM (<0.4) or non-compressed-tensors checkpoints`)
  } else if (quant.id === 'int4') {
    parts.push(`--quantization awq`)
    notes.push(`# Note: use --quantization gptq if the model is in GPTQ format instead of AWQ`)
  }

  // KV Cache：vLLM 只支持 fp8
  if (kvCacheQuant.id === 'fp8') {
    parts.push(`--kv-cache-dtype fp8`)
  } else if (kvCacheQuant.id !== 'auto' && kvCacheQuant.id !== 'fp16') {
    notes.push(`# Note: vLLM KV cache quantization only supports fp8; current selection ignored`)
  }

  if (prefixCacheHit > 0) parts.push(`--enable-prefix-caching`)

  if (speculativeDecoding) {
    parts.push(`--speculative-model <DRAFT_MODEL>`)
    parts.push(`--num-speculative-tokens ${draftLen}`)
  }

  return formatCmd(parts, notes)
}

/**
 * 生成 SGLang 启动命令
 */
function genSglang(hfModel, config) {
  const { gpuCount, ppCount, epCount, ctx, batch, quant, kvCacheQuant, prefixCacheHit, speculativeDecoding, draftLen } = config
  const parts = [`python -m sglang.launch_server`]
  const notes = []

  parts.push(`--model-path ${hfModel}`)
  if (gpuCount > 1) parts.push(`--tp ${gpuCount}`)
  if (ppCount > 1)  parts.push(`--pp ${ppCount}`)
  if (epCount > 1)  parts.push(`--ep ${epCount}`)
  parts.push(`--context-length ${ctx}`)
  parts.push(`--max-running-requests ${batch}`)

  // 量化
  if (quant.id === 'fp8') {
    parts.push(`--quantization fp8`)
  } else if (quant.id === 'int4') {
    parts.push(`--quantization awq`)
  }

  // KV Cache
  if (kvCacheQuant.id === 'fp8') parts.push(`--kv-cache-dtype fp8`)

  if (prefixCacheHit > 0) parts.push(`--enable-prefix-caching`)

  if (speculativeDecoding) {
    parts.push(`--speculative-algorithm EAGLE`)
    parts.push(`--speculative-draft-model-path <DRAFT_MODEL>`)
    parts.push(`--speculative-num-steps ${draftLen}`)
  }

  parts.push(`--host 0.0.0.0 --port 30000`)

  return formatCmd(parts, notes)
}

/**
 * 生成 LMDeploy 启动命令
 */
function genLmdeploy(hfModel, config) {
  const { gpuCount, ctx, batch, quant, kvCacheQuant, prefixCacheHit } = config
  const parts = [`lmdeploy serve api_server ${hfModel}`]

  if (gpuCount > 1) parts.push(`--tp ${gpuCount}`)
  parts.push(`--session-len ${ctx}`)
  parts.push(`--max-batch-size ${batch}`)

  // 量化
  if (quant.id === 'int4') {
    parts.push(`--quant-policy 4`)
  } else if (quant.id === 'int8') {
    parts.push(`--quant-policy 8`)
  }

  // KV Cache
  if (kvCacheQuant.id === 'int8' || kvCacheQuant.id === 'fp8') {
    parts.push(`--cache-quant-policy 8`)
  }

  if (prefixCacheHit > 0) parts.push(`--enable-prefix-caching`)

  parts.push(`--server-port 23333`)

  return formatCmd(parts)
}

/**
 * 生成 TGI (Text Generation Inference) 启动命令
 */
function genTgi(hfModel, config) {
  const { gpuCount, ctx, batch, quant } = config
  const parts = [
    `docker run --gpus all`,
    `-p 8080:80`,
    `-v \${HF_HOME}:/data`,
    `ghcr.io/huggingface/text-generation-inference:latest`,
    `--model-id ${hfModel}`,
    `--num-shard ${gpuCount}`,
    `--max-total-tokens ${ctx}`,
    `--max-batch-prefill-tokens ${batch * ctx}`,
  ]

  // 量化
  if (quant.id === 'int8') {
    parts.push(`--quantize bitsandbytes`)
  } else if (quant.id === 'int4') {
    parts.push(`--quantize awq`)
  } else if (quant.id === 'fp8') {
    parts.push(`--quantize fp8`)
  }

  return formatCmd(parts)
}

/**
 * 生成 ExLlamaV2 启动命令
 */
function genExllamav2(hfModel, config) {
  const { gpuCount, ctx, batch, quant } = config
  const parts = [`python -m exllamav2.server`]
  const notes = []

  parts.push(`--model-dir ${hfModel}`)
  parts.push(`--max-seq-len ${ctx}`)
  parts.push(`--max-batch-size ${batch}`)

  if (quant.id === 'int4') parts.push(`--load-q4`)

  if (gpuCount > 1) parts.push(`--gpu-split <GPU_SPLIT e.g. 24,24>`)

  parts.push(`--port 5000`)
  notes.push(`# Note: EXL2 format is recommended over GPTQ. Adjust if using EXL2 quantized models.`)

  return formatCmd(parts, notes)
}

/**
 * GGUF 量化后缀映射
 */
const GGUF_QUANT_MAP = {
  fp32: { suffix: 'F32', note: null },
  bf16: { suffix: 'F16', note: null },  // llama.cpp 不区分 BF16/FP16
  fp8:  { suffix: 'F16', note: `# llama.cpp does not support FP8, using F16` },
  int8: { suffix: 'Q8_0', note: null },
  int6: { suffix: 'Q6_K', note: null },
  int5: { suffix: 'Q5_K_M', note: null },
  int4: { suffix: 'Q4_K_M', note: null },  // 默认 Q4_K_M，用户按实际文件调整
  int3: { suffix: 'Q3_K_M', note: null },
  int2: { suffix: 'Q2_K', note: null },
}

/**
 * 生成 llama.cpp / llamacpp_metal 启动命令
 * Metal 为 macOS 默认后端，命令与 llamacpp 完全相同
 */
function genLlamacpp(config) {
  const { model, ctx, batch, quant, cpuOffload, pureCpu } = config
  const ggufInfo = GGUF_QUANT_MAP[quant.id] ?? { suffix: 'Q4_K_M', note: null }

  // 模型文件名：用 model.id 作为基础名
  const modelName = model.id
  const ggufSuffix = ggufInfo.suffix
  const modelPath = `./models/${modelName}-${ggufSuffix}.gguf`

  const ngl = calcNgl(model, cpuOffload, pureCpu)
  const parts = [`llama-server`]
  const notes = []

  parts.push(`--model ${modelPath}`)
  parts.push(`--ctx-size ${ctx}`)
  parts.push(`--parallel ${batch}`)

  if (ngl != null) {
    parts.push(`--n-gpu-layers ${ngl}`)
    if (cpuOffload && model.type === 'moe') {
      notes.push(`# Note: --n-gpu-layers set to ${ngl} for MoE CPU offload; adjust based on available VRAM`)
    }
  }

  if (pureCpu) parts.push(`--threads <CPU_THREADS>`)

  parts.push(`--host 0.0.0.0 --port 8080`)

  if (ggufInfo.note) notes.push(ggufInfo.note)
  if (quant.id === 'int4') {
    notes.push(`# Note: Q4_K_M is the default. Adjust to Q4_K_S, Q4_0, etc. based on your actual .gguf file.`)
  }

  return formatCmd(parts, notes)
}

/**
 * 生成 MLX 启动命令
 */
function genMlx(hfModel, config) {
  const { ctx, quant } = config
  const parts = [`mlx_lm.server`]
  const notes = []

  parts.push(`--model ${hfModel}`)
  parts.push(`--max-tokens ${ctx}`)

  if (quant.id === 'int4') {
    parts.push(`--quantize`)
  } else if (quant.id === 'int8') {
    parts.push(`--quantize --q-bits 8`)
  }

  parts.push(`--port 8080`)

  notes.push(`# Note: MLX models usually require mlx-community converted versions`)
  notes.push(`# e.g. mlx-community/${hfModel.split('/').pop()}-4bit`)

  return formatCmd(parts, notes)
}

/**
 * 各框架官方文档链接
 */
export const FRAMEWORK_DOCS = {
  vllm:           'https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html',
  sglang:         'https://docs.sglang.ai/backend/server_arguments.html',
  lmdeploy:       'https://lmdeploy.readthedocs.io/en/latest/serving/api_server.html',
  tgi:            'https://huggingface.co/docs/text-generation-inference/reference/launcher',
  exllamav2:      'https://github.com/turboderp-org/exllamav2',
  llamacpp:       'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md',
  llamacpp_metal: 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md',
  mlx:            'https://github.com/ml-explore/mlx-lm?tab=readme-ov-file#server',
}

/**
 * 根据框架 id 返回官方文档 URL，不支持时返回 null
 */
export function getFrameworkDocsUrl(frameworkId) {
  return FRAMEWORK_DOCS[frameworkId] ?? null
}

/**
 * 根据框架和配置生成 CLI 启动命令
 *
 * @param {Object} framework  - FRAMEWORK_MAP 中的框架对象（含 id）
 * @param {Object} config
 * @param {Object} config.model          - 当前模型对象（含 links.hf, type, layers, local_layers）
 * @param {number} config.gpuCount       - TP 并行数（已是聚合后总数）
 * @param {number} config.ppCount        - PP 并行数
 * @param {number} config.ctx            - 上下文长度
 * @param {number} config.batch          - 并发请求数
 * @param {Object} config.quant          - QUANT_MAP 中的量化对象（id: fp32|bf16|fp8|int8|int6|int5|int4|int3|int2）
 * @param {Object} config.kvCacheQuant   - KV_CACHE_MAP 中的对象（id: auto|fp16|fp8|int8|int4）
 * @param {number} config.prefixCacheHit - 前缀缓存命中率 0-100
 * @param {boolean} config.speculativeDecoding
 * @param {number}  config.draftLen
 * @param {boolean} config.cpuOffload    - MoE CPU offload 模式
 * @param {boolean} config.pureCpu       - 纯 CPU 推理模式
 * @returns {string|null}               - 命令字符串，不支持时返回 null
 */
export function generateCmd(framework, config) {
  if (!framework || !config?.model || !config?.quant) return null

  const { model } = config
  const hfModel = extractHfModel(model)

  switch (framework.id) {
    case 'vllm':
      return genVllm(hfModel, config)

    case 'sglang':
      return genSglang(hfModel, config)

    case 'lmdeploy':
      return genLmdeploy(hfModel, config)

    case 'tgi':
      return genTgi(hfModel, config)

    case 'exllamav2':
      return genExllamav2(hfModel, config)

    case 'llamacpp':
    case 'llamacpp_metal':
      return genLlamacpp(config)

    case 'mlx':
      return genMlx(hfModel, config)

    // theory 和 trtllm 不支持生成命令
    case 'theory':
      return null

    case 'trtllm': {
      const { gpuCount, ppCount, ctx, batch, quant } = config
      const dtMap = { bf16: 'bfloat16', fp8: 'fp8', int8: 'int8', int4: 'int4_awq' }
      const dtype = dtMap[quant?.id] ?? 'bfloat16'
      const tpFlag = gpuCount > 1 ? `--tp_size ${gpuCount} ` : ''
      const ppFlag = ppCount > 1  ? `--pp_size ${ppCount} ` : ''
      return [
        `# 1. Build engine`,
        `trtllm-build \\`,
        `  --checkpoint_dir ./model_checkpoint \\`,
        `  --output_dir ./engine \\`,
        `  --dtype ${dtype} \\`,
        `  ${tpFlag}${ppFlag}--max_batch_size ${batch} \\`,
        `  --max_input_len ${ctx} --max_seq_len ${ctx + 2048}`,
        ``,
        `# 2. Run inference server`,
        `python -m tensorrt_llm.serve \\`,
        `  --engine_dir ./engine \\`,
        `  --max_batch_size ${batch}`,
        ``,
        `# Note: convert checkpoint first with convert_checkpoint.py for your model family`,
      ].join('\n')
    }

    default:
      return null
  }
}
