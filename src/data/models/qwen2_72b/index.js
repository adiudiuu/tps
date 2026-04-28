export default {
  id: 'qwen2_72b',
  released: '2024-06',
  name: 'Qwen2 72B',
  type: 'dense',
  params: 72,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 131072,
  links: {
    ollama: 'ollama pull qwen2:72b',
    hf: 'https://huggingface.co/Qwen/Qwen2-72B',
    ms: 'https://modelscope.cn/models/qwen/Qwen2-72B',
  },
}
