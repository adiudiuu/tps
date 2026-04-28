// GLM-4-9B-0414: 9B dense, 128K context
// Released: April 2025
// Source: https://huggingface.co/zai-org/GLM-Z1-9B-0414
export default {
  id: 'glm4_9b',
  name: 'GLM-4 9B',
  type: 'dense',
  params: 9,
  mla_ratio: null,
  layers: 40,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  released: '2025-04',
  links: {
    hf: 'https://huggingface.co/zai-org/GLM-Z1-9B-0414',
    ms: 'https://modelscope.cn/models/ZhipuAI/glm-4-9b-chat',
  },
}
