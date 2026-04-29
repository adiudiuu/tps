// GLM-4.7-Flash: 30B MoE with 3B active, lightweight deployment
// Source: https://huggingface.co/zai-org/GLM-4.7-Flash
export default {
  id: 'glm4_7_flash',
  released: '2025-12',
  name: 'GLM-4.7-Flash',
  type: 'moe',
  params: 30,
  active_params: 3,
  experts: 16,
  experts_per_token: 2,
  layers: 32,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 3072,
  max_ctx: 131072,
  links: {
    ollama: null,
    hf: 'https://huggingface.co/zai-org/GLM-4.7-Flash',
    ms: 'https://modelscope.cn/models/ZhipuAI/glm-4.7-flash'
  }
}
