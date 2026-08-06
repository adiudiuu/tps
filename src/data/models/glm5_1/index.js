// GLM-5.1: 754B MoE, ~40B active, 256 experts (8 active), 200K context, GlmMoeDSA architecture
// Released: March 2026
// Source: https://huggingface.co/zai-org/GLM-5.1
// Config: kv_lora_rank=512, qk_rope_head_dim=64, num_key_value_heads=64, head_dim=64
export default {
  id: 'glm5_1',
  name: 'GLM-5.1',
  type: 'moe',
  params: 754,
  active_params: 40,
  experts: 256,
  experts_per_token: 8,
  mla_ratio: 0.0703,  // MLA latent (512 + 64) / (2 × 64 × 64)
  layers: 78,
  kv_heads: 64,
  head_dim: 64,
  hidden_size: 6144,
  max_ctx: 200000,
  tags: ['chat', 'multilingual'],
  released: '2026-03',
  links: {
    hf: 'https://huggingface.co/zai-org/GLM-5.1',
  },
}
