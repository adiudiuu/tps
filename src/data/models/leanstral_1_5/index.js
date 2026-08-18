// Leanstral 1.5: 119B MoE / 6.5B active, MLA, multimodal
// HF card Key Features + recommended settings: 256K (suggest ≤200K in practice)
// params.json max_position_embeddings=1048576 is YaRN 8K×128; keep advertised 256K
// Source: https://huggingface.co/mistralai/Leanstral-1.5-119B-A6B
export default {
  id: 'leanstral_1_5',
  released: '2026-07',
  name: 'Leanstral 1.5 (119B-A6B)',
  type: 'moe',
  params: 119,
  active_params: 6.5,
  experts: 128,
  experts_per_token: 4,
  moe_execution: 'shared_routed',
  // MLA latent = kv_lora_rank(256) + qk_rope_head_dim(64) = 320，基线 2 × 32 × 128 = 8192
  mla_ratio: 0.0391,
  layers: 36,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 262144,
  tags: ['chat', 'reasoning', 'coding', 'vision', 'multimodal'],
  // vision_encoder: image_size 1540 / patch_size 14 = 110，spatial_merge_size 2 → 55 × 55 patch token
  vision_encoder_params: 0.4,
  vision_seq_tokens: 3025,
  links: {
    hf: 'https://huggingface.co/mistralai/Leanstral-1.5-119B-A6B',
  },
}
