// GLM-4V 9B: vision-language model
// Released: June 2024
// Source: https://huggingface.co/THUDM/glm-4v-9b
export default {
  id: 'glm4v_9b',
  released: '2024-06',
  name: 'GLM-4V 9B',
  type: 'dense',
  params: 9.4,
  layers: 40,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 8192,
  links: {
    hf: 'https://huggingface.co/THUDM/glm-4v-9b',
    ms: 'https://modelscope.cn/models/ZhipuAI/glm-4v-9b',
  },
}
