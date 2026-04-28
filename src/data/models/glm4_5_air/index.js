// GLM-4.5-Air: 106B MoE, 12B active, 128 experts (8 active), 128K context
// Released: July 2025
// Source: https://huggingface.co/zai-org/GLM-4.5-Air
export default {
  id: 'glm4_5_air',
  name: 'GLM-4.5 Air',
  type: 'moe',
  params: 106,
  active_params: 12,
  mla_ratio: null,
  layers: 46,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  released: '2025-07',
  links: {
    hf: 'https://huggingface.co/zai-org/GLM-4.5-Air',
  },
}
