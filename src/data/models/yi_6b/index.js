// Yi-6B: 32 layers, GQA (32 heads / 4 KV heads), 4K ctx
// Source: https://huggingface.co/01-ai/Yi-6B/blob/main/config.json
export default {
  id: 'yi_6b',
  released: '2023-11',
  name: 'Yi-6B',
  type: 'dense',
  params: 6.0,
  layers: 32,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/01-ai/Yi-6B-Chat',
    ms: 'https://modelscope.cn/models/01ai/Yi-6B-Chat',
    ollama: 'https://ollama.com/library/yi:6b',
  },
}
