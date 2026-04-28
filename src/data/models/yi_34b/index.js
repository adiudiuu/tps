export default {
  id: 'yi_34b',
  released: '2023-11',
  name: 'Yi 34B',
  type: 'dense',
  params: 34,
  layers: 60,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 7168,
  max_ctx: 200000,
  links: {
    ollama: 'ollama pull yi:34b',
    hf: 'https://huggingface.co/01-ai/Yi-34B',
    ms: 'https://modelscope.cn/models/01ai/Yi-34B',
  },
}
