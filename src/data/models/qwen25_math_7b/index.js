// Qwen2.5-Math-7B: same architecture as Qwen2.5-7B, math-specialized, 4K ctx
// Source: https://huggingface.co/Qwen/Qwen2.5-Math-7B/blob/main/config.json
export default {
  id: 'qwen25_math_7b',
  released: '2024-09',
  name: 'Qwen2.5-Math-7B',
  type: 'dense',
  params: 7.6,
  layers: 28,
  kv_heads: 4,
  head_dim: 128,
  hidden_size: 3584,
  max_ctx: 4096,
  links: {
    hf: 'https://huggingface.co/Qwen/Qwen2.5-Math-7B-Instruct',
    ms: 'https://modelscope.cn/models/Qwen/Qwen2.5-Math-7B-Instruct',
    ollama: 'https://ollama.com/library/qwen2.5-math:7b',
  },
}
