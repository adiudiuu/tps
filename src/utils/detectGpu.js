// src/utils/detectGpu.js
// 通过 WebGPU / WebGL 检测本机 GPU，并匹配 GPU_LIST 数据库
// Apple Silicon 额外通过带宽测量 + GPU Cores 估算 + 内存推断进行多维评分匹配
import { GPU_LIST } from '../data/gpus/index.js'

// ── WebGPU 带宽测量（Storage Buffer Copy） ───────────────────────────
async function measureBandwidth(adapter) {
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
    // 预热
    dispatch(); await device.queue.onSubmittedWorkDone()
    const RUNS = 10
    const t0 = performance.now()
    for (let i = 0; i < RUNS; i++) dispatch()
    await device.queue.onSubmittedWorkDone()
    const ms = performance.now() - t0
    src.destroy(); dst.destroy(); device.destroy()
    // 每次读写各一次，除以 0.6 校正利用率
    return Math.round(byteSize * 2 * RUNS / ms / 1e6 / 0.6)
  } catch {
    return null
  }
}

// ── WebGL 带宽估算（纹理采样）──────────────────────────────────────────
function measureGlslBandwidth() {
  try {
    const canvas = document.createElement('canvas')
    const SIZE = 2048, TAPS = 32
    canvas.width = SIZE; canvas.height = SIZE
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
        o = s * ${(1/TAPS).toFixed(6)};
      }`
    const mkShader = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src); gl.compileShader(s)
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
    }
    const vs = mkShader(gl.VERTEX_SHADER, vert)
    const fs = mkShader(gl.FRAGMENT_SHADER, frag)
    if (!vs || !fs) return null
    const prog = gl.createProgram()
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    const px = new Uint8Array(SIZE*SIZE*4)
    for (let i=0;i<px.length;i++) px[i] = (i*7+13) & 255
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,SIZE,SIZE,0,gl.RGBA,gl.UNSIGNED_BYTE,px)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT)
    const fb = gl.createFramebuffer(), fbTex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, fbTex)
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,SIZE,SIZE,0,gl.RGBA,gl.UNSIGNED_BYTE,null)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,fbTex,0)
    gl.useProgram(prog); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.uniform1i(gl.getUniformLocation(prog,'u_tex'),0); gl.viewport(0,0,SIZE,SIZE)
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4); gl.finish()
    const RUNS = 10, t0 = performance.now()
    for (let i=0;i<RUNS;i++) gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
    gl.finish()
    const ms = performance.now() - t0
    gl.deleteTexture(tex); gl.deleteTexture(fbTex); gl.deleteFramebuffer(fb)
    gl.deleteProgram(prog); gl.deleteShader(vs); gl.deleteShader(fs); gl.deleteBuffer(vbo)
    const bw = Math.round((SIZE*SIZE*TAPS*4*RUNS + SIZE*SIZE*4*RUNS) / ms / 1e6 / 0.35)
    return (bw >= 15 && bw <= 4000) ? bw : null
  } catch {
    return null
  }
}

// ── WebGPU GPU Cores 估算（Compute Benchmark） ───────────────────────
// vendor 前缀用于校正 FLOPS→Cores 的比例系数
const VENDOR_FLOPS_PER_CORE = { apple: 400, nvidia: 5, amd: 4.5, intel: 16 }

async function estimateGpuCores(adapter, vendorHint) {
  try {
    const device = await adapter.requestDevice()
    const N = 512 * 1024, ITERS = 512
    const shader = device.createShaderModule({
      code: `
        @group(0) @binding(0) var<storage, read_write> data: array<f32>;
        @compute @workgroup_size(256)
        fn main(@builtin(global_invocation_id) id: vec3u) {
          let idx = id.x;
          if (idx >= ${N}u) { return; }
          var x: f32 = f32(idx) * 0.001;
          for (var i: u32 = 0; i < ${ITERS}u; i++) { x = x * 1.0001 + 0.0001; }
          data[idx] = x;
        }
      `
    })
    const buf = device.createBuffer({ size: N * 4, usage: GPUBufferUsage.STORAGE })
    const pipeline = device.createComputePipeline({ layout: 'auto', compute: { module: shader, entryPoint: 'main' } })
    const bg = device.createBindGroup({ layout: pipeline.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: buf } }] })
    const run = () => {
      const enc = device.createCommandEncoder()
      const pass = enc.beginComputePass()
      pass.setPipeline(pipeline); pass.setBindGroup(0, bg)
      pass.dispatchWorkgroups(Math.ceil(N / 256)); pass.end()
      device.queue.submit([enc.finish()])
      return device.queue.onSubmittedWorkDone()
    }
    await run()
    const t0 = performance.now(); await run()
    const ms = performance.now() - t0
    buf.destroy(); device.destroy()
    const gflops = N * ITERS * 2 / ms / 1e6
    const hint = (vendorHint || '').toLowerCase()
    for (const [v, ratio] of Object.entries(VENDOR_FLOPS_PER_CORE)) {
      if (hint.includes(v)) return Math.round(gflops / ratio)
    }
    return null
  } catch {
    return null
  }
}

// ── WebGPU maxBufferSize → 推断 VRAM ────────────────────────────────
// Chrome 在所有 Apple Silicon 上将 adapter.limits.maxBufferSize 统一限制到 4GB，
// 因此 ≤ 4.5GB 的值不可信（无法区分 16GB/32GB），直接返回 null。
// Safari 会暴露真实值（≈总内存 × 75%）。
function estimateVramFromAdapter(adapter) {
  try {
    const bytes = adapter?.limits?.maxBufferSize
    if (!bytes) return null
    const gb = bytes / 1024 ** 3
    // Chrome 默认上限为 4GB，视为不可信
    if (gb <= 4.5) return null
    // Safari 等暴露真实限制：maxBufferSize ≈ totalRAM × 0.75
    const totalGB = gb / 0.75
    const candidates = [8,16,18,24,32,36,48,64,96,128,192,256,512]
    let best = candidates[0]
    for (const c of candidates) {
      if (Math.abs(c - totalGB) < Math.abs(best - totalGB)) best = c
    }
    return best >= 8 ? best : null
  } catch {
    return null
  }
}

// ── 通过 requestDevice 探测 Apple Silicon 实际内存 ───────────────────
// Chrome 虽然将默认 device.maxBufferSize 限制在 4GB，
// 但 requestDevice({ requiredLimits: { maxBufferSize: N } }) 会透传给
// Metal 后端验证，从而可以区分 16GB / 32GB / 64GB 等配置。
async function probeAppleRamGB(adapter) {
  const GB = 1024 ** 3
  // 阈值取各档内存 × 0.75 的保守值（Metal 可分配上限约为总内存 75%）
  const PROBES = [
    { limitGB: 46, ramGB: 64 },
    { limitGB: 22, ramGB: 32 },
    { limitGB: 10, ramGB: 16 },
    { limitGB:  5, ramGB:  8 },
  ]
  for (const { limitGB, ramGB } of PROBES) {
    try {
      const dev = await adapter.requestDevice({
        requiredLimits: { maxBufferSize: limitGB * GB }
      })
      dev.destroy()
      return ramGB
    } catch {
      // 该档内存不满足，继续探测下一档
    }
  }
  return null
}

// ── Apple Silicon 多维评分匹配 ────────────────────────────────────────
// 通过测量带宽 + 估算内存 + 估算 GPU Cores 选出最可能的型号
async function matchAppleSilicon({ adapter, measuredBW, estimatedRAM, chipFamily }) {
  // 优先用 requestDevice 探测内存（可区分 16GB/32GB 等同频率型号）
  if (estimatedRAM === null && adapter) {
    estimatedRAM = await probeAppleRamGB(adapter)
  }
  const appleGpus = GPU_LIST.filter(g => g.vendor === 'apple')
  // 如果 chipFamily 明确（如 "m4 max"），先按 family 筛选
  const candidates = chipFamily
    ? appleGpus.filter(g => g.id.startsWith('apple_' + chipFamily.replace(/ /g, '_')))
    : appleGpus

  // Apple GPU_LIST 中没有 gpuCores 字段，但 bw 差异足够区分型号
  // 用 bw 和 vram 双维度评分
  let best = null, bestScore = -1
  for (const g of (candidates.length > 0 ? candidates : appleGpus)) {
    let score = 0
    if (measuredBW !== null) {
      const ratio = measuredBW / g.bw
      score += 60 * Math.max(0, 1 - Math.abs(1 - ratio))
    }
    if (estimatedRAM !== null) {
      const ratio = estimatedRAM / g.vram
      score += 40 * Math.max(0, 1 - Math.abs(1 - ratio))
    }
    if (score > bestScore) { bestScore = score; best = g }
  }
  return bestScore > 5 ? best : null
}

// ── 非 Apple GPU：对 GPU_LIST 全量做最长名称子串匹配 ─────────────────
function matchGpuByName(rawName) {
  const name = rawName.toUpperCase()
    .replace(/\(TM\)/gi, '').replace(/\s+/g, ' ').trim()

  // 特殊优先规则（避免短串误匹配，如 "L4" 匹配到 "L40S"）
  const PRIORITY_RULES = [
    { kw: 'L40S',   id: 'l40s' },
    { kw: 'L40',    id: 'l40' },
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

  // 对所有非 Apple GPU 做最长名称子串匹配
  let best = null, bestLen = 0
  for (const g of GPU_LIST) {
    if (g.vendor === 'apple') continue
    const gName = g.name.toUpperCase()
    if (name.includes(gName) && gName.length > bestLen) {
      best = g; bestLen = gName.length
    }
  }
  return best
}

/**
 * 检测本机 GPU，返回匹配的 GPU 对象或 null
 * @returns {Promise<{gpu: object|null, rawName: string|null, error: string|null}>}
 */
export async function detectLocalGpu() {
  let rawName = null
  let adapter = null

  // 1. 尝试 WebGPU 获取 adapter 和原始名称
  if (navigator.gpu) {
    try {
      adapter = await navigator.gpu.requestAdapter()
      if (adapter) {
        const info = adapter.info ?? await adapter.requestAdapterInfo().catch(() => null)
        rawName = info?.device || info?.description || null
      }
    } catch {}
  }

  // 2. 降级 WebGL 获取原始名称
  if (!rawName) {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (gl) {
        const ext = gl.getExtension('WEBGL_debug_renderer_info')
        if (ext) {
          rawName = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || null
        } else {
          rawName = gl.getParameter(gl.RENDERER) || null
        }
      }
    } catch {}
  }

  if (!rawName) return { gpu: null, rawName: null, error: 'no_webgpu' }

  const nameLower = rawName.toLowerCase()
  const isApple = nameLower.includes('apple') && /m[1-9]/.test(nameLower)

  // 3. Apple Silicon：多维评分匹配
  if (isApple) {
    // 从名称中提取 chip family（如 "m4 max"、"m3 pro"）
    const familyMatch = rawName.match(/\b(m[1-9])\s*(ultra|max|pro)?\b/i)
    const chipFamily = familyMatch
      ? (familyMatch[1] + (familyMatch[2] ? ' ' + familyMatch[2] : '')).toLowerCase()
      : null

    let measuredBW = null
    let estimatedRAM = null

    if (adapter) {
      measuredBW = await measureBandwidth(adapter)
      estimatedRAM = estimateVramFromAdapter(adapter)
      if (measuredBW === null) measuredBW = measureGlslBandwidth()
    } else {
      measuredBW = measureGlslBandwidth()
    }

    const gpu = await matchAppleSilicon({ adapter, measuredBW, estimatedRAM, chipFamily })
    return { gpu, rawName, error: gpu ? null : 'no_match' }
  }

  // 4. 非 Apple：名称直接匹配
  const gpu = matchGpuByName(rawName)
  return { gpu, rawName, error: gpu ? null : 'no_match' }
}
