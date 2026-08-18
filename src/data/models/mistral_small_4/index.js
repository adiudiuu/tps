// Mistral Small 4: 119B MoE, 6.5B active, MLA, 256K ctx
// params.json max_position_embeddings=1048576 是 YaRN 8K×128；官方宣传 256K，按 256K 记
// Released: March 2026
// Source: https://huggingface.co/mistralai/Mistral-Small-4-119B-2603
export default {
  id: 'mistral_small_4',
  released: '2026-03',
  name: 'Mistral Small 4',
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
  tags: ['chat', 'multilingual', 'coding', 'multimodal', 'reasoning'],
  // vision_config: image_size 1540 / patch_size 14 = 110，spatial_merge_size 2 → 55 × 55 patch token
  vision_encoder_params: 0.4,
  vision_seq_tokens: 3025,
  links: {
    hf: 'https://huggingface.co/mistralai/Mistral-Small-4-119B-2603',
  },
}
