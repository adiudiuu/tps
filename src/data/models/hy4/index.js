// Hy4 preview: 770B MoE / 49B active, Gated DSA (DeepSeek Sparse Attention) + IndexCache, 1M context
// 78 层：第 1 层 dense FFN，其余 77 层 MoE；256 routed experts top-8 + 1 shared；原生 10B MTP 层供投机解码
// Official preview from Tencent Hy Team, Apache 2.0, open weights 2026-08-28
// Source: https://huggingface.co/tencent/Hy4-preview/blob/main/config.json
// Config: num_hidden_layers=78, hidden_size=6144, num_attention_heads=64, num_key_value_heads=8,
//         head_dim=64, gated_mla=true, kv_lora_rank=512, qk_rope_head_dim=64, q_lora_rank=2048,
//         n_routed_experts=256, num_experts_per_tok=8, n_shared_experts=1, index_topk=2048
export default {
  id: 'hy4',
  name: 'Hy4 preview (770B-A49B)',
  type: 'moe',
  params: 770,
  active_params: 49,
  experts: 256,
  experts_per_token: 8,
  moe_execution: 'shared_routed',
  // Gated MLA：每 token 每层缓存 kv_lora_rank(512) + qk_rope_head_dim(64) = 576，基线 2 × 8 × 64 = 1024
  mla_ratio: 0.5625,  // 576 / 1024
  layers: 78,
  query_heads: 64,     // num_attention_heads；hidden/head_dim 推不出（6144/64=96）
  kv_heads: 8,
  head_dim: 64,
  hidden_size: 6144,
  max_ctx: 1048576,
  tags: ['chat', 'multilingual', 'reasoning', 'coding', 'agentic'],
  released: '2026-08',
  links: {
    hf: 'https://huggingface.co/tencent/Hy4-preview',
    ms: 'https://modelscope.cn/models/Tencent-Hunyuan/Hy4-preview',
  },
}
