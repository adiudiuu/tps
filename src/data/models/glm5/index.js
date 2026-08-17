// GLM-5: 744B MoE, 40B active, 256 experts (8 active), 200K context, GlmMoeDSA architecture
// Released: February 2026
// Source: https://huggingface.co/zai-org/GLM-5
// Config: kv_lora_rank=512, qk_rope_head_dim=64, num_key_value_heads=64, head_dim=64
export default {
  id: 'glm5',
  name: 'GLM-5',
  type: 'moe',
  params: 744,
  active_params: 40,
  experts: 256,
  experts_per_token: 8,
  moe_execution: 'shared_routed',
  mla_ratio: 0.0703,  // MLA latent (512 + 64) / (2 × 64 × 64)
  layers: 78,
  kv_heads: 64,
  head_dim: 64,
  hidden_size: 6144,
  max_ctx: 202752, // HF config max_position_embeddings
  tags: ['chat', 'multilingual'],
  released: '2026-02',
  links: {
    hf: 'https://huggingface.co/zai-org/GLM-5',
  },
}
