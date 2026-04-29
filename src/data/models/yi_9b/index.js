// Yi 9B: 200K context model
// Released: May 2024
// Source: https://huggingface.co/01-ai/Yi-9B
export default {
  id: 'yi_9b',
  released: '2024-05',
  name: 'Yi 9B',
  type: 'dense',
  params: 9.0,
  layers: 48,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 200000,
  links: {
    ollama: 'ollama pull yi:9b',
    hf: 'https://huggingface.co/01-ai/Yi-9B',
    ms: 'https://modelscope.cn/models/01ai/Yi-9B',
  },
}
