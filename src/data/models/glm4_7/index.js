// GLM-4.7: 355B MoE with 32B active
// Source: https://huggingface.co/zai-org/GLM-4.7/blob/main/config.json
// config: hidden=5120, layers=92, 96Q/8KV, 160 routed experts top-8 + 1 shared, no kv_lora_rank
export default {
  id: 'glm4_7',
  released: '2025-12',
  name: 'GLM-4.7',
  type: 'moe',
  params: 355,
  active_params: 32,
  experts: 160,
  experts_per_token: 8,
  moe_execution: 'shared_routed',
  layers: 92,
  query_heads: 96,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 5120,
  max_ctx: 131072,
  tags: ['chat', 'multilingual'],

  links: {
    ollama: null,
    hf: 'https://huggingface.co/zai-org/GLM-4.7',
    ms: 'https://modelscope.cn/models/ZhipuAI/glm-4.7'
  }
}
