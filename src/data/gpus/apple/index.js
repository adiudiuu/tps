// Apple Silicon（统一内存架构）
// 数据来源：Apple 官方规格 / Wikipedia
// bf16 为 GPU FP32 TFLOPS × 2 估算（Apple 未公布官方 BF16 数字）
// unifiedMemory: true — 使用系统内存，usableRatio 为 GPU 可用比例（约 85%）
// decodeBwScale: 同带宽不同 GPU 核数微调（优先 ≤1；缺省由 calc.js 按代际推断）
//   不要用 >1 去“补偿”低核数，也不要用 0.49 这类与 #4167 矛盾的代际悬崖
// tdp 为整机 SoC TDP，非独立 GPU 功耗
// bwUtilization 锚定 llama.cpp Discussion #4167（LLaMA 7B Q4_0 tg128）+ 同公式下的 MLX 换算：
//   Max 单 die：0.90（M1–M4 Max）；M5 Max 0.98（#4167 2026-03/04：103–104 tg，高于纯带宽比）
//   Ultra 双 die UltraFusion：0.67（跨 die；#4167 上 Ultra≈1.4× 同代 Max，而非 2×）
//   Pro/base：0.96（#4167：Pro tg/带宽效率高于 Max；旧 0.82 使 Pro 系统性偏低 ~20%）
export default [
  // ── M5 Max ──────────────────────────────────────────
  // 40-core GPU, 614 GB/s — 已用 #4167 Hassan-A-K / CSendner Q4_0 tg≈103–104 校准
  { id: 'apple_m5_max_128g', name: 'Apple M5 Max (128GB)', vendor: 'apple', tier: 'consumer', released: '2026-03', vram: 128, bw: 614, bwUtilization: 0.98, bf16: 27.0, int8: 54.0, int4: null, nvlink_bw: null, tdp: 70, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m5_max_64g',  name: 'Apple M5 Max (64GB)',  vendor: 'apple', tier: 'consumer', released: '2026-03', vram: 64,  bw: 614, bwUtilization: 0.98, bf16: 27.0, int8: 54.0, int4: null, nvlink_bw: null, tdp: 70, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m5_max_48g',  name: 'Apple M5 Max (48GB)',  vendor: 'apple', tier: 'consumer', released: '2026-03', vram: 48,  bw: 614, bwUtilization: 0.98, bf16: 27.0, int8: 54.0, int4: null, nvlink_bw: null, tdp: 70, unifiedMemory: true, usableRatio: 0.85 },
  // 32-core GPU, 460 GB/s（带宽已更低；未单独校准，沿用 M5 Max util）
  { id: 'apple_m5_max_36g',  name: 'Apple M5 Max (36GB, 32-core GPU)',  vendor: 'apple', tier: 'consumer', released: '2026-03', vram: 36,  bw: 460, bwUtilization: 0.98, bf16: 20.2, int8: 40.4, int4: null, nvlink_bw: null, tdp: 62, unifiedMemory: true, usableRatio: 0.85, gpuCores: 32 },
  // ── M5 Ultra ────────────────────────────────────────
  // 80-core GPU, 1228 GB/s (2 × M5 Max 40-core) — 未校准：尚无可靠公开 tg 锚点
  { id: 'apple_m5_ultra_512g', name: 'Apple M5 Ultra (512GB)', vendor: 'apple', tier: 'consumer', released: '2026-03', vram: 512, bw: 1228, bwUtilization: 0.67, bf16: 54.0, int8: 108.0, int4: null, nvlink_bw: null, tdp: 140, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m5_ultra_256g', name: 'Apple M5 Ultra (256GB)', vendor: 'apple', tier: 'consumer', released: '2026-03', vram: 256, bw: 1228, bwUtilization: 0.67, bf16: 54.0, int8: 108.0, int4: null, nvlink_bw: null, tdp: 140, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m5_ultra_192g', name: 'Apple M5 Ultra (192GB)', vendor: 'apple', tier: 'consumer', released: '2026-03', vram: 192, bw: 1228, bwUtilization: 0.67, bf16: 54.0, int8: 108.0, int4: null, nvlink_bw: null, tdp: 140, unifiedMemory: true, usableRatio: 0.85 },
  // ── M5 Pro ──────────────────────────────────────────
  // 同 307 GB/s：#4167 bnggge 2026-04 M5 Pro 16c Q4_0 tg≈60 已校准 util
  { id: 'apple_m5_pro_24g',  name: 'Apple M5 Pro (24GB, 16-core GPU)',  vendor: 'apple', tier: 'consumer', released: '2026-03', vram: 24,  bw: 307, bwUtilization: 0.96, bf16: 13.5, int8: 27.0, int4: null, nvlink_bw: null, tdp: 38, unifiedMemory: true, usableRatio: 0.85, gpuCores: 16 },
  { id: 'apple_m5_pro_48g',  name: 'Apple M5 Pro (48GB, 20-core GPU)',  vendor: 'apple', tier: 'consumer', released: '2026-03', vram: 48,  bw: 307, bwUtilization: 0.96, bf16: 13.5, int8: 27.0, int4: null, nvlink_bw: null, tdp: 46, unifiedMemory: true, usableRatio: 0.85, gpuCores: 20 },
  { id: 'apple_m5_pro_64g',  name: 'Apple M5 Pro (64GB, 20-core GPU)',  vendor: 'apple', tier: 'consumer', released: '2026-03', vram: 64,  bw: 307, bwUtilization: 0.96, bf16: 13.5, int8: 27.0, int4: null, nvlink_bw: null, tdp: 46, unifiedMemory: true, usableRatio: 0.85, gpuCores: 20 },
  // ── M5 ──────────────────────────────────────────────
  // 10-core GPU, 153.6 GB/s — #4167 Anemll 2025-10 Q4_0 tg≈29.6（偏保守锚点）
  { id: 'apple_m5_32g',      name: 'Apple M5 (32GB)',      vendor: 'apple', tier: 'consumer', released: '2025-10', vram: 32,  bw: 154, bwUtilization: 0.96, bf16: 6.0,  int8: 12.0, int4: null, nvlink_bw: null, tdp: 22, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m5_24g',      name: 'Apple M5 (24GB)',      vendor: 'apple', tier: 'consumer', released: '2025-10', vram: 24,  bw: 154, bwUtilization: 0.96, bf16: 6.0,  int8: 12.0, int4: null, nvlink_bw: null, tdp: 22, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m5_16g',      name: 'Apple M5 (16GB)',      vendor: 'apple', tier: 'consumer', released: '2025-10', vram: 16,  bw: 154, bwUtilization: 0.96, bf16: 6.0,  int8: 12.0, int4: null, nvlink_bw: null, tdp: 22, unifiedMemory: true, usableRatio: 0.85 },

  // ── M4 Max ──────────────────────────────────────────
  // 40-core GPU, 546 GB/s
  { id: 'apple_m4_max_128g', name: 'Apple M4 Max (128GB, 40-core GPU)', vendor: 'apple', tier: 'consumer', released: '2024-11', vram: 128, bw: 546, bwUtilization: 0.90, bf16: 21.2, int8: 42.4, int4: null, nvlink_bw: null, tdp: 70, unifiedMemory: true, usableRatio: 0.85, gpuCores: 40 },
  { id: 'apple_m4_max_64g',  name: 'Apple M4 Max (64GB, 40-core GPU)',  vendor: 'apple', tier: 'consumer', released: '2024-11', vram: 64,  bw: 546, bwUtilization: 0.90, bf16: 21.2, int8: 42.4, int4: null, nvlink_bw: null, tdp: 70, unifiedMemory: true, usableRatio: 0.85, gpuCores: 40 },
  { id: 'apple_m4_max_48g',  name: 'Apple M4 Max (48GB, 40-core GPU)',  vendor: 'apple', tier: 'consumer', released: '2024-11', vram: 48,  bw: 546, bwUtilization: 0.90, bf16: 21.2, int8: 42.4, int4: null, nvlink_bw: null, tdp: 70, unifiedMemory: true, usableRatio: 0.85, gpuCores: 40 },
  // 32-core / 410 GB/s：带宽已反映规格差；旧 decodeBwScale 1.09 违反 ≤1
  { id: 'apple_m4_max_36g',  name: 'Apple M4 Max (36GB, 32-core GPU)', vendor: 'apple', tier: 'consumer', released: '2024-11', vram: 36,  bw: 410, bwUtilization: 0.90, bf16: 16.0, int8: 32.0, int4: null, nvlink_bw: null, tdp: 62, unifiedMemory: true, usableRatio: 0.85, gpuCores: 32 },
  // ── M4 Ultra ────────────────────────────────────────
  // 80-core GPU, 1092 GB/s (2 × M4 Max 40-core) — 未校准：尚无可靠公开 tg 锚点
  { id: 'apple_m4_ultra_384g', name: 'Apple M4 Ultra (384GB)', vendor: 'apple', tier: 'consumer', released: '2026-03', vram: 384, bw: 1092, bwUtilization: 0.67, bf16: 42.4, int8: 84.8, int4: null, nvlink_bw: null, tdp: 140, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m4_ultra_256g', name: 'Apple M4 Ultra (256GB)', vendor: 'apple', tier: 'consumer', released: '2026-03', vram: 256, bw: 1092, bwUtilization: 0.67, bf16: 42.4, int8: 84.8, int4: null, nvlink_bw: null, tdp: 140, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m4_ultra_192g', name: 'Apple M4 Ultra (192GB)', vendor: 'apple', tier: 'consumer', released: '2026-03', vram: 192, bw: 1092, bwUtilization: 0.67, bf16: 42.4, int8: 84.8, int4: null, nvlink_bw: null, tdp: 140, unifiedMemory: true, usableRatio: 0.85 },
  // ── M4 Pro ──────────────────────────────────────────
  // 20-core GPU, 273 GB/s
  { id: 'apple_m4_pro_64g',  name: 'Apple M4 Pro (64GB, 20-core GPU)',  vendor: 'apple', tier: 'consumer', released: '2024-11', vram: 64,  bw: 273, bwUtilization: 0.96, bf16: 10.6, int8: 21.2, int4: null, nvlink_bw: null, tdp: 46, unifiedMemory: true, usableRatio: 0.85, gpuCores: 20 },
  { id: 'apple_m4_pro_48g',  name: 'Apple M4 Pro (48GB, 20-core GPU)',  vendor: 'apple', tier: 'consumer', released: '2024-11', vram: 48,  bw: 273, bwUtilization: 0.96, bf16: 10.6, int8: 21.2, int4: null, nvlink_bw: null, tdp: 46, unifiedMemory: true, usableRatio: 0.85, gpuCores: 20 },
  { id: 'apple_m4_pro_24g',  name: 'Apple M4 Pro (24GB, 16-core GPU)',  vendor: 'apple', tier: 'consumer', released: '2024-11', vram: 24,  bw: 273, bwUtilization: 0.96, bf16: 10.6, int8: 21.2, int4: null, nvlink_bw: null, tdp: 38, unifiedMemory: true, usableRatio: 0.85, gpuCores: 16 },
  // ── M4 ──────────────────────────────────────────────
  // 10-core GPU, 120 GB/s
  { id: 'apple_m4_32g',      name: 'Apple M4 (32GB)',      vendor: 'apple', tier: 'consumer', released: '2024-11', vram: 32,  bw: 120, bwUtilization: 0.96, bf16: 4.6,  int8: 9.2,  int4: null, nvlink_bw: null, tdp: 22, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m4_16g',      name: 'Apple M4 (16GB)',      vendor: 'apple', tier: 'consumer', released: '2024-11', vram: 16,  bw: 120, bwUtilization: 0.96, bf16: 4.6,  int8: 9.2,  int4: null, nvlink_bw: null, tdp: 22, unifiedMemory: true, usableRatio: 0.85 },

  // ── M3 Ultra ─────────────────────────────────────────
  // 80-core GPU, 819 GB/s
  { id: 'apple_m3_ultra_512g', name: 'Apple M3 Ultra (512GB)', vendor: 'apple', tier: 'consumer', released: '2025-03', vram: 512, bw: 819, bwUtilization: 0.67, bf16: 34.4, int8: 68.8, int4: null, nvlink_bw: null, tdp: 140, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m3_ultra_256g', name: 'Apple M3 Ultra (256GB)', vendor: 'apple', tier: 'consumer', released: '2025-03', vram: 256, bw: 819, bwUtilization: 0.67, bf16: 34.4, int8: 68.8, int4: null, nvlink_bw: null, tdp: 140, unifiedMemory: true, usableRatio: 0.85 },
  // ── M3 Max ──────────────────────────────────────────
  // 40-core GPU, 400 GB/s
  { id: 'apple_m3_max_128g', name: 'Apple M3 Max (128GB)', vendor: 'apple', tier: 'consumer', released: '2023-11', vram: 128, bw: 400, bwUtilization: 0.90, bf16: 17.2, int8: 34.4, int4: null, nvlink_bw: null, tdp: 78, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m3_max_96g',  name: 'Apple M3 Max (96GB)',  vendor: 'apple', tier: 'consumer', released: '2023-11', vram: 96,  bw: 400, bwUtilization: 0.90, bf16: 17.2, int8: 34.4, int4: null, nvlink_bw: null, tdp: 78, unifiedMemory: true, usableRatio: 0.85 },
  // 30-core GPU, 300 GB/s
  { id: 'apple_m3_max_64g',  name: 'Apple M3 Max (64GB, 30-core GPU)',  vendor: 'apple', tier: 'consumer', released: '2023-11', vram: 64,  bw: 300, bwUtilization: 0.90, bf16: 12.9, int8: 25.8, int4: null, nvlink_bw: null, tdp: 78, unifiedMemory: true, usableRatio: 0.85, gpuCores: 30 },
  // ── M3 Pro ──────────────────────────────────────────
  // 18-core GPU, 153 GB/s（旧 decodeBwScale 1.28 已移除）
  { id: 'apple_m3_pro_36g',  name: 'Apple M3 Pro (36GB, 18-core GPU)',  vendor: 'apple', tier: 'consumer', released: '2023-11', vram: 36,  bw: 153, bwUtilization: 0.96, bf16: 6.2,  int8: 12.4, int4: null, nvlink_bw: null, tdp: 27, unifiedMemory: true, usableRatio: 0.85, gpuCores: 18 },
  { id: 'apple_m3_pro_18g',  name: 'Apple M3 Pro (18GB, 18-core GPU)',  vendor: 'apple', tier: 'consumer', released: '2023-11', vram: 18,  bw: 153, bwUtilization: 0.96, bf16: 6.2,  int8: 12.4, int4: null, nvlink_bw: null, tdp: 27, unifiedMemory: true, usableRatio: 0.85, gpuCores: 18 },
  // ── M3 ──────────────────────────────────────────────
  // 10-core GPU, 100 GB/s
  { id: 'apple_m3_24g',      name: 'Apple M3 (24GB)',      vendor: 'apple', tier: 'consumer', released: '2023-11', vram: 24,  bw: 100, bwUtilization: 0.96, bf16: 4.1,  int8: 8.2,  int4: null, nvlink_bw: null, tdp: 20, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m3_16g',      name: 'Apple M3 (16GB)',      vendor: 'apple', tier: 'consumer', released: '2023-11', vram: 16,  bw: 100, bwUtilization: 0.96, bf16: 4.1,  int8: 8.2,  int4: null, nvlink_bw: null, tdp: 20, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m3_8g',       name: 'Apple M3 (8GB)',       vendor: 'apple', tier: 'consumer', released: '2023-11', vram: 8,   bw: 100, bwUtilization: 0.96, bf16: 4.1,  int8: 8.2,  int4: null, nvlink_bw: null, tdp: 20, unifiedMemory: true, usableRatio: 0.85 },

  // ── M2 Ultra ─────────────────────────────────────────
  // 76-core GPU, 800 GB/s
  { id: 'apple_m2_ultra_192g', name: 'Apple M2 Ultra (192GB)', vendor: 'apple', tier: 'consumer', released: '2023-06', vram: 192, bw: 800, bwUtilization: 0.67, bf16: 27.2, int8: 54.4, int4: null, nvlink_bw: null, tdp: 150, unifiedMemory: true, usableRatio: 0.85 },
  // ── M2 Max ──────────────────────────────────────────
  // 38-core GPU, 400 GB/s
  { id: 'apple_m2_max_96g',  name: 'Apple M2 Max (96GB)',  vendor: 'apple', tier: 'consumer', released: '2023-01', vram: 96,  bw: 400, bwUtilization: 0.90, bf16: 13.6, int8: 27.2, int4: null, nvlink_bw: null, tdp: 100, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m2_max_64g',  name: 'Apple M2 Max (64GB)',  vendor: 'apple', tier: 'consumer', released: '2023-01', vram: 64,  bw: 400, bwUtilization: 0.90, bf16: 13.6, int8: 27.2, int4: null, nvlink_bw: null, tdp: 100, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m2_max_32g',  name: 'Apple M2 Max (32GB)',  vendor: 'apple', tier: 'consumer', released: '2023-01', vram: 32,  bw: 400, bwUtilization: 0.90, bf16: 13.6, int8: 27.2, int4: null, nvlink_bw: null, tdp: 100, unifiedMemory: true, usableRatio: 0.85 },
  // ── M2 Pro ──────────────────────────────────────────
  // 19-core GPU, 200 GB/s
  { id: 'apple_m2_pro_32g',  name: 'Apple M2 Pro (32GB)',  vendor: 'apple', tier: 'consumer', released: '2023-01', vram: 32,  bw: 200, bwUtilization: 0.96, bf16: 6.8,  int8: 13.6, int4: null, nvlink_bw: null, tdp: 67, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m2_pro_16g',  name: 'Apple M2 Pro (16GB)',  vendor: 'apple', tier: 'consumer', released: '2023-01', vram: 16,  bw: 200, bwUtilization: 0.96, bf16: 6.8,  int8: 13.6, int4: null, nvlink_bw: null, tdp: 67, unifiedMemory: true, usableRatio: 0.85 },

  // ── M1 Ultra ─────────────────────────────────────────
  // 64-core GPU, 800 GB/s (2 × M1 Max)
  { id: 'apple_m1_ultra_128g', name: 'Apple M1 Ultra (128GB)', vendor: 'apple', tier: 'consumer', released: '2022-03', vram: 128, bw: 800, bwUtilization: 0.67, bf16: 21.0, int8: 42.0, int4: null, nvlink_bw: null, tdp: 150, unifiedMemory: true, usableRatio: 0.85 },
  // ── M1 Max ──────────────────────────────────────────
  // 32-core GPU, 400 GB/s（旧 decodeBwScale 0.49 已移除；代际 0.92 由 calc.js 默认）
  { id: 'apple_m1_max_64g',  name: 'Apple M1 Max (64GB, 32-core GPU)',  vendor: 'apple', tier: 'consumer', released: '2021-10', vram: 64,  bw: 400, bwUtilization: 0.90, bf16: 10.4, int8: 20.8, int4: null, nvlink_bw: null, tdp: 92, unifiedMemory: true, usableRatio: 0.85, gpuCores: 32 },
  { id: 'apple_m1_max_32g',  name: 'Apple M1 Max (32GB, 32-core GPU)',  vendor: 'apple', tier: 'consumer', released: '2021-10', vram: 32,  bw: 400, bwUtilization: 0.90, bf16: 10.4, int8: 20.8, int4: null, nvlink_bw: null, tdp: 92, unifiedMemory: true, usableRatio: 0.85, gpuCores: 32 },
  // ── M1 Pro ──────────────────────────────────────────
  // 16-core GPU, 200 GB/s
  { id: 'apple_m1_pro_32g',  name: 'Apple M1 Pro (32GB, 16-core GPU)',  vendor: 'apple', tier: 'consumer', released: '2021-10', vram: 32,  bw: 200, bwUtilization: 0.96, bf16: 5.2,  int8: 10.4, int4: null, nvlink_bw: null, tdp: 67, unifiedMemory: true, usableRatio: 0.85, gpuCores: 16 },
  { id: 'apple_m1_pro_16g',  name: 'Apple M1 Pro (16GB, 16-core GPU)',  vendor: 'apple', tier: 'consumer', released: '2021-10', vram: 16,  bw: 200, bwUtilization: 0.96, bf16: 5.2,  int8: 10.4, int4: null, nvlink_bw: null, tdp: 67, unifiedMemory: true, usableRatio: 0.85, gpuCores: 16 },
  // ── M1 ──────────────────────────────────────────────
  // 8-core GPU, 68 GB/s
  { id: 'apple_m1_16g',      name: 'Apple M1 (16GB)',      vendor: 'apple', tier: 'consumer', released: '2020-11', vram: 16,  bw: 68,  bwUtilization: 0.96, bf16: 2.6,  int8: 5.2,  int4: null, nvlink_bw: null, tdp: 20, unifiedMemory: true, usableRatio: 0.85 },
  { id: 'apple_m1_8g',       name: 'Apple M1 (8GB)',       vendor: 'apple', tier: 'consumer', released: '2020-11', vram: 8,   bw: 68,  bwUtilization: 0.96, bf16: 2.6,  int8: 5.2,  int4: null, nvlink_bw: null, tdp: 20, unifiedMemory: true, usableRatio: 0.85 },
]
