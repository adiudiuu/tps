// GLM-4.7: 355B MoE with 32B active, improved coding and reasoning
// Source: https://huggingface.co/zai-org/GLM-4.7
export default {
  id: 'glm4_7',
  released: '2025-12',
  name: 'GLM-4.7',
  type: 'moe',
  params: 355,
  active_params: 32,
  experts: 64,
  experts_per_token: 6,
  layers: 60,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 131072,
  links: {
    ollama: null,
    hf: 'https://huggingface.co/zai-org/GLM-4.7',
    ms: 'https://modelscope.cn/models/ZhipuAI/glm-4.7'
  }
}
