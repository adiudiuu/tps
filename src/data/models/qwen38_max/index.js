// Qwen3.8-Max / Qwen3.8-2.4T-A95B: 2.4T MoE / 95B active, hybrid attention, 1M context
// Released: 2026-08-03 (API GA as Qwen3.8-Max); open weights planned 2026-08-12 as Qwen3.8-2.4T-A95B
// Official published: 2.4T total, 95B active, Sparse MoE + hybrid attention (Qwen3.5 foundation), 1M ctx, multimodal
// Layer/expert geometry estimated from Qwen3.5 MoE (397B-A17B: 60L / 512E top-10 / ~75% GatedDeltaNet)
// pending official config.json after weight release
// Source: https://qwen.ai/blog?id=qwen3.8
//         https://www.alibabacloud.com/blog/alibaba-unveils-qwen3-8-max-its-largest-and-most-capable-flagship-model-to-date_603420
//         ModelScope pre-release: PlannedArtifacts Qwen/Qwen3.8-2.4T-A95B (ReleaseDate 2026-08-12)
// Weights not live yet (as of 2026-08-12): HF repo missing; MS page is PreRelease/PlannedArtifacts only
export default {
  id: 'qwen38_max',
  name: 'Qwen3.8-Max (2.4T-A95B)',
  type: 'moe',
  params: 2400,
  active_params: 95,
  experts: 512,            // 估算：对齐 Qwen3.5-397B-A17B expert 池
  experts_per_token: 10,   // 估算：对齐 Qwen3.5 MoE top-k
  layers: 80,              // 估算：相对 397B(60L) 按规模上调
  linear_attention_layers: 60, // 估算：沿用 Qwen3.5 ~75% 线性注意力占比
  kv_heads: 4,             // 估算
  head_dim: 256,           // 估算
  hidden_size: 8192,       // 估算：相对 397B(4096) 加倍以承载更大激活量
  max_ctx: 1048576,        // 官方：1M context
  tags: ['chat', 'multilingual', 'coding', 'reasoning'],
  // 官方称支持视觉；权重未公开前无可建模的 vision_seq_tokens，暂不加 vision tag
  released: '2026-08',
  status: 'preview', // 权重/config 尚未完全公开，结构字段为估算，开源后需对齐 config.json
  hf_id: 'Qwen/Qwen3.8-2.4T-A95B',
  links: {
    hf: 'https://huggingface.co/Qwen',
    ms: 'https://www.modelscope.cn/models/Qwen/Qwen3.8-2.4T-A95B',
  },
}
