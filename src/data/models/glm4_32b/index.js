// GLM-4-32B-0414: 32B dense, 128K context
// Released: April 2025
// Source: https://huggingface.co/zai-org/GLM-4-32B-0414
export default {
  id: 'glm4_32b',
  name: 'GLM-4 32B',
  type: 'dense',
  params: 32,
  mla_ratio: null,
  layers: 61,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 6144,
  max_ctx: 131072,
  released: '2025-04',
  links: {
    hf: 'https://huggingface.co/zai-org/GLM-4-32B-0414',
    ms: 'https://modelscope.cn/models/ZhipuAI/GLM-4-32B-0414',
  },
}
