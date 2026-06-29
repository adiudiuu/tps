// src/utils/detectGpu.js
// 通过 WebGPU / WebGL 检测本机 GPU，并匹配 GPU_LIST 数据库。
// Apple Silicon 额外通过带宽测量 + 内存推断做多维匹配。
import { GPU_LIST } from '../data/gpus/index.js'

function normalizeGpuName(rawName) {
  return String(rawName || '')
    .toUpperCase()
    .replace(/\(TM\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isLikelyHumanReadableGpuName(value) {
  if (!value) return false
  const s = String(value).trim()
  if (!s) return false
  // GPUAdapterInfo.device 可能只是设备 ID，不适合直接当显卡型号。
  if (/^(0X)?[0-9A-F]{4,}$/i.test(s)) return false
  if (/^\d+$/.test(s)) return false
  return true
}

function pushCandidate(list, value) {
  if (!isLikelyHumanReadableGpuName(value)) return
  const raw = String(value).trim()
  const normalized = normalizeGpuName(raw)
  if (!normalized) return
  if (!list.some(item => item.normalized === normalized)) {
    list.push({ raw, normalized })
  }
}

// WebGPU 带宽测量（Storage Buffer Copy）
async function measureBandwidth(adapter, vendor) {
  try {
    const device = await adapter.requestDevice()
    const elements = 4 * 1024 * 1024
    const byteSize = elements * 16
    const src = device.createBuffer({ size: byteSize, usage: GPUBufferUsage.STORAGE })
    const dst = device.createBuffer({ size: byteSize, usage: GPUBufferUsage.STORAGE })
    const shader = device.createShaderModule({
      code: `
        @group(0) @binding(0) var<storage, read> src: array<vec4<f32>>;
        @group(0) @binding(1) var<storage, read_write> dst: array<vec4<f32>>;
        @compute @workgroup_size(256)
        fn main(@builtin(global_invocation_id) id: vec3u) {
          if (id.x < ${elements}u) { dst[id.x] = src[id.x]; }
        }
      `
    })
    const pipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module: shader, entryPoint: 'main' }
    })
    const bg = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: src } },
        { binding: 1, resource: { buffer: dst } }
      ]
    })
    const dispatch = () => {
      const enc = device.createCommandEncoder()
      const pass = enc.beginComputePass()
      pass.setPipeline(pipeline)
      pass.setBindGroup(0, bg)
      pass.dispatchWorkgroups(Math.ceil(elements / 256))
      pass.end()
      device.queue.submit([enc.finish()])
    }
    dispatch()
    await device.queue.onSubmittedWorkDone()
    const RUNS = 10
    const t0 = performance.now()
    for (let i = 0; i < RUNS; i++) dispatch()
    await device.queue.onSubmittedWorkDone()
    const ms = performance.now() - t0
    src.destroy()
    dst.destroy()
    device.destroy()
    const v = (vendor || '').toLowerCase()
    const correction = v.includes('apple') ? 0.70
      : v.includes('nvidia') ? 0.55
      : v.includes('amd') ? 0.58
      : 0.60
    return Math.round(byteSize * 2 * RUNS / ms / 1e6 / correction)
  } catch {
    return null
  }
}

// WebGL 带宽估算（纹理采样）
function measureGlslBandwidth() {
  try {
    const canvas = document.createElement('canvas')
    const SIZE = 2048
    const TAPS = 32
    canvas.width = SIZE
    canvas.height = SIZE
    const gl = canvas.getContext('webgl2')
    if (!gl) return null
    const vert = `#version 300 es
      in vec2 a_pos; out vec2 v_uv;
      void main() { gl_Position = vec4(a_pos,0,1); v_uv = a_pos*0.5+0.5; }`
    const frag = `#version 300 es
      precision highp float;
      uniform sampler2D u_tex; in vec2 v_uv; out vec4 o;
      void main() {
        vec4 s = vec4(0); float step = 1.0/${SIZE}.0;
        for (int i=0;i<${TAPS};i++) s += texture(u_tex, fract(v_uv+vec2(float(i)*step,float(i)*step*0.73)));
        o = s * ${(1 / TAPS).toFixed(6)};
      }`
    const mkShader = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
    }
    const vs = mkShader(gl.VERTEX_SHADER, vert)
    const fs = mkShader(gl.FRAGMENT_SHADER, frag)
    if (!vs || !fs) return null
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    const px = new Uint8Array(SIZE * SIZE * 4)
    for (let i = 0; i < px.length; i++) px[i] = (i * 7 + 13) & 255
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, SIZE, SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, px)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
    const fb = gl.createFramebuffer()
    const fbTex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, fbTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, SIZE, SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbTex, 0)
    gl.useProgram(prog)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.uniform1i(gl.getUniformLocation(prog, 'u_tex'), 0)
    gl.viewport(0, 0, SIZE, SIZE)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.finish()
    const RUNS = 10
    const t0 = performance.now()
    for (let i = 0; i < RUNS; i++) gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.finish()
    const ms = performance.now() - t0
    gl.deleteTexture(tex)
    gl.deleteTexture(fbTex)
    gl.deleteFramebuffer(fb)
    gl.deleteProgram(prog)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    gl.deleteBuffer(vbo)
    const bw = Math.round((SIZE * SIZE * TAPS * 4 * RUNS + SIZE * SIZE * 4 * RUNS) / ms / 1e6 / 0.35)
    return (bw >= 15 && bw <= 4000) ? bw : null
  } catch {
    return null
  }
}

