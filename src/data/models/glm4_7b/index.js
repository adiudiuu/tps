// GLM-4 7B: compact version
// Released: June 2024
// Source: https://huggingface.co/THUDM/glm-4-7b
export default {
  id: 'glm4_7b',
  released: '2024-06',
  name: 'GLM-4 7B',
  type: 'dense',
  params: 7.0,
  layers: 32,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/THUDM/glm-4-7b',
    ms: 'https://modelscope.cn/models/ZhipuAI/glm-4-7b',
  },
}
