export default {
  id: 'qwen2_7b',
  released: '2024-06',
  name: 'Qwen2 7B',
  type: 'dense',
  params: 7,
  layers: 28,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 3584,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull qwen2:7b',
    hf: 'https://huggingface.co/Qwen/Qwen2-7B',
    ms: 'https://modelscope.cn/models/qwen/Qwen2-7B',
  },
}