// WebGPU maxBufferSize -> 推断 VRAM
function estimateVramFromAdapter(adapter) {
  try {
    const bytes = adapter?.limits?.maxBufferSize
    if (!bytes) return null
    const gb = bytes / 1024 ** 3
    if (gb <= 4.5) return null
    const totalGB = gb / 0.75
    const candidates = [8, 16, 18, 24, 32, 36, 48, 64, 96, 128, 192, 256, 512]
    let best = candidates[0]
    for (const c of candidates) {
      if (Math.abs(c - totalGB) < Math.abs(best - totalGB)) best = c
    }
    return best >= 8 ? best : null
  } catch {
    return null
  }
}

// 通过 requestDevice 探测 Apple Silicon 实际内存
async function probeAppleRamGB(adapter) {
  const GB = 1024 ** 3
  const PROBES = [
    { limitGB: 286, ramGB: 384 },
    { limitGB: 142, ramGB: 192 },
    { limitGB: 94, ramGB: 128 },
    { limitGB: 70, ramGB: 96 },
    { limitGB: 46, ramGB: 64 },
    { limitGB: 34, ramGB: 48 },
    { limitGB: 25, ramGB: 36 },
    { limitGB: 22, ramGB: 32 },
    { limitGB: 16, ramGB: 24 },
    { limitGB: 12, ramGB: 18 },
    { limitGB: 10, ramGB: 16 },
    { limitGB: 5, ramGB: 8 },
  ]
  for (const { limitGB, ramGB } of PROBES) {
    try {
      const dev = await adapter.requestDevice({
        requiredLimits: { maxBufferSize: limitGB * GB }
      })
      dev.destroy()
      return ramGB
    } catch {
      // Continue probing smaller tiers.
    }
  }
  return null
}

// Apple Silicon 多维评分匹配（带宽 + 内存 + 同系列 SKU 细分）
async function matchAppleSilicon({ adapter, measuredBW, estimatedRAM, chipFamily }) {
  if (estimatedRAM === null && adapter) {
    estimatedRAM = await probeAppleRamGB(adapter)
  }
  const appleGpus = GPU_LIST.filter(g => g.vendor === 'apple')
  const familyKey = chipFamily?.replace(/\s+/g, '_') ?? null
  const candidates = familyKey
    ? appleGpus.filter(g => g.id.startsWith('apple_' + familyKey))
    : appleGpus

  const pool = candidates.length > 0 ? candidates : appleGpus
  let best = null
  let bestScore = -1
  for (const g of pool) {
    let score = 0
    if (measuredBW !== null) {
      const ratio = measuredBW / g.bw
      score += 60 * Math.max(0, 1 - Math.abs(1 - ratio))
    }
    if (estimatedRAM !== null) {
      const ratio = estimatedRAM / g.vram
      score += 40 * Math.max(0, 1 - Math.abs(1 - ratio))
    }
    if (score > bestScore) {
      bestScore = score
      best = g
    }
  }

  // 同分或接近时：按内存精确匹配 + 带宽最近 SKU（区分 Pro 16核/20核、Max 32核/40核）
  if (estimatedRAM != null && best) {
    const ramMatches = pool.filter(g => g.vram === estimatedRAM)
    if (ramMatches.length > 1) {
      if (measuredBW != null) {
        ramMatches.sort((a, b) => Math.abs(a.bw - measuredBW) - Math.abs(b.bw - measuredBW))
      } else if (best.gpuCores != null) {
        ramMatches.sort((a, b) => (b.gpuCores ?? 0) - (a.gpuCores ?? 0))
      }
      best = ramMatches[0]
      bestScore = Math.max(bestScore, 10)
    } else if (ramMatches.length === 1) {
      best = ramMatches[0]
    }
  }

  return bestScore > 5 ? best : null
}

