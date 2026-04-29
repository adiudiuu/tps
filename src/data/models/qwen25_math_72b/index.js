// Qwen2.5-Math-72B: same architecture as Qwen2.5-72B, optimized for math, 4K ctx
// Source: https://huggingface.co/Qwen/Qwen2.5-Math-72B/blob/main/config.json
export default {
  id: 'qwen25_math_72b',
  released: '2024-09',
  name: 'Qwen2.5-Math-72B',
  type: 'dense',
  params: 72.7,
  layers: 80,
  kv_heads: 8,
  head_dim: 128,
  hidden_size: 8192,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen2.5-Math-72B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen2.5-Math-72B',
    ollama: 'https://ollama.com/library/qwen2.5-math',
  },
}
