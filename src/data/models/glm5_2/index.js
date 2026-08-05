// GLM-5.2: 744B MoE / 40B active, IndexShare DSA, 1M context
// Source: https://z.ai/blog/glm-5.2
// Config: https://huggingface.co/zai-org/GLM-5.2/blob/main/config.json
export default {
  id: 'glm5_2',
  released: '2026-06',
  name: 'GLM-5.2 (744B-A40B)',
  type: 'moe',
  params: 744,
  active_params: 40,
  experts: 256,
  experts_per_token: 8,
  moe_execution: 'shared_routed',
  layers: 78,
  kv_heads: 64,
  head_dim: 192,
  hidden_size: 6144,
  max_ctx: 1048576,
  tags: ['chat', 'reasoning', 'coding', 'multilingual'],
  links: {
    hf: 'https://huggingface.co/zai-org/GLM-5.2',
    ms: 'https://modelscope.cn/models/ZhipuAI/GLM-5.2',
  },
}
