// GLM-4.6: 355B MoE, 32B active, 160 experts (8 active), 200K context
// Released: September 2025
// Source: https://huggingface.co/zai-org/GLM-4.6
export default {
  id: 'glm4_6',
  name: 'GLM-4.6',
  type: 'moe',
  params: 355,
  active_params: 32,
  experts: 160,
  experts_per_token: 8,
  mla_ratio: null,
  layers: 92,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 200000,
  released: '2025-09',
  links: {
    hf: 'https://huggingface.co/zai-org/GLM-4.6',
  },
}
