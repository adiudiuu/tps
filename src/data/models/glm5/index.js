// GLM-5: 744B MoE, 40B active, 256 experts (8 active), 200K context, GlmMoeDSA architecture
// Released: February 2026
// Source: https://huggingface.co/zai-org/GLM-5
export default {
  id: 'glm5',
  name: 'GLM-5',
  type: 'moe',
  params: 744,
  active_params: 40,
  experts: 256,
  experts_per_token: 8,
  mla_ratio: null,
  layers: 78,
  kv_heads: 64,
  head_dim: 64,
  hidden_size: 6144,
  max_ctx: 200000,
  released: '2026-02',
  links: {
    hf: 'https://huggingface.co/zai-org/GLM-5',
  },
}
