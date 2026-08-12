// Qwen3.8-27B: dense companion to Qwen3.8-Max (official PlannedArtifact)
// Released: 2026-08 (announced with Max; ModelScope: 稠密模型，将陆续开源)
// Geometry provisional: mirror Qwen3.6-27B hybrid Gated DeltaNet + full attention
// Official has NOT published 27B layer/head/hidden/context yet — align to Qwen3.6-27B config
// Source: Alibaba Qwen3.8 announcement; ModelScope PreRelease PlannedArtifacts include Qwen/Qwen3.8-27B
// Weights not live yet (as of 2026-08-12): HF repo 404/401; MS 27B page missing — link to org / PlannedArtifacts
export default {
  id: 'qwen38_27b',
  name: 'Qwen3.8-27B',
  type: 'dense',
  params: 27,
  layers: 64,
  kv_heads: 4,
  head_dim: 256,
  local_layers: 48,      // 估算：对齐 Qwen3.6-27B full_attention_interval=4
  sliding_window: 0,     // 线性注意力层不产生标准 KV cache
  hidden_size: 5120,
  max_ctx: 262144,       // 估算：对齐 Qwen3.6-27B；官方 27B ctx 未公布
  tags: ['chat', 'multilingual', 'coding'],
  released: '2026-08',
  status: 'preview',
  // Intended HF id once weights land (cmdGen placeholder); do not use as links.hf until repo exists
  hf_id: 'Qwen/Qwen3.8-27B',
  links: {
    hf: 'https://huggingface.co/Qwen',
    // PlannedArtifacts page lists Qwen3.8-27B; dedicated 27B model page not published yet
    ms: 'https://www.modelscope.cn/models/Qwen/Qwen3.8-2.4T-A95B',
  },
}
