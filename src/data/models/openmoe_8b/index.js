// OpenMoE 8B: Open-source MoE research model
// Source: https://huggingface.co/OrionZheng/openmoe-8b
export default {
  id: 'openmoe_8b',
  released: '2023-11',
  name: 'OpenMoE 8B',
  type: 'moe',
  params: 8,
  active_params: 2.2,
  experts: 8,
  experts_per_token: 2,
  layers: 32,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    ollama: null,
    hf: 'https://huggingface.co/OrionZheng/openmoe-8b',
    ms: null
  }
}
