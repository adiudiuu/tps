// Verified SEO/GEO example picks — IDs must exist in catalog.
// Labels are for docs; UI copy lives in i18n seo.highlights.*
import { UPDATED_AT_BEIJING } from './appMeta.js'

/** YYYY-MM from UPDATED_AT_BEIJING (e.g. 2026/08/05 → 2026-08) */
export const SEO_UPDATED_MONTH = UPDATED_AT_BEIJING.slice(0, 7).replace('/', '-')

/** Newest / high-demand models present in src/data/models */
export const SEO_MODEL_IDS = [
  'qwen38_max',                // Qwen3.8-Max / 2.4T-A95B — 2026-08
  'qwen38_27b',                // Qwen3.8-27B — 2026-08
  'muse_glimmer',              // Muse Glimmer — 2026-08
  'nemotron_3_5_lightning',    // Nemotron 3.5 Lightning — 2026-08
  'deepseek_v4_pro',           // DeepSeek V4 Pro — 2026-04
  'deepseek_v4_flash',         // DeepSeek V4 Flash (0731 GA) — 2026-07
  'kimi_k3',                   // Kimi K3 — 2026-07
  'inkling',                   // Inkling — 2026-07
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
