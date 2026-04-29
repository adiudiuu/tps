// Qwen2 0.5B: ultra-compact model
// Released: June 2024
// Source: https://huggingface.co/Qwen/Qwen2-0.5B
export default {
  id: 'qwen2_0_5b',
  released: '2024-06',
  name: 'Qwen2 0.5B',
  type: 'dense',
  params: 0.5,
  layers: 24,
  kv_heads: 2,
  head_dim: 64,
  hidden_size: 896,
  max_ctx: 32768,
  links: {
    ollama: 'ollama pull qwen2:0.5b',
    hf: 'https://huggingface.co/Qwen/Qwen2-0.5B',
    ms: 'https://modelscope.cn/models/qwen/Qwen2-0.5B',
  },
}
