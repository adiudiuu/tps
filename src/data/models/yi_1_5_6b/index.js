// Yi-1.5 6B: dense, bilingual (EN/CN), 4K ctx
// Source: https://huggingface.co/01-ai/Yi-1.5-6B
export default {
  id: 'yi_1_5_6b',
  released: '2024-05',
  name: 'Yi-1.5 6B',
  type: 'dense',
  params: 6,
  layers: 32,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 4096,
  max_ctx: 4096,
  links: {
    ollama: 'ollama pull yi:6b',
    hf: 'https://huggingface.co/01-ai/Yi-1.5-6B',
  },
}
