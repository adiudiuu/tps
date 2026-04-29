// Yi-Coder 9B: dense, 48 layers, 128K ctx
// Source: https://huggingface.co/01-ai/Yi-Coder-9B/blob/main/config.json
export default {
  id: 'yi_coder_9b',
  released: '2024-09',
  name: 'Yi-Coder 9B',
  type: 'dense',
  params: 8.8,
  layers: 48,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 131072,
  links: {
    hf: 'https://huggingface.co/01-ai/Yi-Coder-9B',
    ms: 'https://modelscope.cn/models/01ai/Yi-Coder-9B',
  },
}