// 非 Apple GPU：对 GPU_LIST 全量做最长名称子串匹配
function matchGpuByName(rawName) {
  const name = normalizeGpuName(rawName)

  const PRIORITY_RULES = [
    { kw: 'L40S', id: 'l40s' },
    { kw: 'L40', id: 'l40' },
    { kw: 'H100 PCIE', id: 'h100_pcie' },
    { kw: 'A100 PCIE 80', id: 'a100_pcie_80g' },
    { kw: 'A100 PCIE 40', id: 'a100_pcie_40g' },
    { kw: 'A100 SXM', id: 'a100_sxm_80g' },
    { kw: 'RTX 5060 TI 16', id: 'rtx5060ti_16g' },
    { kw: 'RTX 4060 TI 16', id: 'rtx4060ti_16g' },
    { kw: 'RTX 3060 12', id: 'rtx3060_12g' },
    { kw: 'DGX SPARK', id: 'dgx_spark' },
    { kw: 'ASCEND 910D', id: 'ascend910d' },
    { kw: 'ASCEND 910C', id: 'ascend910c' },
    { kw: 'ASCEND 910B', id: 'ascend910b' },
  ]
  for (const r of PRIORITY_RULES) {
    if (name.includes(r.kw)) {
      const g = GPU_LIST.find(x => x.id === r.id)
      if (g) return g
    }
  }

  let best = null
  let bestLen = 0
  for (const g of GPU_LIST) {
    if (g.vendor === 'apple') continue
    const gName = g.name.toUpperCase()
    if (name.includes(gName) && gName.length > bestLen) {
      best = g
      bestLen = gName.length
    }
  }
  return best
}

function matchGpuFromCandidates(candidates) {
  for (const candidate of candidates) {
    const gpu = matchGpuByName(candidate.raw)
    if (gpu) return { gpu, rawName: candidate.raw }
  }
  return { gpu: null, rawName: candidates[0]?.raw ?? null }
}

/**
 * 检测本机 GPU，返回匹配的 GPU 对象或 null
 * @returns {Promise<{gpu: object|null, rawName: string|null, error: string|null}>}
 */
export async function detectLocalGpu() {
  const candidates = []
  let adapter = null

  // WebGPU：优先读取 description，device 只作为弱兜底。
  if (navigator.gpu) {
    try {
      adapter = await navigator.gpu.requestAdapter()
      if (adapter) {
        const info = adapter.info ?? await adapter.requestAdapterInfo().catch(() => null)
        pushCandidate(candidates, info?.description)
        pushCandidate(candidates, info?.vendor && info?.architecture ? `${info.vendor} ${info.architecture}` : null)
        pushCandidate(candidates, info?.vendor)
        pushCandidate(candidates, info?.device)
      }
    } catch {}
  }

  // WebGL：即便 WebGPU 已经返回，也继续收集更具体的 renderer 作为兜底。
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (gl) {
      const ext = gl.getExtension('WEBGL_debug_renderer_info')
      if (ext) {
        pushCandidate(candidates, gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || null)
      }
      pushCandidate(candidates, gl.getParameter(gl.RENDERER) || null)
    }
  } catch {}

  if (!candidates.length) return { gpu: null, rawName: null, error: 'no_webgpu' }

  const appleCandidate = candidates.find(c => c.normalized.includes('APPLE') && /\bM\d+\b/i.test(c.raw))
  if (appleCandidate) {
    const rawName = appleCandidate.raw
    const familyMatch = rawName.match(/\b(m[1-9])[\s-]*(ultra|max|pro)?\b/i)
    const chipFamily = familyMatch
      ? (familyMatch[1] + (familyMatch[2] ? '_' + familyMatch[2].toLowerCase() : ''))
      : null

    let measuredBW = null
    let estimatedRAM = null

    if (adapter) {
      measuredBW = await measureBandwidth(adapter, 'apple')
      estimatedRAM = estimateVramFromAdapter(adapter)
      if (measuredBW === null) measuredBW = measureGlslBandwidth()
    } else {
      measuredBW = measureGlslBandwidth()
    }

    const gpu = await matchAppleSilicon({ adapter, measuredBW, estimatedRAM, chipFamily })
    return { gpu, rawName, error: gpu ? null : 'no_match' }
  }

  const { gpu, rawName } = matchGpuFromCandidates(candidates)
  return { gpu, rawName, error: gpu ? null : 'no_match' }
}
