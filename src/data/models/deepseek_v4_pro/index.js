// DeepSeek-V4-Pro: 1.6T MoE, 49B active, CSA+HCA hybrid attention, 1M context
// Preview: 2026-04-24; Official API build DeepSeek-V4-Pro-0813: 2026-08-13
// API docs: version bump to Pro-0813, calling method unchanged (deepseek-v4-pro)
// Public HF config.json geometry unchanged vs Preview — no new architecture published
// Source: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
// Config: num_hidden_layers=61, hidden_size=7168, num_attention_heads=128,
//         num_key_value_heads=1 (HCA), head_dim=512 (latent KV dim),
//         n_routed_experts=384, num_experts_per_tok=6, n_shared_experts=1
export default {
  id: 'deepseek_v4_pro',
  name: 'DeepSeek V4 Pro',
  type: 'moe',
  params: 1600,
  active_params: 49,
  experts: 384,
  experts_per_token: 6,
  moe_execution: 'shared_routed',
  // head_dim=512 即 latent KV 维度，实际每 token 每层缓存 512 + qk_rope_head_dim(64) = 576，
  // 而基线公式按 K/V 各一份算成 2 × 1 × 512 = 1024
  mla_ratio: 0.5625,  // 576 / 1024
  layers: 61,
  query_heads: 128,      // num_attention_heads；hidden/head_dim 推不出（7168/512=14）
  kv_heads: 1,
  head_dim: 512,
  hidden_size: 7168,
  max_ctx: 1048576,
  tags: ['chat', 'multilingual', 'coding', 'reasoning'],
  released: '2026-04',
  links: {
    hf: 'https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813',
    ms: 'https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Pro-0813',
  },
}
