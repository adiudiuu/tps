// Qwen3.5-9B: dense, 32 layers, hybrid attention (full every 4 layers), 256K ctx
// Source: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/config.json
export default {
  id: 'qwen35_9b',
  released: '2026-03',
  name: 'Qwen3.5 9B',
  type: 'dense',
  params: 9,
  layers: 32,
  kv_heads: 4,
  head_dim: 256,
  hidden_size: 4096,
  max_ctx: 262144,
  links: {
    ollama: 'ollama pull qwen3.5:9b',
    hf: 'https://huggingface.co/Qwen/Qwen3.5-9B',
    ms: 'https://modelscope.cn/models/Qwen/Qwen3.5-9B',
  },
}
