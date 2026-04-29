// GLM-Edge 4B: larger edge device model
// Released: August 2024
// Source: https://huggingface.co/THUDM/glm-edge-4b-chat
export default {
  id: 'glm_edge_4b',
  released: '2024-08',
  name: 'GLM-Edge 4B',
  type: 'dense',
  params: 4.0,
  layers: 32,
  kv_heads: 2,
  head_dim: 128,
  hidden_size: 2560,
  max_ctx: 32768,
  links: {
    hf: 'https://huggingface.co/THUDM/glm-edge-4b-chat',
    ms: 'https://modelscope.cn/models/ZhipuAI/glm-edge-4b-chat',
  },
}
