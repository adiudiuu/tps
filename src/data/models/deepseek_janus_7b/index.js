// DeepSeek Janus 7B: larger unified multimodal model
// Released: February 2025
// Source: https://huggingface.co/deepseek-ai/Janus-7B
export default {
  id: 'deepseek_janus_7b',
  released: '2025-02',
  name: 'DeepSeek Janus 7B',
  type: 'dense',
  params: 7.0,
  layers: 30,
  kv_heads: 32,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/deepseek-ai/Janus-7B',
    ms: 'https://modelscope.cn/models/deepseek-ai/Janus-7B',
  },
}
