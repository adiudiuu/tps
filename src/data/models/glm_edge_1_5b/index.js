// GLM-Edge 1.5B: edge device optimized model
// Released: August 2024
// Source: https://huggingface.co/THUDM/glm-edge-1.5b-chat
export default {
  id: 'glm_edge_1_5b',
  released: '2024-08',
  name: 'GLM-Edge 1.5B',
  type: 'dense',
  params: 1.5,
  layers: 28,
  kv_heads: 2,
  head_dim: 64,
  hidden_size: 1536,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/THUDM/glm-edge-1.5b-chat',
    ms: 'https://modelscope.cn/models/ZhipuAI/glm-edge-1.5b-chat',
  },
}
