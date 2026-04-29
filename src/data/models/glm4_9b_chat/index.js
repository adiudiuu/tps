// GLM-4 9B Chat: optimized chat version
// Released: June 2024
// Source: https://huggingface.co/THUDM/glm-4-9b-chat
export default {
  id: 'glm4_9b_chat',
  released: '2024-06',
  name: 'GLM-4 9B Chat',
  type: 'dense',
  params: 9.4,
  layers: 40,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull glm4:9b',
    hf: 'https://huggingface.co/THUDM/glm-4-9b-chat',
    ms: 'https://modelscope.cn/models/ZhipuAI/glm-4-9b-chat',
  },
}
