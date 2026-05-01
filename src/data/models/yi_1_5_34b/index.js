// Yi-1.5 34B: 01.AI updated Yi series, 4K→200K ctx
// Source: https://huggingface.co/01-ai/Yi-1.5-34B
export default {
  id: 'yi_1_5_34b',
  released: '2024-05',
  name: 'Yi-1.5 34B',
  type: 'dense',
  params: 34.4,
  layers: 60,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 7168,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/01-ai/Yi-1.5-34B',
    ms: 'https://modelscope.cn/models/01ai/Yi-1.5-34B',
    ollama: 'ollama pull yi:34b',
  },
}
