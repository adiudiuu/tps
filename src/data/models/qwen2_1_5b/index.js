// Qwen2 1.5B: compact efficient model
// Released: June 2024
// Source: https://huggingface.co/Qwen/Qwen2-1.5B
export default {
  id: 'qwen2_1_5b',
  released: '2024-06',
  name: 'Qwen2 1.5B',
  type: 'dense',
  params: 1.5,
  layers: 28,
  kv_heads: 2,
  head_dim: 64,
  hidden_size: 1536,
  max_ctx: 32768,
  links: {
    ollama: 'ollama pull qwen2:1.5b',
    hf: 'https://huggingface.co/Qwen/Qwen2-1.5B',
    ms: 'https://modelscope.cn/models/qwen/Qwen2-1.5B',
  },
}
