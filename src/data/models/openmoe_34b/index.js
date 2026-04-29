// OpenMoE 34B: Open-source MoE research model
// Source: https://github.com/XueFuzhao/OpenMoE
export default {
  id: 'openmoe_34b',
  released: '2024-02',
  name: 'OpenMoE 34B',
  type: 'moe',
  params: 34,
  active_params: 6.5,
  experts: 8,
  experts_per_token: 2,
  layers: 48,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 4096,
  links: {
    ollama: null,
    hf: 'https://huggingface.co/OrionZheng/openmoe-34b',
    ms: null
  }
}
