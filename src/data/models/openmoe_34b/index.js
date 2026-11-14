// OpenMoE 34B: Open-source MoE research model
// Source: https://github.com/XueFuzhao/OpenMoE
// HF OrionZheng/openmoe-34b config 需登录；未核验 experts。NE 为负时 calc 关闭 EP 节省。
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
  tags: ['chat'],

  links: {
    ollama: null,
    hf: 'https://huggingface.co/OrionZheng/openmoe-34b',
    ms: null
  }
}
