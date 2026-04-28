// Qwen3.5-2B: dense, 24 layers, hybrid attention (full every 4 layers), 256K ctx
// Source: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/config.json
export default {
  id: 'qwen35_2b',
  released: '2026-03',
  name: 'Qwen3.5 2B',
  type: 'dense',
  params: 2,
  layers: 24,
  kv_heads: 2,
  head_dim: 256,
  hidden_size: 2048,
  max_ctx: 262144,
  links: {
    ollama: 'ollama pull qwen3.5:2b',
    hf: 'https://huggingface.co/Qwen/Qwen3.5-2B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3.5-2B',
  },
}
