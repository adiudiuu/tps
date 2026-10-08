// MiMo-V2.6-Flash-RL: 309B MoE / 15B active, 256 experts top-8, hybrid SWA/global, native omnimodal, 1M context
// hybrid_layer_pattern: 39 sliding + 9 full; SWA KV=8, full KV=4
// 官方开源权重即 -RL checkpoint（MIT，HF 2026-09-21）；相对 V2-Flash 将原生 ctx 从 256K 扩到 1M，并加视觉/音频
// Source: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/blob/main/config.json
// Config: num_hidden_layers=48, hidden_size=4096, num_attention_heads=64,
//         num_key_value_heads=4 (GA), swa_num_attention_heads=64, swa_num_key_value_heads=8,
//         head_dim=192, n_routed_experts=256, num_experts_per_tok=8, n_shared_experts=null,
//         sliding_window=128, max_position_embeddings=1048576
// Vision: 与 V2.6-Pro 同一套 681M MiMo ViT；image_max_pixels=8388608 → 每图最大 8192 token
export default {
  id: 'mimo_v2_6_flash',
  name: 'MiMo-V2.6-Flash',
  type: 'moe',
  params: 309,
  active_params: 15,
  experts: 256,
  experts_per_token: 8,
  layers: 48,
  query_heads: 64,       // Q=64 两种层型一致；hidden/head_dim 推不出（4096/192≈21）
  kv_heads: 8,           // SWA (swa_num_key_value_heads)
  head_dim: 192,
  global_kv_heads: 4,    // full (num_key_value_heads)
  global_head_dim: 192,
  hidden_size: 4096,
  local_layers: 39,
  sliding_window: 128,
  max_ctx: 1048576,
  // 官方 681M MiMo ViT（不在 309B backbone 内）；音频编码器仅 tags 标注、不建模
  vision_encoder_params: 0.681,
  vision_seq_tokens: 8192,
  tags: ['chat', 'reasoning', 'multilingual', 'coding', 'vision', 'multimodal', 'audio', 'agentic'],
  released: '2026-09',
  links: {
    hf: 'https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL',
    ms: 'https://modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Flash-RL',
  },
}
