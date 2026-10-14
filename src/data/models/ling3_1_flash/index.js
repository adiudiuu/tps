// Ling-3.1-flash: 560B-A25B MoE (百灵 BailingMoeV3), KDA linear + Gated MLA 混合, 文本基座
// 72 层混合架构（KDA 线性与 Gated MLA 按 7:1 交替）：63 KDA 线性层不占标准 KV + 9 MLA 全注意力层
// 512 routed experts top-8 + 1 shared；前 4 层 dense 其余 MoE
// Open weights: 2026-10 (HF + ModelScope, 官方 FP8 checkpoint, MIT)
// Source: https://huggingface.co/inclusionAI/Ling-3.1-flash/blob/main/config.json
// Config: num_hidden_layers=72, hidden_size=4096, num_attention_heads=64,
//         num_key_value_heads=64, head_dim=128, kv_lora_rank=512, qk_rope_head_dim=64,
//         q_lora_rank=1536, num_experts=512, num_experts_per_tok=8, layer_group_size=8,
//         first_k_dense_replace=4, max_position_embeddings=262144（官方宣称 1M）
export default {
  id: 'ling3_1_flash',
  name: 'Ling-3.1-flash (560B-A25B)',
  type: 'moe',
  params: 560,
  active_params: 25,
  experts: 512,
  experts_per_token: 8,
  moe_execution: 'shared_routed',
  layers: 72,
  linear_attention_layers: 63, // KDA 线性层，不计标准 KV cache
  local_layers: 63,
  sliding_window: 0,
  // 9 层 Gated MLA：每 token 每层缓存 kv_lora_rank(512) + qk_rope_head_dim(64) = 576，基线 2 × 64 × 128 = 16384
  mla_ratio: 0.0352,  // 576 / 16384
  query_heads: 64,    // num_attention_heads；hidden/head_dim 推不出（4096/128=32）
  kv_heads: 64,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 262144,
  tags: ['chat', 'multilingual', 'coding', 'reasoning', 'agentic'],
  released: '2026-10',
  links: {
    hf: 'https://huggingface.co/inclusionAI/Ling-3.1-flash',
    ms: 'https://modelscope.cn/models/inclusionAI/Ling-3.1-flash',
  },
}
