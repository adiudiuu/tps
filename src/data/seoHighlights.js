// Verified SEO/GEO example picks — IDs must exist in catalog.
// Labels are for docs; UI copy lives in i18n seo.highlights.*
import { UPDATED_AT_BEIJING } from './appMeta.js'

/** YYYY-MM from UPDATED_AT_BEIJING (e.g. 2026/08/05 → 2026-08) */
export const SEO_UPDATED_MONTH = UPDATED_AT_BEIJING.slice(0, 7).replace('/', '-')

/** Newest / high-demand models present in src/data/models */
export const SEO_MODEL_IDS = [
  'qwen38_max',           // Qwen3.8-Max — 2026-08
  'kimi_k3',              // Kimi K3 — 2026-07
  'glm5_2',               // GLM-5.2 — 2026-06
  'deepseek_v4_pro',      // DeepSeek V4 Pro — 2026-04
  'minimax_m3',           // MiniMax M3 — 2026-06
  'gemma4_12b_unified',   // Gemma 4 — 2026-06
  'llama4_maverick',      // Llama 4 Maverick — 2025-04
  'nemotron_3_ultra',     // Nemotron 3 Ultra — 2026-06
]

/** Consumer + datacenter GPUs present in src/data/gpus */
export const SEO_GPU_IDS = [
  'rtx5090',
  'rtx5080',
  'rtx4090',
  'b200_sxm',
  'h200_sxm',
  'h100_sxm',
  'mi300x',
]
