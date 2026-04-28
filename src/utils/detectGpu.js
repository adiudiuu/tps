// src/utils/detectGpu.js
// 通过 WebGPU API 检测本机 GPU 名称，并模糊匹配 gpus.js 数据库
import { GPU_LIST } from '../data/gpus/index.js'

/**
 * 检测本机 GPU，返回匹配的 GPU 对象或 null
 * @returns {Promise<{gpu: object|null, rawName: string|null, error: string|null}>}
 */
export async function detectLocalGpu() {
  // 优先 WebGPU
  if (navigator.gpu) {
    try {
      const adapter = await navigator.gpu.requestAdapter()
      if (adapter) {
        const info = adapter.info ?? await adapter.requestAdapterInfo().catch(() => null)
        const rawName = info?.device || info?.description || info?.vendor || ''
        if (rawName) {
          const gpu = matchGpu(rawName)
          return { gpu, rawName, error: gpu ? null : 'no_match' }
        }
      }
    } catch {}
  }

  // 降级 WebGL（兼容 Firefox / Safari）
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      if (ext) {
        const rawName = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || ''
        if (rawName) {
          const gpu = matchGpu(rawName)
          return { gpu, rawName, error: gpu ? null : 'no_match' }
        }
      }
    }
  } catch {}

  return { gpu: null, rawName: null, error: 'no_webgpu' }
}

/**
 * 模糊匹配规则表：keyword数组 → GPU id
 * 规则从精确到宽泛排列，先匹配到的优先
 */
const MATCH_RULES = [
  // Apple Silicon（WebGPU 返回 "Apple M4 Max" 等字符串，无法区分内存大小，默认匹配最低配）
  { keywords: ['apple m5 max'],          id: 'apple_m5_max_36g' },
  { keywords: ['apple m5 pro'],          id: 'apple_m5_pro_24g' },
  { keywords: ['apple m5'],              id: 'apple_m5_16g' },
  { keywords: ['apple m4 max'],          id: 'apple_m4_max_36g' },
  { keywords: ['apple m4 pro'],          id: 'apple_m4_pro_24g' },
  { keywords: ['apple m4'],              id: 'apple_m4_16g' },
  { keywords: ['apple m3 ultra'],        id: 'apple_m3_ultra_256g' },
  { keywords: ['apple m3 max'],          id: 'apple_m3_max_64g' },
  { keywords: ['apple m3 pro'],          id: 'apple_m3_pro_18g' },
  { keywords: ['apple m3'],              id: 'apple_m3_16g' },
  { keywords: ['apple m2 ultra'],        id: 'apple_m2_ultra_192g' },
  { keywords: ['apple m2 max'],          id: 'apple_m2_max_32g' },
  { keywords: ['apple m2 pro'],          id: 'apple_m2_pro_16g' },
  // NVIDIA Blackwell 消费级
  { keywords: ['5090'],                      id: 'rtx5090' },
  { keywords: ['5080'],                      id: 'rtx5080' },
  { keywords: ['5070 ti', '5070ti'],         id: 'rtx5070ti' },
  { keywords: ['5070'],                      id: 'rtx5070' },
  { keywords: ['gb10', 'dgx spark', 'spark'], id: 'dgx_spark' },
  // NVIDIA Ada 消费级
  { keywords: ['4090'],                      id: 'rtx4090' },
  { keywords: ['4080'],                      id: 'rtx4080' },
  { keywords: ['4070 ti', '4070ti'],         id: 'rtx4070ti' },
  // NVIDIA Ampere 消费级
  { keywords: ['3090 ti', '3090ti'],         id: 'rtx3090ti' },
  { keywords: ['3080 ti', '3080ti'],         id: 'rtx3080ti' },
  { keywords: ['3090'],                      id: 'rtx3090' },
  // NVIDIA 数据中心
  { keywords: ['b200'],                      id: 'b200_sxm' },
  { keywords: ['h200'],                      id: 'h200_sxm' },
  { keywords: ['h100 pcie', 'h100pcie'],     id: 'h100_pcie' },
  { keywords: ['h100'],                      id: 'h100_sxm' },
  { keywords: ['h800'],                      id: 'h800' },
  { keywords: ['l40s'],                      id: 'l40s' },
  { keywords: ['l40'],                       id: 'l40' },
  { keywords: ['l4'],                        id: 'l4' },
  { keywords: ['a800'],                      id: 'a800_80g' },
  { keywords: ['a100 pcie 80', 'a100pcie80'], id: 'a100_pcie_80g' },
  { keywords: ['a100 pcie 40', 'a100pcie40'], id: 'a100_pcie_40g' },
  { keywords: ['a100 sxm', 'a100sxm'],       id: 'a100_sxm_80g' },
  { keywords: ['a100'],                      id: 'a100_sxm_80g' },
  { keywords: ['a30'],                       id: 'a30' },
  { keywords: ['a40'],                       id: 'a40' },
  { keywords: ['a10'],                       id: 'a10' },
  { keywords: ['t4'],                        id: 't4' },
  { keywords: ['v100 32', 'v100-32'],        id: 'v100_sxm2_32g' },
  { keywords: ['v100'],                      id: 'v100_sxm2_32g' },
  // AMD
  { keywords: ['mi325x'],                    id: 'mi325x' },
  { keywords: ['mi300x'],                    id: 'mi300x' },
  { keywords: ['mi300a'],                    id: 'mi300a' },
  { keywords: ['mi250x'],                    id: 'mi250x' },
  { keywords: ['mi210'],                     id: 'mi210' },
  { keywords: ['7900 xtx', '7900xtx'],       id: 'rx7900xtx' },
  // Intel
  { keywords: ['gaudi 3', 'gaudi3'],         id: 'gaudi3' },
  // 国产
  { keywords: ['910d', '昇腾910d', 'ascend910d'], id: 'ascend910d' },
  { keywords: ['910c', '昇腾910c', 'ascend910c'], id: 'ascend910c' },
  { keywords: ['910b', '昇腾910b', 'ascend910b'], id: 'ascend910b' },
  { keywords: ['mlu370'],                    id: 'mlu370' },
  { keywords: ['br100'],                     id: 'br100' },
  { keywords: ['s4000', 'mts4000'],          id: 'mts4000' },
]

function matchGpu(rawName) {
  const name = rawName.toLowerCase()
  for (const rule of MATCH_RULES) {
    if (rule.keywords.some(kw => name.includes(kw.toLowerCase()))) {
      return GPU_LIST.find(g => g.id === rule.id) ?? null
    }
  }
  return null
}
