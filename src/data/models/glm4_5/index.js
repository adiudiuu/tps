// GLM-4.5: 355B MoE, 32B active, 160 experts (8 active), 128K context
// Released: July 2025
// Source: https://huggingface.co/zai-org/GLM-4.5
export default {
  id: 'glm4_5',
  name: 'GLM-4.5',
  type: 'moe',
  params: 355,
  active_params: 32,
  mla_ratio: null,
  layers: 92,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  released: '2025-07',
  links: {
    hf: 'https://huggingface.co/zai-org/GLM-4.5',
  },
}
